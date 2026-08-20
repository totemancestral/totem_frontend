# TOTEM ANCESTRAL — Architecture Logicielle

Document interne. Reflete l'etat reel du code au 2026-08-14.

## Vue d'ensemble : deux depots

Le produit est reparti sur deux depots aux responsabilites distinctes.

| Depot | Role | Deploiement |
| ----- | ---- | ----------- |
| `totem-project` (frontend) | UI, i18n, auth, parcours, admin, **BFF/proxy** vers le backend (pas de Stripe Checkout local) | Vercel (Next.js) |
| `totem_backend` (backend) | **Moteur de generation** : Stripe Checkout, webhook, file d'attente, pipeline IA, stockage, email de livraison, miroir Supabase | Render (Docker, NestJS) |

Point cle : **le pipeline de generation (texte/image/audio/PDF) s'execute entierement dans le backend NestJS**. Le frontend orchestre le parcours utilisateur et delegue paiement + generation au backend.

## Stack frontend (`totem-project`)

| Domaine   | Technologie                                             |
| --------- | ------------------------------------------------------- |
| Framework | Next.js 16 App Router, React 19                         |
| Langue    | TypeScript strict                                       |
| i18n      | next-intl (fr/en, prefixe `/fr`, `/en`)                 |
| UI        | Tailwind CSS v4, Radix/shadcn, Motion, GSAP, Recharts (admin) |
| Auth/DB   | Supabase (Auth + PostgreSQL + RLS)                      |
| Paiement  | Delegue au backend NestJS uniquement (echec explicite si Nest est down)     |
| Emails    | Resend (formulaire de contact)                          |
| IA Junior | Scoring FETA deterministe dans NestJS               |

## Stack backend (`totem_backend`)

| Domaine   | Technologie                                             |
| --------- | ------------------------------------------------------- |
| Framework | NestJS 11, Express                                      |
| ORM/DB    | Prisma 6 sur PostgreSQL Supabase                        |
| File      | Upstash Redis REST + worker de polling crash-safe (LMOVE/ACK, pas BullMQ) |
| Paiement  | Stripe Checkout + webhook HMAC                          |
| Texte     | Anthropic (Claude)                                      |
| Image/Audio | OpenAI (images + TTS)                                  |
| PDF       | pdf-lib (parchemin multi-page)                          |
| Stockage  | Supabase Storage prive (`totem-deliveries`)            |
| Emails    | Resend (livraison + alertes)                            |

## Flux utilisateur (adulte)

```
Landing -> Parcours (10 questions) -> Compte Supabase -> Choix offre
-> POST /api/checkout (front) : cree la `commande` puis delegue au backend POST /checkout
   (si Nest est down : erreur claire, aucun second Stripe)
-> Paiement Stripe Checkout
-> Webhook Stripe -> /api/webhook-stripe (front, proxy) -> backend POST /webhooks/stripe
-> Worker backend : texte -> image couverture -> image recit -> audio -> PDF
-> Upload Supabase Storage -> miroir tables `commandes`/`oeuvres`/`oeuvre_versions`
-> Email livraison -> Dashboard (espace personnel)
```

## Flux Junior

```
Junior -> compte obligatoire -> 5 questions visuelles -> POST /api/iuvenis_signum/checkout
-> Nest POST /checkout (offer=junior, 9,99 €) -> Stripe
-> retour success -> GET /api/iuvenis_signum/result (revelation seulement si paye)
-> save oeuvre
```

Le scoring FETA Junior vit dans `src/lib/feta-scoring.ts` (copie backend `src/totem/feta-scoring.ts`). La revelation n'est pas renvoyee avant confirmation de paiement.

## Mapping des offres (important)

Deux vocabulaires coexistent et doivent rester synchronises :

| UI / Backend NestJS | Colonne Supabase `commandes.offre` (ENUM `offre_type`) | Prix   |
| ------------------- | ------------------------------------------------------ | ------ |
| `origine`           | `essentiel`                                            | 49 €   |
| `ancestral`         | `signature`                                            | 99 €   |
| `famille`           | `heritage`                                             | 219 €  |
| `junior`            | `junior` (depuis migration 20260720000000)             | 9,99 € |

Le frontend convertit `origine/ancestral/famille` -> `essentiel/signature/heritage` avant tout `insert` dans `commandes`.

## Structure API frontend (routes reelles)

| Route                                  | Role                                          |
| -------------------------------------- | --------------------------------------------- |
| `POST /api/solvens_porta`              | Checkout : cree la commande + delegue au backend |
| `POST /api/checkout`                   | Alias de `solvens_porta`                       |
| `POST /api/webhook-stripe`             | Proxy du webhook Stripe vers le backend        |
| `POST /api/personae_nota`              | Profil utilisateur                             |
| `GET/POST /api/iter_animarum/reponses` | Reponses parcours                              |
| `GET /api/ordo_tabulae`                | Commandes utilisateur                          |
| `GET /api/ordo_tabulae/[id]`           | Commande detail                                |
| `POST /api/ordo_tabulae/complete`      | Finalisation commande (delegue au backend)     |
| `GET /api/opera_artificis`             | Oeuvres utilisateur                            |
| `POST /api/epistula_missa`             | Formulaire de contact (Resend)                 |
| `POST /api/iuvenis_signum/checkout`    | Checkout Junior via Nest `POST /checkout`  |
| `GET /api/iuvenis_signum/result`       | Revelation Junior apres paiement confirme  |
| `GET /api/iuvenis_signum/totems`       | Liste des totems Junior sauvegardes            |
| `POST /api/iuvenis_signum/save`        | Sauvegarde d'un totem Junior                   |
| `POST /api/iuvenis_signum/share`       | Partage d'un totem Junior                      |
| `POST /api/auth/signup`                | Inscription                                    |
| `POST /api/auth/magic-link`            | Magic link                                     |
| `POST /api/auth/recover`               | Reinitialisation mot de passe                  |
| `* /api/fgh55_fh/*`                    | API admin (stats, commandes, oeuvres, utilisateurs, activite, evenements, relancer, relancer-tout) |

## Endpoints backend

| Route                     | Role                                   |
| ------------------------- | -------------------------------------- |
| `POST /checkout`          | Cree une session Stripe Checkout       |
| `POST /orders/complete`   | Finalise une commande                  |
| `GET /orders/session/:id` | Retourne la commande Junior payee       |
| `POST /orders/retry`      | Relance pipeline (admin)               |
| `POST /webhooks/stripe`   | Verifie et traite les webhooks Stripe  |
| `POST /junior/reveal`     | Legacy/compatibilite (non utilise par le flux paye) |
| `GET /totem-assets/:token`| Sert un artefact prive signe           |
| `GET /health/live`        | Healthcheck                            |
| `GET /health/ready`       | Healthcheck de disponibilite           |

## Securite

- Secrets : `.env*` ignores, validation Zod stricte en production (Supabase, Stripe, prix, ADMIN_EMAIL, **TOTEM_BACKEND_URL** requis)
- Webhook : HMAC verifie cote backend via `stripe.webhooks.constructEvent`
- RLS : actif sur toutes les tables applicatives
- Headers : HSTS, CSP (`connect-src` inclut le backend Render + localhost), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate-limit BFF : Upstash Redis si `UPSTASH_REDIS_*` sont poses, sinon in-memory par isolate (documente)
- Admin : controle serveur par role Supabase `user_roles.role = admin` (URL obfusquee `/fgh55_fh`, pas de secret)
- Auth : Bearer token JWT Supabase sur toutes les API sensibles

## Donnees

- **Supabase (applicatif, lu par le frontend)** : `profiles`, `user_roles`, `reponses_parcours`, `commandes`, `oeuvres`, `oeuvre_versions`.
- **Prisma (backend)** : `TotemOrder` (commande payee + etat pipeline), `TotemPipelineError` (erreurs historisees). Le `SupabaseMirrorService` synchronise le backend vers les tables applicatives.

## Legacy / deprecie

- **Cloudflare R2** : retire du stockage de production (le stockage est desormais Supabase Storage cote backend). Les anciens scripts de test sont conserves comme deprecated.
- **APIs SENYCE / OpenAI cote front** : supprimees de la configuration de production (le backend gere image/audio via OpenAI).
- **Edge Functions Supabase** (`supabase/functions/*`) : **deprecated**, voir `supabase/functions/DEPRECATED.md`. Supersedees par Nest.
- **Scripts R2 / pipeline local** (`scripts/test-r2.mjs`, `run-pipeline.mjs`, `test-pdf*.tsx`) : deprecated, non lances par la CI et non utilises en production.
- **`ParchmentPdfDocument`** : apercu HTML dashboard uniquement ; le PDF livre = pdf-lib backend. `@react-pdf/renderer` retire des dependances.

## Dette technique connue

- Scoring FETA : module `src/lib/feta-scoring.ts` copie dans `totem_backend/src/totem/feta-scoring.ts` + vecteurs golden alignes des deux cotes. `totem-v3.ts` reste les prompts/profils.
- Deux vocabulaires d'offres (voir mapping ci-dessus). Catalogue unique : 49 / 99 / 219 / 9,99 € (`offers.ts` / `prices.ts`).
- Workspace pnpm : uniquement ce repo (`totem-parchemin`). Le backend est un depot sibling separe (`../totem_backend`).

## Generation IA V3 — structure reelle

Les specs (Doc 07) decrivent 9 prompts. L'implementation en respecte le fond avec deux choix structurants. Le flux Junior paye ne depend pas d'un appel Claude cote frontend : le scoring et la revelation sont calcules deterministiquement dans NestJS a partir de FETA.

| Flux | Structure reelle | Modele | Fournisseurs |
| ---- | ---------------- | ------ | ------------ |
| Adulte (A1–A5) | **1 appel Claude consolide** (JSON `a1`..`a5`) + fallback deterministe | `claude-opus-4-5` | Texte : Anthropic · Image : **OpenAI gpt-image** · Audio : **OpenAI TTS** (`onyx`) |
| Junior (J1–J4) | **Revelation FETA deterministe** dans NestJS | — | Aucun appel IA dans le flux paye |

- Scoring, archetype et nom ancestral compose sont **deterministes** (imposes par la matrice FETA + tirage seede) ; le flux adulte utilise Claude pour composer les textes, tandis que Junior renvoie le payload calcule apres paiement.
- Les prompts image sont **descriptifs en langage naturel** pour OpenAI gpt-image (le ratio est gere par le parametre `size`, pas par une syntaxe Midjourney `--ar/--stylize/--v`).
- Audio : OpenAI TTS est la solution retenue (pas ElevenLabs). Voir Doc 07 pour l'intention initiale.

## Referentiel des 12 archetypes adultes (source de verite)

Table canonique alignee sur **Doc 12A** et implementee dans le code (`ADULT_ARCHETYPES`). À utiliser comme reference unique.

> Attention : la liste des peuples du **Doc 07 (Prompt A1)** est incoherente avec Doc 12A (ex. Lion=Akan, Elephant=Bantu, Aigle=Maasai…). **Doc 12A et le code font foi.**

| Archetype  | Peuple  | Region             | Element | Qualite       |
| ---------- | ------- | ------------------ | ------- | ------------- |
| Lion       | Yoruba  | Nigeria            | Feu     | Leadership    |
| Lionne     | Maasai  | Kenya / Tanzanie   | Feu     | Protection    |
| Rhinoceros | Zulu    | Afrique du Sud     | Feu     | Determination |
| Crocodile  | Mande   | Mali / Guinee      | Eau     | Gardien       |
| Serpent    | Fon     | Benin              | Eau     | Transformation|
| Dauphin    | Serer   | Senegal            | Eau     | Joie          |
| Elephant   | Akan    | Ghana              | Terre   | Memoire       |
| Baobab     | Wolof   | Senegal            | Terre   | Ancestralite  |
| Zebre      | Ndebele | Afrique du Sud     | Terre   | Equilibre     |
| Perroquet  | Ashanti | Ghana              | Air     | Parole        |
| Aigle      | Dogon   | Mali               | Air     | Vision        |
| Leopard    | Yoruba  | Nigeria            | Ombre   | Grace         |

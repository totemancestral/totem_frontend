# TOTEM ANCESTRAL — Architecture Logicielle

Document interne. Reflete l'etat reel du code au 2026-07-20.

## Vue d'ensemble : deux depots

Le produit est reparti sur deux depots aux responsabilites distinctes.

| Depot | Role | Deploiement |
| ----- | ---- | ----------- |
| `totem-project` (frontend) | UI, i18n, auth, parcours, admin, **BFF/proxy** vers le backend, flux Junior (IA directe + fallback) | Vercel (Next.js) |
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
| Paiement  | Delegue au backend (fallback Stripe Checkout local)     |
| Emails    | Resend (formulaire de contact)                          |
| IA Junior | Claude (Anthropic) en direct + fallback deterministe    |

## Stack backend (`totem_backend`)

| Domaine   | Technologie                                             |
| --------- | ------------------------------------------------------- |
| Framework | NestJS 11, Express                                      |
| ORM/DB    | Prisma 6 sur PostgreSQL Supabase                        |
| File      | File d'attente sur Upstash Redis + worker de polling    |
| Paiement  | Stripe Checkout + webhook HMAC                          |
| Texte     | Anthropic (Claude)                                      |
| Image/Audio | OpenAI (images + TTS)                                  |
| PDF       | pdf-lib (parchemin multi-page)                          |
| Stockage  | Supabase Storage prive (`totem-deliveries`)             |
| Emails    | Resend (livraison + alertes)                            |

## Flux utilisateur (adulte)

```
Landing -> Parcours (10 questions) -> Compte Supabase -> Choix offre
-> POST /api/checkout (front) : cree la `commande` puis delegue au backend POST /checkout
   (fallback Stripe local si le backend echoue)
-> Paiement Stripe Checkout
-> Webhook Stripe -> /api/webhook-stripe (front, proxy) -> backend POST /webhooks/stripe
-> Worker backend : texte -> image couverture -> image recit -> audio -> PDF
-> Upload Supabase Storage -> miroir tables `commandes`/`oeuvres`/`oeuvre_versions`
-> Email livraison -> Dashboard (espace personnel)
```

## Flux Junior

```
Junior -> 5 questions visuelles -> Scoring FETA Junior (front) -> Revelation immediate
-> Textes de partage -> Defi ami
```

Le flux Junior calcule le scoring localement (`src/lib/totem-v3.ts`) et appelle **Claude en direct** (`ANTHROPIC_API_KEY`) pour enrichir la revelation ; sans cle, un fallback deterministe local prend le relais. Une version payante existe via `POST /api/iuvenis_signum/checkout`.

## Mapping des offres (important)

Deux vocabulaires coexistent et doivent rester synchronises :

| UI / Backend NestJS | Colonne Supabase `commandes.offre` (ENUM `offre_type`) | Prix   |
| ------------------- | ------------------------------------------------------ | ------ |
| `origine`           | `essentiel`                                            | 49 €   |
| `ancestral`         | `signature`                                            | 89 €   |
| `famille`           | `heritage`                                             | 199 €  |
| `junior`            | (hors ENUM — stocke en metadata cote oeuvres)          | 9,99 € |

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
| `POST /api/iuvenis_signum`             | Revelation Junior immediate                    |
| `POST /api/iuvenis_signum/checkout`    | Checkout Junior payant                         |
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
| `POST /orders/retry`      | Relance pipeline (admin)               |
| `POST /webhooks/stripe`   | Verifie et traite les webhooks Stripe  |
| `POST /junior`            | Revelation Junior                      |
| `GET /totem-assets/:token`| Sert un artefact prive signe           |
| `GET /health/live`        | Healthcheck                            |
| `GET /health/ready`       | Healthcheck de disponibilite           |

## Securite

- Secrets : `.env*` ignores, validation Zod stricte en production (Supabase, Stripe, prix, ADMIN_EMAIL, **TOTEM_BACKEND_URL** requis)
- Webhook : HMAC verifie cote backend via `stripe.webhooks.constructEvent`
- RLS : actif sur toutes les tables applicatives
- Headers : HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Admin : controle serveur par role Supabase `user_roles.role = admin`
- Auth : Bearer token JWT Supabase sur toutes les API sensibles

## Donnees

- **Supabase (applicatif, lu par le frontend)** : `profiles`, `user_roles`, `reponses_parcours`, `commandes`, `oeuvres`, `oeuvre_versions`.
- **Prisma (backend)** : `TotemOrder` (commande payee + etat pipeline), `TotemPipelineError` (erreurs historisees). Le `SupabaseMirrorService` synchronise le backend vers les tables applicatives.

## Legacy / deprecie

- **Cloudflare R2** : supprime du frontend (le stockage est desormais Supabase Storage cote backend). Plus aucune reference dans le code front.
- **APIs SENYCE / OpenAI cote front** : supprimees de la config env (le backend gere image/audio via OpenAI).
- **Edge Functions Supabase** (`supabase/functions/*`) : conservees comme deployables autonomes mais **supersedees** par le pipeline backend. `generate-junior` reste un miroir du flux Junior frontend.
- **Code legacy TanStack/Vite** (`src/routes/`, `src/router.tsx` s'il subsiste) : exclu du build.

## Dette technique connue

- Logique d'archetypes/scoring FETA dupliquee entre front (`src/lib/totem-v3.ts`) et back (`src/totem/totem-animals.ts`, `totem-v3-pipeline.ts`) — risque de derive (couvert par des tests de contrat).
- Deux vocabulaires d'offres (voir mapping ci-dessus).
- Composant `ParchmentPdfDocument` (@react-pdf/renderer) cote front conserve alors que le PDF livre est genere par le backend (pdf-lib).

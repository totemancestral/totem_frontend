# TOTEM ANCESTRAL - Fonctionnalites MVP

Statuts : `Fait` | `Partiel` | `Placeholder` | `A faire`

## 1. Presentation et navigation

| Fonctionnalite            | Etat    | Notes                                                                            |
| ------------------------- | ------- | -------------------------------------------------------------------------------- |
| Landing page one-pager    | Fait    | Sections : Hero, geste, manifeste, oeuvre, experience, offres, maison, avis, CTA |
| Intro immersive           | Fait    | `IntroExperience` avec `totem_intro_played`                                      |
| Audio ambiant             | Fait    | `AmbientAudio` avec toggle                                                       |
| Modal de visite           | Fait    | `SiteTourModal` guidee                                                           |
| Header responsive         | Fait    | Logo T, switch FR/EN sans reload                                                 |
| Footer                    | Fait    | Liens legaux i18n                                                                |
| Pages legales             | Partiel | Mentions, CGV, confidentialite (FR surtout)                                      |
| FAQ                       | Partiel | Page presente, contenu surtout FR                                                |
| Contact                   | Fait    | API Resend branchee + UI reactive                                                |
| Consentement cookies RGPD | Fait    | `CookieConsent` avec localStorage                                                |
| SEO localise              | Partiel | `html lang` dynamique, metadata FR/EN                                            |

## 2. Internationalisation

| Fonctionnalite               | Etat    | Notes                                  |
| ---------------------------- | ------- | -------------------------------------- |
| Locales FR/EN                | Fait    | `messages/fr.json`, `messages/en.json` |
| Prefixes routes              | Fait    | `/fr/*`, `/en/*`                       |
| Detection locale             | Fait    | Middleware next-intl + Accept-Language |
| Switcher manuel              | Fait    | Header sans rechargement               |
| Traduction landing           | Fait    | Sections principales traduites         |
| Traduction parcours          | Fait    | Questions et UI FR/EN                  |
| Traduction pages secondaires | Partiel | Plusieurs textes hardcodes FR          |
| Automatisation               | Partiel | `next-auto-i18n` present               |

## 3. Parcours conversationnel

| Fonctionnalite           | Etat | Notes                             |
| ------------------------ | ---- | --------------------------------- |
| 10 questions             | Fait | A/B/C/D + champs libres           |
| Progression              | Fait | Barre current/total               |
| Transitions animees      | Fait | Motion                            |
| Champs libres            | Fait | P/S/T/SPECIAL                     |
| Question skippable       | Fait | Q6 canSkip                        |
| Persistance localStorage | Fait | `totem_parcours_v1`               |
| Creation compte apres Q4 | Fait | Auth obligatoire avant offres     |
| Choix offre              | Fait | Pricing dedie mobile              |
| Checkout Stripe          | Fait | `/api/checkout` avec Bearer token |

## 3bis. Totem Junior

| Fonctionnalite             | Etat | Notes                                                       |
| -------------------------- | ---- | ----------------------------------------------------------- |
| Parcours Junior public     | Fait | `/[locale]/iuvenis_signum`, 5 questions visuelles, **compte + Stripe 9,99 €** |
| Scoring FETA Junior        | Fait | Module partagé `feta-scoring.ts` (copie backend)            |
| API Next Junior            | Fait | Checkout via Nest `POST /checkout`, révélation après paiement |
| Edge Function Junior       | Deprecated | `supabase/functions/generate-junior` — ne plus déployer     |
| Backend Junior             | Fait | `totem_backend`, `POST /checkout` offer=junior ; résultat payant via `GET /orders/session/:id` (`/junior/reveal` conservé en legacy) |

## 4. Offres et pricing

| Fonctionnalite                    | Etat    | Notes                                    |
| --------------------------------- | ------- | ---------------------------------------- |
| Trois offres                      | Fait    | Origine 49€, Révélation/Ancestral 99€, Famille 219€ (mapping ENUM essentiel/signature/heritage) |
| Pricing responsive                | Fait    | Teste 430x932                            |
| Catalogue prix                    | Fait    | Constantes `offers.ts` (front) / `prices.ts` (back), identiques |
| Offre Famille multi-destinataires | A faire | Complexite phase 2                       |

## 5. Paiement

| Fonctionnalite             | Etat | Notes                                          |
| -------------------------- | ---- | ---------------------------------------------- |
| Creation Checkout          | Fait | BFF `POST /api/checkout` → Nest `POST /checkout` uniquement |
| Stripe Tax                 | Fait | `automatic_tax: true` (Nest)                                |
| Fallback Stripe local      | Supprime | Si Nest est down : erreur claire, pas de second moteur    |
| Metadata complet           | Fait | reponses, prenom, userId, email, offre, locale |
| Webhook signe              | Fait | HMAC verification avec `constructEvent`        |
| Idempotence webhook        | Fait | Doublon `stripe_session_id`                    |
| Creation commande + oeuvre | Fait | Supabase via webhook                           |
| Email confirmation         | Fait | Resend via webhook                             |
| Upsert reponses            | Fait | Contrainte UNIQUE (user_id, session_id)        |

## 6. Pipeline de generation

> Note (2026-07) : le pipeline de generation (texte/image/audio/PDF) s'execute desormais
> **entierement dans le backend NestJS** (`totem_backend`) : Anthropic pour le texte, OpenAI
> pour image/audio, pdf-lib pour le PDF, Supabase Storage pour le stockage. Le tableau
> ci-dessous decrit les capacites fonctionnelles ; leur implementation vit cote backend.

| Fonctionnalite              | Etat    | Notes                                                           |
| --------------------------- | ------- | --------------------------------------------------------------- |
| Service pipeline            | Fait    | NestJS `TotemWorker` + file Redis crash-safe (LMOVE/ACK)    |
| Retry backoff               | Fait    | 3 tentatives puis statut erreur                             |
| Texte parchemin Claude      | Fait    | Anthropic via backend                                       |
| Image / audio               | Fait    | OpenAI gpt-image + TTS via backend                          |
| Generation PDF              | Fait    | pdf-lib côté backend                                        |
| Stockage                    | Fait    | Supabase Storage `totem-deliveries` (plus de R2 / SENYCE)   |
| SLA 15 minutes              | Partiel | Depend du backend Render                                    |

## 7. Stockage et livraison

| Fonctionnalite              | Etat | Notes                       |
| --------------------------- | ---- | --------------------------- |
| Client R2                   | Supprime | Stockage = Supabase Storage backend |
| Upload fichiers             | Fait     | PNG, MP3, PDF vers Supabase Storage |
| URLs signees PDF            | Fait     | `GET /totem-assets/:token` backend  |
| Mise a jour commande/oeuvre | Fait | URLs + statut livree        |
| Client Resend               | Fait | Client HTTP Resend          |
| Email livraison             | Fait | Template FR/EN              |
| Alerte admin                | Fait | Template erreur             |

## 8. Authentification et espace personnel

| Fonctionnalite                    | Etat | Notes                                   |
| --------------------------------- | ---- | --------------------------------------- |
| Supabase client public            | Fait | Client anon                             |
| Supabase service role             | Fait | Client serveur                          |
| Migrations Auth/RLS               | Fait | Tables + policies                       |
| Magic link                        | Fait | OTP email                               |
| Page auth                         | Fait | signup/signin/magic-link/reset-password |
| Espace personnel                  | Fait | Dashboard avec commandes/oeuvres/profil |
| API commandes                     | Fait | `/api/commandes`                        |
| API oeuvres                       | Fait | `/api/oeuvres`                          |
| API profil utilisateur            | Fait | `/api/personae_nota`                    |
| Protection route admin            | Fait | Garde client-side + redirect            |
| Protection route espace-personnel | Fait | Garde client-side + redirect            |

## 9. Administration

| Fonctionnalite      | Etat     | Notes                                                |
| ------------------- | -------- | ---------------------------------------------------- |
| Page admin          | Fait     | Route obfusquée `/fgh55_fh` (sécurité par obscurité) |
| API commandes admin | Fait     | `/api/fgh55_fh/commandes`                            |
| API stats admin     | Fait     | `/api/fgh55_fh/stats`                                |
| Role admin API      | Fait     | 403 si non admin                                     |
| Garde admin page    | Fait     | Redirect /fr/auth si non connecte                    |
| Graphiques Recharts | Installe | Non utilise (dette technique)                        |
| Relance pipeline    | Fait     | `/api/fgh55_fh/relancer` + bouton admin              |

## 10. Securite

| Fonctionnalite       | Etat | Notes                                                |
| -------------------- | ---- | ---------------------------------------------------- |
| Secrets non suivis   | Fait | `.env*` ignores                                      |
| Validation env Zod   | Fait | Schema strict en production                          |
| Headers securite     | Fait | HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy |
| Webhook HMAC         | Fait | `stripe.webhooks.constructEvent`                     |
| RLS                  | Fait | Toutes tables sensibles                              |
| Bandeau cookies RGPD | Fait | `CookieConsent`                                      |
| CSP                  | Fait | Supabase, Stripe, backend Render (`TOTEM_BACKEND_URL`) |
| Rate-limit BFF       | Fait | Upstash Redis si configure, sinon in-memory par isolate |

## 11. Tests et CI

| Fonctionnalite    | Etat    | Notes            |
| ----------------- | ------- | ---------------- |
| Tests unitaires   | Partiel | Vitest : scoring FETA, extraction, mapping (front + backend) |
| CI GitHub Actions | Fait    | `.github/workflows/ci.yml` (type-check, tests, build) sur les 2 repos |
| .env.example      | Fait    | Cree dans racine |
| README.md         | Fait    | Front + backend  |

## 12. Dette technique

| Element                                          | Etat                                       |
| ------------------------------------------------ | ------------------------------------------ |
| Documentation features.md                        | A jour                                     |
| Documentation Architecture.md                    | A jour                                     |
| Logique archetypes/scoring dupliquee front/back  | Reduit (module `feta-scoring.ts` + copie backend + golden tests) |
| Deux vocabulaires d'offres (mapping)             | Present (helper centralise, 49/99/219/9,99)  |
| ParchmentPdfDocument (HTML dashboard)            | Present (PDF livre = pdf-lib backend)        |
| Client R2 / SENYCE / Edge Functions              | Deprecated (voir Architecture.md)            |
| Fallback Stripe local BFF                        | Supprime                                     |
| pnpm-workspace `totem_backend` hors repo         | Corrige (deux depots separes)                |

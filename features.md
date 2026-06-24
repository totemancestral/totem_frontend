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

## 4. Offres et pricing

| Fonctionnalite                    | Etat    | Notes                                    |
| --------------------------------- | ------- | ---------------------------------------- |
| Trois offres                      | Fait    | Origine 49€, Ancestral 89€, Famille 199€ |
| Pricing responsive                | Fait    | Teste 430x932                            |
| Mapping Stripe Price IDs          | Fait    | `STRIPE_PRICE_*` env vars                |
| Offre Famille multi-destinataires | A faire | Complexite phase 2                       |

## 5. Paiement

| Fonctionnalite             | Etat | Notes                                          |
| -------------------------- | ---- | ---------------------------------------------- |
| Creation Checkout          | Fait | `/api/checkout` Stripe Checkout + metadata     |
| Stripe Tax                 | Fait | `automatic_tax: true`                          |
| Metadata complet           | Fait | reponses, prenom, userId, email, offre, locale |
| Webhook signe              | Fait | HMAC verification avec `constructEvent`        |
| Idempotence webhook        | Fait | Doublon `stripe_session_id`                    |
| Creation commande + oeuvre | Fait | Supabase via webhook                           |
| Email confirmation         | Fait | Resend via webhook                             |
| Upsert reponses            | Fait | Contrainte UNIQUE (user_id, session_id)        |

## 6. Pipeline de generation

| Fonctionnalite              | Etat    | Notes                                                           |
| --------------------------- | ------- | --------------------------------------------------------------- |
| Service pipeline            | Fait    | `generateCoffret` complet                                       |
| Retry backoff               | Fait    | 1s/3s avec retry 2                                              |
| Texte parchemin Claude      | Fait    | `callClaudeForTexte` via Anthropic API (ton mystique/ancestral) |
| API Texte SENYCE            | Fait    | Fallback si Claude indisponible                                 |
| API Image SENYCE            | Fait    | POST avec retry + download -> R2                                |
| API Audio SENYCE            | Fait    | POST avec retry + download -> R2                                |
| Parallelisation image/audio | Fait    | Promise.all                                                     |
| Generation PDF              | Fait    | Parchemin + Certificat avec @react-pdf/renderer                 |
| Erreurs pipeline            | Fait    | Table `erreurs_pipeline` + alertes admin                        |
| Telechargement assets -> R2 | Fait    | URLs SENYCE -> R2 pour stockage persistant                      |
| SLA 15 minutes              | Partiel | Depend du backend (timeout Vercel)                              |

## 7. Stockage et livraison

| Fonctionnalite              | Etat | Notes                       |
| --------------------------- | ---- | --------------------------- |
| Client R2                   | Fait | `getR2Client` S3 compatible |
| Upload fichiers             | Fait | PNG, MP3, PDF vers R2       |
| URLs signees PDF            | Fait | 30 jours expiration         |
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
| API profiles                      | Fait | `/api/profiles`                         |
| Protection route admin            | Fait | Garde client-side + redirect            |
| Protection route espace-personnel | Fait | Garde client-side + redirect            |

## 9. Administration

| Fonctionnalite      | Etat     | Notes                                                |
| ------------------- | -------- | ---------------------------------------------------- |
| Page admin          | Fait     | Route obfusquée `/fgh55_fh` (sécurité par obscurité) |
| API commandes admin | Fait     | `/api/admin/commandes`                               |
| API stats admin     | Fait     | `/api/fgh55_fh/stats`                                |
| Role admin API      | Fait     | 403 si non admin                                     |
| Garde admin page    | Fait     | Redirect /fr/auth si non connecte                    |
| Graphiques Recharts | Installe | Non utilise (dette technique)                        |
| Relance pipeline    | A faire  | Phase 2                                              |

## 10. Securite

| Fonctionnalite       | Etat | Notes                                                |
| -------------------- | ---- | ---------------------------------------------------- |
| Secrets non suivis   | Fait | `.env*` ignores                                      |
| Validation env Zod   | Fait | Schema strict en production                          |
| Headers securite     | Fait | HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy |
| Webhook HMAC         | Fait | `stripe.webhooks.constructEvent`                     |
| RLS                  | Fait | Toutes tables sensibles                              |
| Bandeau cookies RGPD | Fait | `CookieConsent`                                      |
| CSP                  | Fait | Supabase, Stripe, Resend, R2 whitelisted             |

## 11. Tests et CI

| Fonctionnalite    | Etat    | Notes            |
| ----------------- | ------- | ---------------- |
| Tests unitaires   | A faire | 0 fichier        |
| CI GitHub Actions | A faire | Absent           |
| .env.example      | Fait    | Cree dans racine |
| README.md         | A faire |                  |

## 12. Dette technique

| Element                                        | Etat                                 |
| ---------------------------------------------- | ------------------------------------ |
| Documentation features.md                      | A jour                               |
| Documentation Architecture.md                  | A mettre a jour                      |
| Code legacy TanStack src/routes/               | Present (exclu du build)             |
| local-auth.ts                                  | Present (non importe dans flux prod) |
| Double lockfile (package-lock.json + bun.lock) | Present                              |
| recharts installe sans usage                   | Present                              |

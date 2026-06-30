# TOTEM ANCESTRAL — Architecture Logicielle

Document interne. Reflete l'état réel du code au 2026-06-30.

## Stack

| Domaine   | Technologie                                                |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 16 App Router, React 19                            |
| Langue    | TypeScript strict                                          |
| i18n      | next-intl (fr/en, préfixe `/fr`, `/en`)                    |
| UI        | Tailwind CSS v4, Radix/shadcn, Motion, GSAP                |
| Auth/DB   | Supabase (Auth + PostgreSQL + RLS)                         |
| Paiement  | Stripe Checkout + Stripe Tax + Webhook                     |
| Stockage  | Cloudflare R2 (S3-compatible)                              |
| Emails    | Resend                                                     |
| PDF       | @react-pdf/renderer                                        |
| IA        | Claude (Anthropic) + Edge Functions Supabase + APIs SENYCE |
| Backend   | NestJS orchestrateur optionnel dans `backend/TOTEM`        |

## Flux utilisateur

```
Landing → Parcours (4 questions) → Compte → Choix offre → Checkout Stripe
→ Reprise questions (6 restantes) → Webhook → Pipeline IA → R2 → Email livraison
→ Dashboard espace personnel
```

```
Junior → 5 choix visuels → Scoring FETA Junior → Révélation immédiate
→ Textes de partage → Défi ami
```

## Modules — état réel

| Module               | Statut | Notes                                                                                                                                  |
| -------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Présentation         | Fait   | Landing immersive, intro, audio ambiant, header FR/EN, footer, pages légales, contact (Resend), FAQ, SEO localisé                      |
| Questionnaire        | Fait   | 10 questions, transitions Motion, localStorage, reprise après compte                                                                   |
| Paiement Stripe      | Fait   | `/api/checkout` (alias `solvens_porta`), Stripe Tax, metadata, webhook HMAC + idempotence                                              |
| Pipeline IA          | Fait   | Scoring FETA V3, prompts adultes A1-A5, texte Claude/Edge/SENYCE, image + audio, PDF, Upload R2, Email livraison, erreurs pipeline     |
| Formule Junior       | Fait   | Route `/[locale]/iuvenis_signum`, API `/api/iuvenis_signum`, Edge Function `generate-junior`, endpoint backend `POST /junior`           |
| Stockage & livraison | Fait   | Upload R2, URLs signées PDF (7j max R2), templates email FR/EN                                                                         |
| Auth & espace        | Fait   | Supabase Auth, magic link, signup/signin/reset, dashboard commandes/oeuvres/profil, RLS                                                |
| Administration       | Fait   | Route obfusquée `/fgh55_fh`, rôles Supabase `user_roles`, stats, commandes, oeuvres, utilisateurs, activité, erreurs, relance pipeline |
| i18n                 | Fait   | FR/EN, catalogues à jour selon `npm run i18n:check`                                                                                    |

## Sécurité

- Secrets : `.env*` ignorés, validation Zod stricte en production (Stripe, Supabase, R2, Resend, ADMIN_EMAIL requis)
- Webhook : HMAC vérifié via `stripe.webhooks.constructEvent`
- RLS : actif sur toutes les tables
- Headers : HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Admin : contrôle serveur par rôle Supabase `user_roles.role = admin`
- Auth : Bearer token JWT Supabase sur toutes les API sensibles

## Structure API

| Route                                  | Rôle                                     |
| -------------------------------------- | ---------------------------------------- |
| `POST /api/solvens_porta`              | Création session Stripe Checkout         |
| `POST /api/checkout`                   | Alias de solvens_porta                   |
| `POST /api/webhook-stripe`             | Webhook Stripe (commande + email)        |
| `POST /api/strix_nuntius`              | Webhook Stripe (nom latin, même logique) |
| `POST /api/arca_generatrix`            | Relance pipeline (admin)                 |
| `POST /api/personae_nota`              | Profil utilisateur                       |
| `GET/POST /api/iter_animarum/reponses` | Réponses parcours                        |
| `POST /api/ordo_tabulae/complete`      | Finalisation commande                    |
| `GET /api/ordo_tabulae`                | Commandes utilisateur                    |
| `GET /api/ordo_tabulae/[id]`           | Commande détail                          |
| `GET /api/opera_artificis`             | Oeuvres utilisateur                      |
| `POST /api/epistula_missa`             | Contact form                             |
| `POST /api/iuvenis_signum`             | Révélation Junior immédiate              |
| `POST /api/fgh55_fh/stats`             | Stats admin                              |
| `GET /api/fgh55_fh/commandes`          | Toutes commandes (admin)                 |
| `GET /api/fgh55_fh/oeuvres`            | Toutes oeuvres (admin)                   |
| `GET /api/fgh55_fh/utilisateurs`       | Tous utilisateurs (admin)                |
| `GET /api/fgh55_fh/activite`           | Activité (admin)                         |
| `GET /api/fgh55_fh/evenements`         | Événements (admin)                       |
| `POST /api/fgh55_fh/relancer`          | Relance pipeline (admin)                 |

## Pipeline de génération

1. **Profil V3** : scoring FETA adulte, archétype parmi 12, nom ancestral composé, titre d'oeuvre, variantes narrative/visuelle
2. **Texte** : prompt A2 V3 via Claude direct → Edge Function Supabase → SENYCE API → fallback local
3. **Image + Audio** : parallélisés, prompt visuel A4 + script audio A3, Edge Functions → SENYCE API
4. **PDF** : Parchemin + Certificat via @react-pdf/renderer
5. **Upload R2** : PDF → signed URL, image/audio → URL publique
6. **Mise à jour** : statut `livree` seulement si PDF uploadé
7. **Email** : confirmation + livraison via Resend (FR/EN)

## Pipeline Junior

1. **Entrée** : cinq réponses A/B/C/D, prénom optionnel non stocké
2. **Scoring** : matrice FETA Junior locale, attribution parmi 12 totems
3. **Identité** : nom ancestral composé, phrase d'identité, attribut, message Clan et textes de partage
4. **IA optionnelle** : cascade Claude J1-J4 si `ANTHROPIC_API_KEY` est disponible
5. **Fallback** : génération déterministe locale si l'IA est absente ou indisponible
6. **Déploiement alternatif** : Edge Function Supabase `generate-junior` et backend Nest `POST /junior`

## Dette technique connue

- Code legacy TanStack/Vite dans `src/routes/`, `src/router.tsx` — exclu du build via tsconfig
- Assets dupliqués entre `src/assets/` et `public/assets/`
- Variables d'environnement optionnelles en dev (stricte en prod)

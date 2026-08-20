# TOTEM ANCESTRAL

Frontend Next.js de TOTEM Ancestral. Le moteur de génération IA vit dans le dépôt sibling `../totem_backend` (NestJS). Les deux dépôts sont **séparés** : ne pas les relier via `pnpm-workspace.yaml`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, next-intl (FR/EN), Supabase (Auth + PostgreSQL + RLS), Resend (contact). Paiement Stripe et pipeline (texte/image/audio/PDF) : **uniquement** le backend NestJS.

## Catalogue

Constantes dans `src/lib/offers.ts` (doit rester identique à `totem_backend/src/totem/prices.ts`) :

| UI / Nest     | ENUM `commandes.offre` | Prix    |
| ------------- | ---------------------- | ------- |
| origine       | essentiel              | 49 €    |
| ancestral     | signature              | 99 €    |
| famille       | heritage               | 219 €   |
| junior        | junior                 | 9,99 €  |

## Démarrage

```bash
cp .env.example .env.local   # remplir les valeurs
pnpm install
pnpm dev                      # http://localhost:3000/fr
```

`TOTEM_BACKEND_URL` est requis en production. Sans backend, le checkout échoue clairement (pas de Stripe local de secours).

## Scripts

| Commande             | Description                 |
| -------------------- | --------------------------- |
| `pnpm dev`           | Développement               |
| `pnpm build`         | Build production            |
| `pnpm type-check`    | TypeScript                  |
| `pnpm lint`          | ESLint + Prettier           |
| `pnpm test`          | Vitest                      |
| `pnpm i18n:sync`     | Synchronisation traductions |

## Architecture

- `src/app/` — Routes Next.js App Router
- `src/app/api/` — BFF (proxy checkout/webhook vers Nest, Supabase, Junior, admin)
- `src/lib/offers.ts` — catalogue prix
- `src/lib/feta-scoring.ts` — scoring FETA (copie dans le backend)
- `src/lib/totem-v3.ts` — prompts/profils V3
- `supabase/migrations/` — Schéma et RLS

Voir `Architecture.md` pour le détail.

## Flux principal (adulte)

1. Landing → Parcours 10 questions
2. Auth Supabase → Choix offre
3. `/api/checkout` : crée la commande puis **délègue** à Nest `POST /checkout`
4. Paiement Stripe → Webhook proxifié vers Nest
5. Pipeline backend : texte → image → audio → PDF → Supabase Storage → email
6. Dashboard utilisateur

## Flux Junior

Compte obligatoire → 5 questions → `/api/iuvenis_signum/checkout` → Nest `POST /checkout` (9,99 €) → Stripe → révélation **après** paiement (`GET /api/iuvenis_signum/result`).

# TOTEM ANCESTRAL

Plateforme digitale SENYCE PARTNERS — Générateur de coffrets numériques personnalisés par IA.

Ce dépôt est le **frontend** (Next.js). Le moteur de génération IA vit dans le dépôt backend NestJS (`totem_backend`) ; ce frontend orchestre le parcours et **délègue paiement + génération** au backend.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, next-intl (FR/EN), Supabase (Auth + PostgreSQL + RLS), Resend (contact). Le paiement (Stripe) et le pipeline (texte/image/audio/PDF) sont assurés par le backend NestJS.

## Démarrage

```bash
cp .env.example .env.local   # remplir les valeurs
pnpm install
pnpm dev                      # http://localhost:3000/fr
```

## Scripts

| Commande             | Description                 |
| -------------------- | --------------------------- |
| `pnpm dev`           | Développement               |
| `pnpm build`         | Build production            |
| `pnpm type-check`    | TypeScript                  |
| `pnpm lint`          | ESLint + Prettier           |
| `pnpm i18n:sync`     | Synchronisation traductions |

## Architecture

- `src/app/` — Routes Next.js App Router
- `src/app/api/` — API Routes (checkout/proxy Stripe, Supabase, Junior, admin)
- `src/components/` — Composants React
- `src/lib/` — Scoring/archétypes (`totem-v3.ts`), auth serveur, clients (Supabase, Stripe, Resend), env
- `supabase/migrations/` — Schéma et RLS

Voir `Architecture.md` pour le détail (deux dépôts, mapping des offres, endpoints backend, legacy).

## Flux principal (adulte)

1. Landing → Parcours 10 questions
2. Auth Supabase → Choix offre
3. `/api/checkout` : crée la commande puis délègue au backend `POST /checkout` (fallback Stripe local)
4. Paiement Stripe → Webhook proxifié vers le backend
5. Pipeline backend : texte → image → audio → PDF → Supabase Storage → email
6. Dashboard utilisateur : téléchargement des œuvres

## Flux Junior

Parcours visuel de 5 questions → scoring FETA Junior local → révélation immédiate (Claude direct si `ANTHROPIC_API_KEY`, sinon fallback déterministe). Version payante via `/api/iuvenis_signum/checkout`.

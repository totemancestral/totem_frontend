# TOTEM ANCESTRAL

Plateforme digitale SENYCE PARTNERS — Générateur de coffrets numériques personnalisés par IA.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, Supabase, Stripe, @react-pdf/renderer, Cloudflare R2, Brevo.

## Démarrage

```bash
cp .env.example .env.local   # remplir les valeurs
npm install                   # ou bun install
npm run dev                   # http://localhost:3000/fr
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run type-check` | TypeScript |
| `npm run lint` | ESLint + Prettier |
| `npm run i18n:sync` | Synchronisation traductions |

## Architecture

- `src/app/` — Routes Next.js App Router
- `src/app/api/` — API Routes (Stripe, Supabase, Pipeline)
- `src/components/` — Composants React
- `src/lib/services/` — Pipeline IA, PDF, Stockage, Email
- `src/lib/clients/` — Clients Stripe, Supabase, R2, Brevo
- `supabase/migrations/` — Schéma et RLS

## Flux principal

1. Landing → Parcours 10 questions
2. Auth Supabase → Choix offre
3. Paiement Stripe Checkout
4. Webhook → Création commande + oeuvre
5. Pipeline IA : SENYCE → PDF → R2 → Email
6. Dashboard utilisateur : téléchargement des oeuvres

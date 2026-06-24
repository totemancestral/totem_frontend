# Déploiement

## Cible MVP

Le projet est désormais orienté **Next.js App Router sur Vercel**, conformément au document d'architecture.

- Framework Vercel : `nextjs`
- Install command : `npm ci`
- Build command : `npm run build`
- Runtime API : routes `src/app/api/*`
- i18n : routes canoniques `/fr/*` et `/en/*` via `next-intl`

## Développement local

```bash
npm install
npm run dev
```

## Variables d'environnement

Les variables publiques doivent utiliser le préfixe `NEXT_PUBLIC_`.
Les secrets Stripe, Supabase service, Cloudflare R2, Resend et SENYCE APIs doivent rester côté serveur uniquement.

Voir `src/lib/env.ts` pour le schéma typé de référence.

## Ancienne cible

Les fichiers Cloudflare/Lovable/TanStack existants sont conservés comme référence de migration, mais ils ne constituent plus la cible de build MVP.

# Déploiement

## État actuel

Ce projet est configuré pour **Cloudflare Workers** via `wrangler.jsonc` et le preset Lovable (`@lovable.dev/vite-tanstack-config`). Le déploiement par défaut (bouton **Publish** dans Lovable) utilise cette cible et fonctionne immédiatement.

## Déploiement Vercel (manuel)

Un fichier `vercel.json` minimal est fourni, mais **une migration complète vers Vercel demande quelques ajustements manuels** parce que le preset Lovable inclut le plugin Cloudflare en dur :

1. Connecter le repo Git à Vercel.
2. Dans les *Project Settings* Vercel :
   - **Build Command** : `bun run build`
   - **Output Directory** : `.output/public`
   - **Install Command** : `bun install`
3. Pour que les **server functions TanStack** tournent sur Vercel (au lieu de Cloudflare), il faut remplacer la cible de build :
   - Éditer `vite.config.ts` pour passer un preset Nitro `vercel` à TanStack Start.
   - Retirer / désactiver le plugin Cloudflare hérité du preset Lovable.
   - Supprimer ou ignorer `wrangler.jsonc`.
4. Variables d'environnement à reporter dans Vercel (Settings → Environment Variables) :
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (si Lovable Cloud réactivé plus tard)
   - Toute clé serveur ajoutée plus tard (OpenAI, ElevenLabs, Stripe…)

> ⚠️ Tant que ces étapes ne sont pas faites, un déploiement Vercel ne servira que le site statique (les server functions ne tourneront pas). Pour un SaaS complet, **Cloudflare reste la cible la plus simple sur ce stack**.

## Build local

```bash
bun install
bun run build
```

Le build produit `.output/` (Worker + assets statiques dans `.output/public`).
# DEPRECATED — Edge Functions Supabase

Ces fonctions (`generate-texte`, `generate-image`, `generate-audio`, `generate-junior`, `process-pipeline`) sont **supersédées** par le pipeline NestJS (`totem_backend`).

- Ne plus les déployer en production.
- `supabase/deploy-functions.sh` est conservé comme archive, pas exécuté par la CI.
- Le stockage n'est plus Cloudflare R2 : bucket privé Supabase `totem-deliveries`.

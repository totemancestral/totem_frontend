# TOTEM ANCESTRAL — Règles, obligations et contraintes

## Confidentialité

- Secrets jamais exposés côté client
- `.env*` ignorés par Git
- `NEXT_PUBLIC_` réservé aux données publiques

## Architecture

- Monolithe modulaire Next.js App Router sur Vercel
- Logique métier dans `src/lib/services/`
- Appels tiers via clients serveur dans `src/lib/clients/`
- Server Components par défaut; `use client` réservé aux interactions

## Présentation / UX

- Premium, responsive, animations Motion/GSAP
- Intro une fois par session (`totem_intro_played`)
- Changement de langue sans rechargement
- Pas de scroll horizontal mobile

## Internationalisation

- Locales : `fr` (fallback) et `en`
- URLs : `/fr/*`, `/en/*`
- Textes dans `messages/fr.json` et `messages/en.json`

## Parcours questionnaire

- 10 questions, navigation avant/arrière sans perte
- Persistance localStorage (`totem_parcours_v1`)
- Compte obligatoire avant offres (après Q4)
- Transmission des réponses dans metadata Stripe

## Parcours Junior

- 5 questions visuelles A/B/C/D, résultat immédiat sans paiement
- Prénom optionnel utilisé en session uniquement
- Scoring FETA Junior déterministe avant toute génération IA
- Les prompts J1-J4 restent côté serveur et ne sont pas envoyés au client
- Fallback local obligatoire si Claude ou l'Edge Function est indisponible
- Aucun stockage Supabase dédié tant que la formule Junior reste gratuite/virale

## Paiement Stripe

- Stripe Checkout + Stripe Tax (`automatic_tax: true`)
- Price IDs en variables d'environnement
- Metadata compacte : réponses, prénom, userId, email, offre, locale
- Webhook : body brut `request.text()`, HMAC vérifié, idempotent (stripe_session_id)
- Réponse rapide 200, pipeline asynchrone

## Pipeline IA

- Ordre : scoring FETA V3 → prompts A1-A5 → Texte → Image + Audio (parallèle) → PDF → Upload → Email
- Le pipeline adulte local utilise les 12 archétypes, le nom ancestral composé et les variantes narrative/visuelle déterministes par seed commande
- Les prompts complets restent côté serveur et ne sont pas persistés dans les métadonnées client
- Retry : backoff ciblé sur les appels SENYCE et les étapes critiques déjà branchées
- Échec final : statut `erreur`, log `erreurs_pipeline`, alerte admin
- Fallback texte : Claude direct → Edge Function Supabase → SENYCE → contenu local
- Junior : Claude J1-J4 optionnel → fallback déterministe local

## Stockage / Livraison

- Fichiers dans `totems/{commandeId}/{type}/{nom}`
- PDFs : URLs signées (7 jours max R2)
- Images/audio : URLs publiques R2
- Statut `livree` seulement si PDF présent sur R2
- Emails via Resend, templates FR/EN dans le code

## Auth / Autorisation

- Supabase Auth, sessions JWT
- Espace personnel : session valide obligatoire + RLS
- Admin : rôle Supabase `user_roles.role = admin`
- API admin : 403 si rôle admin absent

## Sécurité HTTP

- HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Qualité

- TypeScript strict, validation Zod des entrées API (422 si invalide)
- ESLint + Prettier doivent passer

## Déploiement

- Vercel, branche `main`
- `.env.example` référence, variables requises en production : Supabase, Stripe, R2, Resend, ADMIN_EMAIL

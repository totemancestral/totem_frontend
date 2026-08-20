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

- 5 questions visuelles A/B/C/D, **paiement Stripe 9,99 €** (compte requis)
- Scoring FETA Junior déterministe (`feta-scoring.ts`) après confirmation de paiement
- Aucune génération IA Junior n'est exécutée côté frontend ; scoring et révélation FETA restent dans NestJS
- Persistance : commande `offre=junior` + oeuvre après paiement

## Paiement Stripe

- Stripe Checkout + Stripe Tax (`automatic_tax: true`) via le backend Nest
- Montants via `price_data` (pas de Price IDs) : constantes `offers.ts` / `prices.ts`
- Webhook : body brut `request.text()`, HMAC vérifié côté Nest, proxifié par le BFF
- Réponse rapide 202, pipeline asynchrone
- Pas de second moteur Stripe dans Next si Nest est down

## Pipeline IA

- Ordre : scoring FETA V3 → prompts A1-A5 → Texte → Image + Audio (parallèle) → PDF → Upload → Email
- Le pipeline adulte local utilise les 12 archétypes, le nom ancestral composé et les variantes narrative/visuelle déterministes par seed commande
- Les prompts complets restent côté serveur et ne sont pas persistés dans les métadonnées client
- Retry : 3 tentatives côté worker Redis puis statut `erreur`
- Échec final : statut `erreur`, log `erreurs_pipeline`, alerte admin
- Fallback texte : déterministe si Claude indisponible (backend)
- Junior : révélation FETA déterministe dans NestJS après confirmation du paiement

## Stockage / Livraison

- Fichiers dans `totems/{commandeId}/{type}/{nom}`
- PDFs : URLs signées (7 jours max, Supabase Storage `totem-deliveries`)
- Images/audio : URLs signées via le backend (`GET /totem-assets/:token`)
- Statut `livree` seulement si le PDF est présent dans le bucket Supabase
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
- `.env.example` référence, variables requises en production : Supabase, Stripe, backend Nest, Resend, ADMIN_EMAIL

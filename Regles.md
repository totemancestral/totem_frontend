# TOTEM ANCESTRAL - Regles, obligations et contraintes

Ce fichier centralise les regles obligatoires du projet issues du document d'architecture MVP. Il sert de checklist de gouvernance technique et produit.

## 1. Confidentialite et propriete intellectuelle

- Le projet est strictement confidentiel et reserve a l'equipe technique autorisee.
- Les prompts IA, la logique culturelle, les cles API, les endpoints sensibles et les secrets SENYCE PARTNERS ne doivent jamais etre exposes cote client.
- Aucun secret ne doit etre commite dans le repository.
- Les fichiers `.env`, `.env.local`, `.env.*` et `.vercel` doivent rester ignores par Git.
- Les variables prefixees `NEXT_PUBLIC_` sont strictement reservees aux donnees publiquement exposables.

Etat actuel : conforme pour Git local observe, car `.env` et `.env.local` ne sont pas suivis. A maintenir.

## 2. Regles d'architecture

- L'application est un monolithe modulaire Next.js App Router deploye sur Vercel.
- Les frontieres de modules doivent rester claires : presentation, questionnaire, paiement, pipeline, stockage/livraison, auth/espace personnel, admin.
- Les appels aux services tiers doivent passer par des clients serveur dans `src/lib/clients`.
- La logique metier doit etre isolee dans `src/lib/services` autant que possible.
- Les composants client ne doivent contenir ni secret, ni prompt, ni acces direct service-role Supabase.
- Les Server Components sont le choix par defaut; `use client` doit etre reserve aux interactions, hooks, animations et etats locaux.

## 3. Regles de presentation et UX

- Le site doit etre premium, immersif, responsive mobile/tablette/desktop.
- L'introduction ne doit se jouer qu'une fois par session avec la cle `totem_intro_played`.
- Le retour vers l'accueil depuis le site ne doit pas relancer l'intro si elle a deja ete vue pendant la session.
- Le changement de langue doit se faire sans rechargement complet perceptible.
- Toutes les pages publiques doivent demarrer en haut lors d'une navigation.
- Les pages et composants doivent eviter tout debordement horizontal mobile.
- Les controles attendus doivent rester accessibles : bouton audio, navigation, CTA, modal de visite, choix d'offre.
- Les textes visibles doivent etre en francais ou en anglais selon la locale active.

Etat actuel : globalement respecte sur accueil/parcours; pages secondaires encore a internationaliser completement.

## 4. Regles d'internationalisation

- Locales MVP : `fr` et `en`.
- URLs obligatoires : `/fr/*` et `/en/*`.
- Fallback : `fr`.
- La detection automatique de langue doit utiliser le middleware et `Accept-Language`, puis le cookie `NEXT_LOCALE` si present.
- Tous les textes applicatifs doivent etre extraits dans `messages/fr.json` et `messages/en.json` ou dans une configuration locale equivalente.
- L'ajout de nouvelles langues doit se faire sans refonte applicative.

Etat actuel : `next-intl` est en place; le switcher fonctionne via `router.replace`; les pages secondaires ont encore des textes/metadonnees en dur.

## 5. Regles du parcours questionnaire

- Le parcours doit collecter dix reponses structurees.
- L'utilisateur doit pouvoir revenir en arriere sans perte de donnees.
- L'etat doit survivre a un rechargement accidentel.
- Une reponse valide est requise avant de passer a l'etape suivante, sauf question explicitement skippable.
- Les reponses ne sont pas persistées en base avant paiement dans l'architecture cible initiale.
- La transmission au paiement doit serialiser les reponses de maniere compacte pour respecter les limites de metadata Stripe.

Point a arbitrer : le document initial place le choix d'offre apres la dixieme question. Le produit actuel le place apres la quatrieme question, avant les sept questions restantes. Cette regle doit etre officiellement mise a jour si ce flux est definitif.

## 6. Regles de paiement Stripe

- Stripe Checkout doit etre utilise pour le paiement international.
- Stripe Tax doit etre active avec `automatic_tax: { enabled: true }`.
- Les offres cibles sont : Origine, Ancestral, Famille.
- Les Price IDs doivent venir des variables d'environnement serveur.
- Les reponses, la locale et l'offre doivent etre injectees dans les metadata Stripe de maniere compacte.
- Le webhook Stripe doit lire le body brut avec `request.text()`.
- Toute signature webhook doit etre verifiee avec `stripe.webhooks.constructEvent`.
- Tout traitement webhook doit etre idempotent via identifiant Stripe unique.
- Le webhook doit repondre rapidement `200 OK` a Stripe et declencher le pipeline sans bloquer inutilement la reponse.

Etat actuel : non respecte fonctionnellement; routes presentes mais Stripe Checkout et verification webhook ne sont pas encore branches.

## 7. Regles du pipeline IA

- Pipeline cible : API Texte -> API Image -> API Audio -> PDF -> Upload/Livraison.
- Les appels Image et Audio peuvent etre executes en parallele apres l'API Texte.
- Timeouts cibles : 60s Texte, 120s Image, 60s Audio.
- Retry exponentiel obligatoire : 3 tentatives avec delais 1s, 3s, 9s.
- En cas d'echec final : statut commande en erreur, insertion dans `erreurs_pipeline`, alerte admin.
- Le SLA livraison est de 15 minutes apres webhook Stripe.
- Les prompts et la logique culturelle doivent rester chez SENYCE PARTNERS ou cote serveur securise.

Etat actuel : non implemente; seul un squelette de retry existe.

## 8. Regles de stockage et livraison

- Tous les livrables doivent etre stockes sur Cloudflare R2.
- Convention cible : `commandes/{commandeId}/image.png`, `audio.mp3`, `parchemin.pdf`, `certificat.pdf`.
- Les PDFs doivent utiliser des URLs signees expirees a 30 jours.
- Les PNG et MP3 peuvent utiliser des URLs permanentes selon la politique R2 retenue.
- Les emails transactionnels doivent etre envoyes via Resend avec templates FR/EN geres cote code.
- La commande ne doit passer a `done`/`livree` que lorsque toutes les URLs necessaires sont persistées.
- La mise a jour finale doit etre atomique autant que possible.

Etat actuel : clients R2/Resend presents; logique d'upload/livraison implementee progressivement.

## 9. Regles d'authentification et d'autorisation

- Supabase Auth est la source des sessions utilisateur.
- L'espace personnel doit etre accessible uniquement avec session valide.
- Un utilisateur ne doit voir que ses propres commandes et livrables.
- Le role admin doit etre verifie au minimum dans le middleware et dans les routes API admin.
- RLS doit etre active sur toutes les tables exposant des donnees utilisateur.
- Les JWT doivent etre stockes de maniere sure, idealement cookies HttpOnly SameSite strict/lax selon l'integration Supabase retenue.

Etat actuel : RLS existe dans les migrations, mais les pages/routes `espace-personnel` et `admin` ne sont pas encore protegees fonctionnellement.

## 10. Regles admin

- L'admin SENYCE PARTNERS doit pouvoir consulter commandes, revenus, pays, langues, devises, statuts.
- L'admin doit voir les erreurs pipeline.
- L'admin doit pouvoir relancer manuellement une commande en erreur.
- Les routes admin doivent retourner `403 Forbidden` si le role admin n'est pas valide.
- Les acces admin doivent etre journalises.

Etat actuel : dashboard et routes admin placeholders.

## 11. Regles de securite HTTP

Headers cibles :

- `X-DNS-Prefetch-Control: on`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` adaptee a Next/Vercel/assets.

Etat actuel : headers partiels; HSTS et CSP ne sont pas encore presents dans `next.config.ts`.

## 12. Regles de performance

- Page d'accueil : chargement initial cible < 3s sur Europe occidentale, US Est, Afrique de l'Ouest en 4G standard.
- Lighthouse Performance cible >= 90 mobile et desktop sur accueil et parcours.
- API routes non-pipeline : temps de reponse cible < 500ms.
- Images optimisees, lazy loading, formats modernes.
- Polices chargees proprement et sans bloquer l'affichage.
- Pas de scroll horizontal mobile.

Etat actuel : build OK et corrections mobile effectuees; Lighthouse et tests geographiques non realises dans le depot.

## 13. Regles de qualite code

- TypeScript strict obligatoire.
- Aucun `any` explicite sans justification.
- Validation des entrees API avec Zod et retour `422` sur payload invalide.
- ESLint et Prettier doivent passer avant push.
- Les composants doivent rester accessibles : aria-label, role dialog, navigation clavier, contrastes suffisants.
- Les tests cibles sont unitaires, integration API et E2E Playwright.

Etat actuel : TypeScript strict et lint existent; `noUnused` est assoupli; aucune suite de tests n'est observee.

## 14. Regles de deploiement et Git

- Branches cibles : `main` production, `staging` recette, `feature/*` preview, `fix/*` correctifs.
- Production : merge sur `main` apres validation SENYCE PARTNERS.
- CI cible : `npm ci`, type-check, lint, tests, preview Vercel.
- Les commits doivent suivre Conventional Commits.
- Ne pas deployer en production sans autorisation explicite.

Etat actuel : deploiements production effectues sur demande explicite; CI/branches protegees non verifies localement.

## 15. Variables d'environnement obligatoires cible

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ORIGINE`
- `STRIPE_PRICE_ANCESTRAL`
- `STRIPE_PRICE_FAMILLE`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `SENYCE_API_TEXTE`
- `SENYCE_API_IMAGE`
- `SENYCE_API_AUDIO`
- `SENYCE_API_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

Etat actuel : le schema Zod les accepte majoritairement comme optionnelles. Pour production MVP, elles doivent devenir obligatoires sauf environnements explicitement mockes.

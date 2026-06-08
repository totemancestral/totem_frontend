# TOTEM ANCESTRAL - Architecture Logicielle MVP

Document interne de reference pour le projet TOTEM ANCESTRAL, client SENYCE PARTNERS. Ce fichier reprend les exigences du document d'architecture fourni et les rapproche de l'etat actuel du depot.

Confidentialite : strictement confidentiel, usage interne uniquement.

## 1. Contexte et objectifs

TOTEM ANCESTRAL est une plateforme web internationale d'experience artistique digitale. Elle propose une oeuvre d'art numerique identitaire assistee par intelligence artificielle : coffret unique, numerote, signe, livre apres paiement.

Objectifs cibles du systeme :

- Orchestrer un pipeline texte -> image -> audio -> PDF apres webhook Stripe, avec livraison sous 15 minutes.
- Exposer une interface immersive, animee, premium et multilingue.
- Integrer Stripe Checkout international, Stripe Tax et conversion devise.
- Stocker les livrables PNG, MP3 et PDF sur Cloudflare R2 avec URLs signees pour les PDFs.
- Proteger les prompts, secrets, cles API et logique proprietaire SENYCE PARTNERS.
- Fournir un espace personnel utilisateur et un tableau de bord admin SENYCE PARTNERS.
- Garder une architecture extensible vers d'autres langues, offres, video et abonnement.

## 2. Architecture globale cible

Style architectural : monolithe modulaire Next.js App Router deploye sur Vercel.

Flux cible :

```text
Navigateur React
  -> Vercel Edge Network + middleware i18n/auth
  -> Next.js App Router /[locale]
  -> API Routes /api/*
  -> Supabase, Stripe, APIs SENYCE, Cloudflare R2, Brevo
```

Principe fondamental : toute logique manipulant des secrets, prompts, cles API, acces base ou appels aux services tiers s'execute exclusivement cote serveur.

## 3. Etat actuel du depot

Etat observe au 2026-06-08 :

- Framework : Next.js 16 App Router, React 19, TypeScript strict.
- i18n : `next-intl` avec locales `fr` et `en`, prefixe obligatoire `/fr` et `/en`.
- UI : Tailwind CSS v4, Radix/shadcn disponibles, Motion, GSAP installe.
- Landing page : refonte avancee, intro video, audio ambiant, modal de visite, sections narratives, navigation FR/EN sans rechargement complet.
- Parcours : 10 questions presentes, etat local persiste dans `localStorage`, parcours actuel en 4 questions -> creation compte -> choix offre -> questions restantes.
- Paiement : route `/api/checkout` presente mais retourne encore `501`; Stripe Checkout non branche.
- Webhook Stripe : route presente, lecture signature, mais verification HMAC et traitement commande non branches.
- Pipeline : services et route presents, mais `generateCoffret`, PDF, R2, Brevo sont encore placeholders.
- Supabase : clients et migrations existent, RLS existe dans les migrations, mais le schema actuel diverge du schema cible du document.
- Espace personnel et admin : pages et routes API presentes, mais interfaces encore placeholders.
- Deploiement : Vercel configure et production deja deployee.

## 4. Modules applicatifs

### M1 - Presentation

Responsabilite cible : site vitrine, navigation, internationalisation, animations, SEO, pages legales, contact.

Exigences principales :

- Routes localisees `/fr/*` et `/en/*`.
- Detection locale par middleware avec fallback `fr`.
- Header avec changement de langue sans rechargement complet.
- Intro jouee une fois par session.
- Sections narratives, offres, FAQ, contact, pages legales.
- Formulaire contact valide par Zod et transmis a Brevo.

Etat actuel : partiellement conforme.

- Conforme : routes localisees, next-intl, header FR/EN, intro sessionStorage, landing page, assets, pages principales.
- Partiel : plusieurs pages secondaires restent avec textes et metadonnees en francais en dur.
- Non conforme : formulaire contact ne transmet pas encore a Brevo; cookies/RGPD et journalisation consentement non verifies; GSAP ScrollTrigger pas confirme comme mecanisme principal.

### M2 - Questionnaire conversationnel

Responsabilite cible : collecte des 10 reponses, validation, progression, persistance session, transmission au paiement.

Exigences principales :

- 10 questions avec transitions animees.
- Navigation precedent/suivant sans perte.
- Persistance navigateur.
- Validation avant passage a l'etape suivante.
- Transmission des reponses au module paiement.

Etat actuel : partiellement conforme.

- Conforme : 10 questions, transitions, progression, persistance navigateur, responsive mobile corrige, FR/EN integre dans les messages.
- Difference produit : le flux actuel demande le choix d'offre apres la 4e question, puis reprend les questions restantes. Le document initial place le choix d'offre apres la 10e question. Cette deviation correspond a une demande produit recente et doit etre actee dans l'architecture cible si elle devient definitive.
- Non conforme : pas encore de POST reel vers `/api/checkout`; pas de serialisation Stripe active; usage `localStorage` courant `totem_parcours_v1`, alors que le document mentionne `sessionStorage` et `totem_questionnaire_state`.

### M3 - Paiement

Responsabilite cible : Stripe Checkout, Stripe Tax, webhook signe, idempotence, creation commande, email confirmation, lancement pipeline.

Etat actuel : non conforme / placeholder.

- Present : dependance `stripe`, client serveur, route `/api/checkout`, route `/api/webhook-stripe`, validation Zod du payload checkout.
- Manquant : creation session Checkout, Price IDs, Stripe Tax, metadata, verification `stripe.webhooks.constructEvent`, idempotence base, creation commande Supabase, email confirmation, declenchement asynchrone pipeline.

### M4 - Pipeline de generation

Responsabilite cible : API Texte -> API Image + API Audio -> PDF -> M5, retries exponentiels, timeouts, erreurs pipeline.

Etat actuel : non conforme / squelette.

- Present : fichier `src/lib/services/pipeline.ts`, type des etapes, utilitaire `retryWithBackoff` de base.
- Manquant : appels APIs SENYCE, timeouts, journalisation Supabase, statut commande, alerte admin, parallelisation image/audio, orchestration complete.

### M5 - Stockage et livraison

Responsabilite cible : upload R2, URLs signees 30 jours pour PDFs, emails Brevo, mise a jour commande `done`.

Etat actuel : non conforme / squelette.

- Present : clients R2 et Brevo, dependances AWS SDK et Brevo, fichiers service `storage.ts`, `email.ts`, `pdf.ts`.
- Manquant : upload R2, presigned URLs, generation PDF, templates Brevo, livraison email, update atomique commande.

### M6 - Authentification et espace personnel

Responsabilite cible : Supabase Auth, magic link, JWT cookies, RLS, routes protegees, affichage commandes et livrables.

Etat actuel : partiel / placeholder.

- Present : dependance Supabase, clients, migrations avec tables `profiles`, `user_roles`, `reponses_parcours`, `commandes`, `oeuvres`, RLS.
- Manquant : integration UI auth complete, middleware de protection routes, magic link route, API commandes authentifiee, affichage livrables R2.
- Difference schema : le document cible parle de tables `utilisateurs`, `commandes`, `erreurs_pipeline`; la migration actuelle utilise `profiles`, `user_roles`, `reponses_parcours`, `commandes`, `oeuvres`, et ne contient pas `erreurs_pipeline`.

### M7 - Administration

Responsabilite cible : dashboard admin, commandes, revenus, erreurs, relance pipeline.

Etat actuel : placeholder.

- Present : page `/admin`, routes `/api/admin/commandes` et `/api/admin/stats`, dependance Recharts.
- Manquant : verification role admin dans middleware/API, donnees Supabase reelles, filtres, graphiques, exports, relance pipeline.

## 5. Modele d'information

Modele cible du document :

- `utilisateurs` : profil utilisateur, role user/admin.
- `commandes` : commande centrale avec Stripe, reponses, URLs, statut `pending|done|error`.
- `erreurs_pipeline` : erreurs detaillees par etape.

Modele actuel observe dans les migrations Supabase :

- `profiles` : profil lie a `auth.users`.
- `user_roles` : roles `admin|user`.
- `reponses_parcours` : reponses stockees par session.
- `commandes` : commandes avec statut `en_attente_paiement|paye|en_generation|livree|erreur|remboursee` et offres `essentiel|signature|heritage`.
- `oeuvres` : livrables associes a une commande.

Conclusion : RLS et logique de roles existent dans le socle actuel, mais le schema ne respecte pas exactement le modele cible. Il faut soit migrer vers le schema cible, soit mettre a jour le document d'architecture pour adopter le schema courant.

## 6. Technologies

Technologies cible et etat :

| Domaine | Cible document | Etat actuel |
| --- | --- | --- |
| Framework | Next.js 14+ App Router | Next.js 16 App Router, conforme en pratique |
| Styling | Tailwind CSS v3 | Tailwind CSS v4, deviation acceptable mais a documenter |
| UI | shadcn/Radix | Radix/shadcn presents |
| Animations | Framer Motion + GSAP | Motion + GSAP presents |
| i18n | next-intl | Present |
| Paiement | Stripe | SDK present, integration non branchee |
| DB/Auth | Supabase | Socle present, integration incomplete |
| Stockage | Cloudflare R2 | Client present, service non branche |
| Emails | Brevo | Client present, service non branche |
| PDF | @react-pdf/renderer | Dependance presente, generation non branchee |
| Monitoring | Vercel Analytics + Sentry | Non observe dans le code |

## 7. Securite et qualites techniques

Etat actuel :

- Secrets : `.env` et `.env.local` ne sont pas suivis par Git; aucun secret evident suivi dans Git.
- Validation env : Zod present, mais la plupart des variables sont optionnelles. Pour production MVP, le schema doit devenir strict sur les variables obligatoires.
- Headers securite : presents partiellement (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Manquent `Strict-Transport-Security` et CSP explicite dans `next.config.ts`.
- Webhook Stripe : signature non verifiee actuellement.
- RLS : present dans migrations, mais pas encore relie aux routes applicatives finales.
- Tests : pas de tests unitaires, integration ou E2E observes.

## 8. Deploiement

Etat actuel :

- Remote GitHub : `https://github.com/REBCDR07/totem-project.git`.
- Branche de travail : `main`.
- Vercel CLI configure via `.vercel/project.json` local, fichier non suivi par Git.
- Production actuelle : `https://totemancestrale.vercel.app`.

Ecart avec le document : la strategie `staging`, PR obligatoire, CI GitHub Actions et protection de branche ne sont pas verifiees dans le depot local.

## 9. Recapitulatif de conformite

| Bloc | Statut | Commentaire |
| --- | --- | --- |
| Presentation & navigation | Partiel avance | Landing et i18n avances; pages secondaires et contact a finaliser |
| Questionnaire | Partiel avance | UX fonctionnelle; paiement non connecte; flux modifie apres Q4 |
| Paiement Stripe | Non conforme | Routes placeholders |
| Pipeline generation | Non conforme | Services placeholders |
| Stockage & livraison | Non conforme | Clients presents, logique non implementee |
| Espace personnel | Non conforme/partiel | Socle Supabase, UI/API placeholders |
| Administration | Non conforme/partiel | Page placeholder, pas de donnees reelles |
| Securite | Partiel | Headers et RLS partiels; webhook et env stricts manquants |
| i18n | Partiel avance | Home/parcours/header/footer avances; pages secondaires a traduire completement |
| Tests/CI | Non conforme | Pas de suite de tests observee |

## 10. Priorites techniques recommandees

1. Decider officiellement si le flux produit est choix d'offre apres Q4 ou apres Q10, puis aligner les documents et le code.
2. Brancher Stripe Checkout et Stripe Tax avec metadata compactes.
3. Implementer la verification webhook Stripe et l'idempotence commande.
4. Aligner le schema Supabase avec le modele cible ou mettre a jour l'architecture cible.
5. Implementer pipeline SENYCE + R2 + PDF + Brevo.
6. Proteger `/admin` et `/espace-personnel` par Supabase Auth.
7. Ajouter tests E2E critiques : i18n, parcours, pricing mobile, checkout mock, webhook mock.
8. Completer CSP/HSTS et validation stricte des variables de production.

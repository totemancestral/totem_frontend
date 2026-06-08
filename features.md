# TOTEM ANCESTRAL - Fonctionnalites MVP

Ce fichier suit les fonctionnalites attendues et leur etat actuel. Les statuts utilises sont :

- `Fait` : implemente et observe dans le code.
- `Partiel` : socle present, mais fonction incomplete.
- `Placeholder` : route/page/service present mais retourne une reponse d'attente ou une erreur volontaire.
- `A faire` : non observe dans le code.

## 1. Presentation et navigation

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Landing page one-pager | Hero, geste, experience, oeuvre, offres, maison, avis, CTA | Fait | Refonte avancee dans `src/components/sections.tsx` et `HomePage` |
| Intro immersive | Video/animation jouee une fois par session | Fait | `IntroExperience`, cle `totem_intro_played` |
| Audio ambiant | Bouton de controle audio visible apres entree | Fait | `AmbientAudio`, correction recente pour conserver le bouton |
| Modal de visite | Presentation guidee apres entree | Fait | `SiteTourModal` |
| Header responsive | Navigation, logo T + icone + A, switch langue | Fait | `Header.tsx` |
| Changement langue sans reload complet | FR/EN via next-intl | Fait/Partiel | `router.replace`; reste du contenu secondaire a traduire |
| Footer | Navigation et liens legaux | Fait/Partiel | i18n present pour footer |
| Pages legales | Mentions, CGV, confidentialite | Partiel | Pages presentes, textes surtout FR |
| FAQ | Questions/reponses | Partiel | Page presente, contenu surtout FR |
| Contact | Formulaire + Brevo | Placeholder | API valide Zod mais n'envoie pas encore Brevo |
| Consentement cookies RGPD | Bandeau + journalisation | A faire | Non observe |
| SEO localise | Metadata par locale, hreflang/canonical | Partiel | Metadata globale; localisation complete non observee |

## 2. Internationalisation

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Locales FR/EN | `messages/fr.json`, `messages/en.json` | Fait | Fichiers presents |
| Prefixes routes | `/fr/*`, `/en/*` | Fait | `next-intl` routing `always` |
| Detection locale | Accept-Language + fallback FR | Partiel | Middleware next-intl actif; comportement exact cookie/header a confirmer |
| Switcher manuel | FR/EN sans rechargement complet | Fait | Header |
| Traduction landing | Home FR/EN | Fait/Partiel | Principales sections traduites |
| Traduction parcours | Questions et UI FR/EN | Fait/Partiel | Messages integres; fallback FR existe dans composant |
| Traduction pages secondaires | FAQ, offres, legal, auth | Partiel | Plusieurs textes hardcodes FR |
| Automatisation traduction | next-auto-i18n | Partiel | Package et scripts presents |

## 3. Parcours conversationnel

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| 10 questions | Parcours complet | Fait | `ParcoursPage` contient 10 questions + messages i18n |
| Progression | Barre current/total | Fait | Barre en haut de l'interface parcours |
| Transitions animees | Fade/slide | Fait | Motion |
| Reponse choix unique | A/B/C/D | Fait | Chaque question propose 4 choix |
| Champs libres nuance | Texte optionnel selon question | Fait | Niveaux PRIORITAIRE/SECONDAIRE/TERTIAIRE/SPECIAL |
| Question skippable | Une question optionnelle | Fait | Q6 `canSkip` |
| Navigation precedent | Sans perte | Fait | Fonction `previous` |
| Persistance navigateur | Rechargement sans perte | Fait/Deviation | Utilise `localStorage` `totem_parcours_v1`, pas `sessionStorage` cible |
| Creation compte apres Q4 | Collecte prenom/email avant offres | Fait | Demande produit recente |
| Choix offre apres Q4 | Pricing dedie et mobile scrollable | Fait | Corrige pour 430x932 |
| Reprise questions restantes | Apres pseudo-paiement | Fait/Simulation | Bouton offre appelle `onPaid`, pas Stripe reel |
| Transmission paiement | POST `/api/checkout` | A faire | Non connecte dans UI finale |

## 4. Offres et pricing

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Trois offres | Origine, Ancestral, Famille | Fait cote UI | Prix visibles dans parcours |
| Details offres landing | Retires de landing, compares apres Q4 | Fait | Conforme demande produit recente |
| Pricing responsive mobile | Lisible 430x932 | Fait | Test Chrome effectue precedemment |
| Mapping Stripe Price IDs | Variables env | A faire | Non branche |
| Offre Famille multi-destinataires | 3 coffrets distincts | A faire | Complexite phase MVP a arbitrer |

## 5. Paiement international

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Stripe SDK serveur | Client Stripe | Partiel | `getStripeClient` present |
| Creation Checkout | `/api/checkout` | Placeholder | Retourne `501` |
| Stripe Tax | `automatic_tax` | A faire | Non implemente |
| Metadata answers/locale/offre | Session Checkout | A faire | Schema Zod existe seulement |
| Devise internationale | Stripe conversion | A faire | Dependra de Checkout |
| Webhook signe | `/api/webhook-stripe` | Placeholder | Lit signature mais ne verifie pas HMAC |
| Idempotence webhook | `stripe_id` unique | A faire | Non implemente cote API |
| Creation commande | Supabase | A faire | Non implemente cote API |
| Email confirmation | Brevo | A faire | Non implemente |

## 6. Pipeline de generation

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Service pipeline | `generateCoffret` | Placeholder | Throw volontaire |
| Retry backoff | 1s/3s/9s | Partiel | Utilitaire existe mais pas journalisation finale |
| API Texte SENYCE | POST serveur | A faire | Non implemente |
| API Image SENYCE | POST serveur | A faire | Non implemente |
| API Audio SENYCE | POST serveur | A faire | Non implemente |
| Parallelisation image/audio | Promise.all | A faire | Non implemente |
| Generation PDF | @react-pdf/renderer | Placeholder | Dependance presente; service throw |
| Erreurs pipeline | Table + alertes | A faire | Table cible absente du schema courant |
| SLA 15 minutes | Livraison complete | A faire | Pas de pipeline reel |

## 7. Stockage et livraison

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Client R2 | AWS S3 compatible | Partiel | `getR2Client` present |
| Upload fichiers | PNG, MP3, PDF | Placeholder | `uploadAndDeliver` throw |
| URLs signees PDF | Expiration 30j | A faire | Non implemente |
| URLs publiques PNG/MP3 | R2 public/CDN | A faire | Non implemente |
| Mise a jour commande | URLs + statut livre | A faire | Non implemente |
| Client Brevo | TransactionalEmailsApi | Partiel | `getBrevoClient` present |
| Email livraison | Template FR/EN | Placeholder | Fonctions throw |
| Alerte admin | Template erreur | Placeholder | Fonction throw |

## 8. Authentification et espace personnel

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Supabase client public | Client anon | Partiel | Present |
| Supabase service role | Client serveur | Partiel | Present |
| Migrations Auth/RLS | Tables + policies | Partiel | Schema courant different du document cible |
| Magic link | Connexion email | A faire | Route non observee |
| Page auth | Acces utilisateur | Placeholder | Page indique module M6 futur |
| Espace personnel | Commandes/livrables | Placeholder | Page statique |
| API commande utilisateur | `/api/commandes/[id]` | Placeholder | Retourne `501` |
| Protection middleware | JWT sur routes protegees | A faire | Middleware actuel uniquement i18n |

## 9. Administration

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Page admin | Dashboard SENYCE | Placeholder | UI statique |
| API commandes admin | Liste/filtres | Placeholder | Retourne `501` |
| API stats admin | Revenus/statistiques | Placeholder | Retourne `501` |
| Role admin middleware | Protection `/admin` | A faire | Non implemente |
| Role admin API | `403` si non admin | A faire | Non implemente |
| Relance pipeline | Action admin | A faire | Route absente |
| Graphiques | Recharts/chart | A faire | Recharts installe |
| Exports | Donnees admin | A faire | Non implemente |

## 10. Securite

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Secrets non suivis | `.env*` ignores | Fait | Git ne suit pas `.env`/`.env.local` |
| Validation env Zod | Variables obligatoires | Partiel | Schema present mais optionnel |
| Headers securite | HSTS, CSP, frame, nosniff | Partiel | HSTS/CSP manquants |
| Webhook HMAC | Stripe constructEvent | A faire | Non implemente |
| RLS | Toutes tables sensibles | Partiel | Migrations RLS presentes |
| Admin logs | Journalisation admin | A faire | Non observe |
| Logs webhooks | Type/ID/resultat | A faire | Non implemente |

## 11. Performance et accessibilite

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| Build production | `npm run build` | Fait | Dernier build local et Vercel passes avant ces docs |
| Mobile 430x932 | Pas de debordement horizontal | Fait sur parcours/pricing | Test Chrome realise precedemment |
| Lighthouse >= 90 | Accueil/parcours | A faire | Non mesure |
| Chargement < 3s regions cible | Europe/US/Afrique | A faire | Non mesure |
| WCAG AA | Contraste/ARIA/clavier | Partiel | Plusieurs ARIA; audit complet non fait |
| Tests E2E | Playwright | A faire | Pas de config observee |

## 12. Deploiement et exploitation

| Fonctionnalite | Exigence MVP | Etat | Notes |
| --- | --- | --- | --- |
| GitHub remote | Repo projet | Fait | `REBCDR07/totem-project` |
| Production Vercel | App en ligne | Fait | `https://totemancestrale.vercel.app` |
| Staging | Domaine staging | A faire | Non observe |
| CI GitHub Actions | Lint/type/test/build | A faire | Non observe |
| Branch protection | PR obligatoire | Non verifie | Hors depot local |
| Variables Vercel | Env par environnement | Partiel/non verifie | Vercel signale presence `.env` pendant build |

## 13. Fonctionnalites hors perimetre MVP

| Fonctionnalite | Phase | Etat |
| --- | --- | --- |
| Video dynamique livree par archetype | Phase 2 | A faire |
| Abonnement TOTEM VIVANT | Phase 2 | A faire |
| Langues PT/ES/AR/ZH | Phase 2-4 | A faire |
| Carte cadeau livraison differee | Phase 2 | A faire |
| Application mobile native | Phase 3 | A faire |
| Extraction pipeline en microservice | Phase 3 | A faire |

## 14. Prochaine feuille de route conseillee

1. Finaliser la decision produit sur le flux Q4 -> offre -> Q5-Q10.
2. Internationaliser toutes les pages secondaires et metadonnees.
3. Brancher Stripe Checkout avec Tax et Price IDs.
4. Brancher webhook Stripe signe + idempotence.
5. Aligner schema Supabase avec le document ou mettre a jour le document comme source de verite.
6. Implementer pipeline SENYCE avec retries et timeouts.
7. Implementer R2 + PDF + Brevo.
8. Finaliser auth utilisateur, espace personnel et admin.
9. Ajouter tests unitaires/integration/E2E.
10. Durcir securite : CSP, HSTS, env strictes, admin logs.

# TOTEM ANCESTRAL - Utilisateurs, roles et parcours

Ce fichier decrit les acteurs du systeme, leurs profils, leurs interventions et les fonctionnalites attendues pour chacun.

## 1. Acteurs principaux

| Acteur | Type | Role | Actions principales | Etat actuel |
| --- | --- | --- | --- | --- |
| Visiteur public | Humain externe | Decouvre la marque et les offres | Landing page, FAQ, pages legales, contact, changement de langue | Partiellement implemente |
| Utilisateur final / acheteur | Humain externe | Repond au parcours, paie, recoit son coffret | Questionnaire, choix offre, paiement, reception email, espace personnel | Parcours implemente; paiement/livraison non branches |
| Utilisateur authentifie | Humain externe | Consulte ses commandes et livrables | Connexion, espace personnel, telechargements | Placeholder |
| Admin SENYCE PARTNERS | Humain interne | Supervise la plateforme | Commandes, revenus, erreurs, relances, exports | Placeholder |
| Stripe | Systeme externe | Paiement, taxes, webhooks | Checkout, payment events, refunds | SDK present; non branche |
| APIs SENYCE | Systeme externe | Generation texte, image, audio | Recoit reponses et retourne artefacts/metadata | Non branche |
| Cloudflare R2 | Systeme externe | Stockage fichiers | Upload, URLs publiques/signees | Client present; non branche |
| Brevo | Systeme externe | Emails transactionnels | Confirmation, livraison, alerte admin | Client present; non branche |

## 2. Profils humains

### 2.1 Visiteur public

Objectif : comprendre l'univers TOTEM ANCESTRAL et entrer dans l'experience.

Fonctionnalites attendues :

- Arriver automatiquement sur `/fr` ou `/en` selon la langue.
- Voir une intro immersive une fois par session.
- Parcourir la landing page sans friction mobile.
- Lire la FAQ, les offres, les pages legales et le contact.
- Changer de langue sans rechargement complet.
- Lancer le parcours via le CTA principal.

Etat actuel : avance sur l'accueil; pages secondaires encore surtout francaises.

### 2.2 Utilisateur final / prospect en parcours

Objectif : composer son profil narratif et choisir une offre.

Fonctionnalites attendues :

- Repondre a dix questions conversationnelles.
- Naviguer precedent/suivant.
- Garder les reponses apres rechargement accidentel.
- Voir une progression claire.
- Choisir une offre tarifaire.
- Continuer vers paiement Stripe.

Etat actuel :

- Le parcours actuel suit le flux produit demande recemment : 4 questions, creation de compte, choix d'offre, puis questions restantes.
- Les cartes prix sont responsive mobile et scrollables.
- Le paiement n'est pas encore connecte.

### 2.3 Acheteur paye

Objectif : recevoir son coffret numerique rapidement apres paiement.

Fonctionnalites attendues :

- Payer via Stripe Checkout.
- Recevoir un email de confirmation immediat.
- Recevoir un coffret complet sous 15 minutes.
- Obtenir image PNG, parchemin PDF, certificat PDF, et audio MP3 selon offre.
- Recevoir des liens dans la bonne langue.

Etat actuel : non implemente fonctionnellement. Les routes et services existent comme squelettes.

### 2.4 Utilisateur authentifie

Objectif : retrouver ses commandes et livrables.

Fonctionnalites attendues :

- Se connecter via Supabase Auth ou magic link.
- Voir ses commandes uniquement.
- Suivre statut : en attente, livre, erreur.
- Telecharger les livrables avec URLs securisees.
- Se deconnecter.

Etat actuel : page placeholder; Supabase/RLS existe dans les migrations mais pas relie a l'UI finale.

### 2.5 Administrateur SENYCE PARTNERS

Objectif : superviser l'exploitation et intervenir sur les erreurs.

Fonctionnalites attendues :

- Acceder a `/admin` uniquement avec role admin.
- Voir toutes les commandes avec filtres : statut, pays, langue, devise, date.
- Voir statistiques revenus, offres, pays, taux d'erreur.
- Consulter les erreurs pipeline.
- Relancer une commande en erreur.
- Exporter les donnees.

Etat actuel : page et routes API placeholders, sans authentification admin effective.

## 3. Acteurs systemes externes

### Stripe

Interventions cible :

- Creer les sessions Checkout.
- Gerer les paiements internationaux et les taxes.
- Envoyer les webhooks signes.
- Fournir devise, pays, montant, email et identifiants paiement.

Obligations integration :

- Verification HMAC obligatoire.
- Idempotence obligatoire via identifiant Stripe unique.
- Stripe Tax active.
- Price IDs en variables d'environnement.

Etat actuel : non branche.

### APIs SENYCE Texte, Image, Audio

Interventions cible :

- Texte : recoit reponses, langue, offre; retourne archetype, nom ancestral, prompt image, texte audio, texte parchemin, numero collection.
- Image : recoit prompt; retourne PNG ou URL PNG haute resolution.
- Audio : recoit texte et langue; retourne MP3 60-90 secondes.

Obligations integration :

- Appels serveur uniquement.
- Timeouts et retries.
- Aucun prompt sensible dans le client.

Etat actuel : non branche.

### Cloudflare R2

Interventions cible :

- Stocker image, audio, parchemin, certificat.
- Generer URLs signees pour PDFs.
- Servir les fichiers mondialement.

Etat actuel : client present, logique non branchee.

### Brevo

Interventions cible :

- Envoyer confirmation commande.
- Envoyer livraison coffret.
- Envoyer alerte admin en cas d'erreur pipeline.

Etat actuel : client present, logique non branchee.

## 4. Parcours utilisateur cible

### Scenario A - Commander et recevoir son TOTEM

1. L'utilisateur arrive sur le site.
2. La locale est detectee et l'utilisateur est dirige vers `/fr` ou `/en`.
3. L'intro se joue une fois par session.
4. L'utilisateur lance le parcours.
5. Il repond aux questions.
6. Il choisit une offre.
7. Il paie via Stripe Checkout.
8. Stripe envoie le webhook signe.
9. La commande est creee en statut initial.
10. Email de confirmation.
11. Pipeline IA genere texte, image, audio, PDFs.
12. Upload R2 et URLs.
13. Email de livraison.
14. L'utilisateur retrouve ses livrables dans son espace personnel.

Etat actuel : etapes 1 a 6 partiellement fonctionnelles; etapes 7 a 14 non implementees.

### Scenario B - Acces espace personnel

1. L'utilisateur ouvre `/fr/espace-personnel` ou `/en/espace-personnel`.
2. Si non authentifie, il est redirige vers login.
3. Connexion via Supabase Auth.
4. Lecture commandes sous RLS.
5. Affichage des livrables selon statut.

Etat actuel : page placeholder; pas de protection effective.

### Scenario C - Erreur de generation

1. Une etape pipeline echoue.
2. Retry 1s, 3s, 9s.
3. Si echec final, statut erreur.
4. Insertion erreur pipeline.
5. Alerte admin Brevo.
6. Admin relance depuis back-office.

Etat actuel : non implemente.

### Scenario D - Administration

1. Admin se connecte.
2. Role admin verifie.
3. Dashboard commandes/statistiques charge.
4. Admin filtre, consulte, exporte, relance.

Etat actuel : placeholder.

## 5. User stories techniques

| ID | Acteur | Story | Statut actuel |
| --- | --- | --- | --- |
| US-01 | Utilisateur | Consulter le site en FR/EN selon langue navigateur | Partiel avance |
| US-02 | Utilisateur | Repondre au questionnaire mobile fluide et anime | Partiel avance |
| US-03 | Utilisateur | Payer en devise locale sans friction | Non implemente |
| US-04 | Utilisateur | Recevoir le coffret en moins de 15 minutes | Non implemente |
| US-05 | Utilisateur | Acceder aux livrables depuis espace personnel | Non implemente |
| US-06 | Admin | Consulter commandes du jour et statuts | Non implemente |
| US-07 | Admin | Recevoir alerte echec pipeline | Non implemente |
| US-08 | Systeme | Traiter commandes simultanees | Non implemente |
| US-09 | Systeme | Eviter double traitement webhook | Non implemente |
| US-10 | Developpeur | Ajouter une langue sans refonte | Partiel |

## 6. Droits et acces attendus

| Niveau | Acces | Donnees visibles | Protection attendue | Etat actuel |
| --- | --- | --- | --- | --- |
| Public | Landing, FAQ, contact, legal | Contenu public | Aucune session | Partiel |
| User | Espace personnel | Ses commandes et livrables | Supabase Auth + RLS | Non branche |
| Admin | `/admin` et `/api/admin/*` | Toutes commandes/statistiques/erreurs | Supabase Auth + role admin + API 403 | Non branche |
| Service role | Traitements serveur | Toutes tables necessaires | Server only, jamais client | Clients presents |

## 7. Donnees utilisateur manipulees

Donnees cible :

- Prenom.
- Email.
- Langue.
- Pays, devise, montant via Stripe.
- Reponses questionnaire.
- Commandes et statuts.
- URLs de livrables.
- Role `user` ou `admin`.

Obligations :

- Collecte minimale.
- Isolation RLS.
- Droit d'acces/suppression selon RGPD.
- Aucun prompt secret dans les donnees client.

## 8. Decisions produit a confirmer

1. Flux de paiement : apres Q4 ou apres Q10.
2. Noms d'offres techniques : document cible `origine|ancestral|famille`; schema actuel `essentiel|signature|heritage`.
3. Modele base : document cible `utilisateurs/commandes/erreurs_pipeline`; schema actuel `profiles/user_roles/reponses_parcours/commandes/oeuvres`.
4. Espace personnel : magic link seulement ou email + mot de passe + magic link.
5. Staging et domaine final : `totemancestral.com` cible vs Vercel actuel `totemancestrale.vercel.app`.

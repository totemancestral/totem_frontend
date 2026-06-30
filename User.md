# TOTEM ANCESTRAL — Utilisateurs, rôles et parcours

## Acteurs

| Acteur       | Rôle                    | Actions                                                                   |
| ------------ | ----------------------- | ------------------------------------------------------------------------- |
| Visiteur     | Découvre la marque      | Landing, FAQ, contact, pages légales, switch langue                       |
| Junior       | Révèle un totem gratuit | 5 choix visuels → révélation immédiate → partage/défi                     |
| Acheteur     | Parcourt, paie, reçoit  | 10 questions → compte → offre → Stripe → réception email + téléchargement |
| Utilisateur  | Consulte ses biens      | Dashboard perso : commandes, oeuvres, profil                              |
| Admin SENYCE | Supervise la plateforme | Stats, commandes, oeuvres, utilisateurs, erreurs, relance pipeline        |

## Parcours A — Acheter un Totem

1. Arrivée sur le site → détection locale → `/fr` ou `/en`
2. Intro immersive (une fois par session)
3. Lancement du parcours → 4 questions
4. Création de compte (obligatoire) ou connexion
5. Choix d'offre : Origine 49€ / Ancestral 89€ / Famille 199€
6. Stripe Checkout (taxe automatique incluse)
7. Reprise des 6 questions restantes
8. Webhook Stripe → création commande + oeuvre + email confirmation
9. Pipeline IA : scoring FETA V3, génération texte/image/audio/PDF
10. Upload R2, statut `livree`, email livraison avec liens
11. Accès aux livrables dans l'espace personnel

## Parcours B — Totem Junior

1. Accès public à `/fr/iuvenis_signum` ou `/en/iuvenis_signum`
2. Prénom optionnel en session, non persistant
3. Cinq questions courtes avec quatre choix visuels chacune
4. Scoring FETA Junior et attribution d'un des 12 totems
5. Révélation immédiate : nom ancestral, phrase d'identité, qualité principale
6. Textes prêts à partager : caption Instagram/TikTok et message défi WhatsApp/Snapchat

## Parcours C — Admin

1. Connexion à `/fgh55_fh`
2. Vérification du rôle Supabase `admin`
3. Dashboard : aperçu (Recharts), commandes, oeuvres, utilisateurs, activité, erreurs
4. Relance pipeline depuis l'interface

## Parcours D — Erreur

1. Étape pipeline échoue → log dans `erreurs_pipeline`
2. Retry 1s, 3s
3. En échec final → statut `erreur`, alerte admin par email

## Droits d'accès

| Niveau  | Accès                          | Protection                                       |
| ------- | ------------------------------ | ------------------------------------------------ |
| Public  | Landing, pages publiques, Junior | Aucune côté lecture; validation Zod côté API    |
| User    | Ses commandes, oeuvres, profil | Supabase Auth + RLS                              |
| Admin   | Toutes commandes/stats/erreurs | Auth + rôle Supabase admin (API 403 si invalide) |
| Service | Toutes tables                  | Service role key, serveur uniquement             |

## Modèle de données

- `profiles` : profil lié à `auth.users` (prenom, email, langue)
- `user_roles` : rôles (user/admin)
- `reponses_parcours` : réponses par session (UNIQUE user_id, session_id)
- `commandes` : statut `en_attente_paiement|paye|en_generation|livree|erreur|remboursee`, offre `essentiel|signature|heritage`, metadata Stripe
- `oeuvres` : livrables (image_url, audio_url, pdf_url, certificat_url, statut, recit, nom_totem, numero_serie)
- `erreurs_pipeline` : log détaillé des échecs par étape
- Junior : pas de table dédiée dans le flux actuel; résultat calculé à la demande et non persistant

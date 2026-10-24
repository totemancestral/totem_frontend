# Accès pendant la maintenance

## Estimation de fin en français et en anglais

Définir sur le frontend `MAINTENANCE_END_AT=2026-10-25T15:00:00+01:00`
(exemple à remplacer à chaque maintenance), puis redéployer pour prendre en
compte la configuration d'hébergement. Le format exige date et heure complètes
avec secondes et fuseau explicite (`+01:00` ou `Z`). Ne pas préfixer par NEXT_PUBLIC.

La page affiche une estimation FR/EN à l'heure de Lagos. Si l'heure est passée,
elle indique que la maintenance se prolonge. Sans valeur valide, elle conserve
son message général. Le message est recalculé à chaque requête ; une page déjà
ouverte doit être rechargée pour voir son actualisation.

Cette valeur ne désactive jamais le mode maintenance. Pour rouvrir le site,
passer `MAINTENANCE_MODE=false` et redéployer ; vider l'estimation pour éviter
de réutiliser une date ancienne lors de la prochaine maintenance.

## Accès de l'équipe

Activer `MAINTENANCE_MODE=true` sur le frontend. Définir une clé aléatoire forte dans
`MAINTENANCE_BYPASS_SECRET` (au moins 24 octets aléatoires). Ne pas la versionner.

Chaque membre ouvre `/api/bypass-maintenance` et saisit la clé dans le formulaire.
La clé est transmise en POST ; le serveur émet un cookie HMAC signé valable huit
heures, HttpOnly, SameSite=Lax et Secure en production. Le cookie ne contient pas
la clé. Son expiration est vérifiée côté serveur. Les comptes TOTEM restent séparés.

Les anciens liens `?key=...` et cookies contenant directement la clé ne donnent
plus accès. Changer la clé puis redéployer invalide tous les cookies existants.
Si la clé a déjà circulé dans des URL, la remplacer au déploiement.

Le formulaire exige une origine identique et limite les tentatives à dix par
minute et par adresse IP, en mémoire par instance. Cette limite n'est pas un
compteur distribué ; une protection partagée reste un chantier distinct.
Les réponses d'accès et de maintenance sont privées et non mises en cache.
Les fichiers statiques publics conservent les exclusions du proxy existant.

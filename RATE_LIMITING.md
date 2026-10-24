# Limitation des requêtes du frontend

Avant déploiement, configurer `RATE_LIMIT_REDIS_REST_URL` (HTTPS) et
`RATE_LIMIT_REDIS_REST_TOKEN` dans les variables serveur du frontend.
Utiliser les identifiants REST Upstash ; ne jamais employer le préfixe NEXT_PUBLIC.
Un Redis distinct est préférable ; les clés `totem:rate-limit:v1:` sont séparées
de la file de génération si le même Redis est utilisé.

Le compteur et son expiration sont atomiques via EVAL/INCR/PEXPIRE/PTTL.
Chaque action possède son compteur ; les seuils existants sont conservés.
Les IP sont pseudonymisées par HMAC avant stockage et expirent avec le compteur.
Les dépassements renvoient 429 avec `Retry-After` et `retryAfter` en secondes.

Vercel utilise `x-vercel-forwarded-for`. Ailleurs, définir RATE_LIMIT_IP_HEADER
uniquement sur un en-tête que le proxy remplace systématiquement, en empêchant
l'accès direct à l'origine. Ne pas faire confiance à un en-tête fourni librement
par le client. Sans configuration, le compteur partagé utilise l'identité unknown,
ce qui limite collectivement les visiteurs plutôt que de permettre un contournement.

Sans Redis en production, en cas d'erreur ou de délai dépassé (3 secondes), les
actions protégées renvoient 503 et Retry-After:30. Aucun repli local silencieux.
En développement/test sans identifiants Redis, un compteur mémoire borné est utilisé.

Ce module protège les routes frontend existantes. Le backend dispose également
de compteurs par compte authentifié, décrits dans `totem_backend/RATE_LIMITING.md`.
Restent à vérifier la configuration Supabase pour la connexion directe et les
essais Redis réels en préproduction. Les webhooks Stripe ne sont pas modifiés.

Les interfaces lisent désormais Retry-After (secondes ou date HTTP) et affichent
le délai reçu en français/anglais. Les relais préservent ce délai et les statuts
429/503 sur le paiement, le questionnaire, les cauris, les liens d'œuvres et les
relances administrateur. L'administration reste en français.
Le message indique un délai minimal au moment de la réponse, sans compte à rebours
et sans nouvelle tentative automatique. Aucune durée n'est inventée lorsque le
serveur ne fournit pas d'en-tête, notamment pour certains appels directs au SDK Supabase.

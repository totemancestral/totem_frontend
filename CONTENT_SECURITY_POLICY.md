# CSP : observation avant activation

Les réponses configurées par `next.config.ts` portent l'en-tête
`Content-Security-Policy-Report-Only`. Les violations apparaissent dans la
console du navigateur ; cette politique ne bloque aucune ressource.
Il n'y a pas de collecteur central ni de conservation automatique des rapports.
Les protections existantes, dont X-Frame-Options et la CSP spécifique du bypass
maintenance, restent indépendantes.

Les origines Supabase et backend sont dérivées des variables déjà utilisées
par le projet, sans chemins, paramètres ni identifiants. Un changement de ces
variables nécessite une nouvelle compilation pour actualiser les en-têtes.
Les vidéos locales, les fichiers privés Supabase et les ressources du backend
sont couverts. Les polices Google servent la page de maintenance.
Stripe Checkout est une navigation vers une page externe : aucun script ou
iframe Stripe n'est actuellement autorisé. Les appels serveur Resend et IA
ne sont pas soumis à la CSP du navigateur.

En développement seulement, eval et les connexions WebSocket de développement
sont permis. En production, les scripts inline Next et les styles inline
restent autorisés pour conserver le rendu actuel. Cette politique n'est donc
pas une CSP stricte contre toutes les injections de scripts.

Avant activation : examiner les violations sur les parcours FR/EN, connexion,
MFA, paiement et œuvre (image/audio/PDF), puis autoriser uniquement les sources
légitimes observées. Ne pas copier des URL signées ou des jetons depuis les
alertes. Une intégration tierce nouvelle doit être inventoriée.
Le passage à des nonces implique une étude du rendu dynamique et du cache.
Ne pas considérer le point CSP de l'audit comme clos avant cette revue et
l'activation explicite d'une politique appliquée.

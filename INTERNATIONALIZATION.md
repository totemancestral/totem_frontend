# Textes français et anglais

Les contenus éditoriaux vivent dans `app/[lang]/dictionaries/fr.json` et `en.json`.
Les messages communs de l’interface vivent dans `interface.fr.json` et
`interface.en.json`, dans le même dossier. `lib/interface-copy.ts` sélectionne
la langue sans importer les grands dictionnaires éditoriaux dans les composants
qui n’ont besoin que de ces messages.

Ajouter une clé dans les deux langues. Conserver les paramètres `{name}`, `{date}`,
etc. et utiliser `formatInterface` pour les remplacer. Les erreurs Auth connues
sont traduites par code ; les erreurs techniques inconnues utilisent un message
localisé, sans afficher la réponse brute du serveur. Les délais Retry-After
continuent d’être affichés lorsqu’ils sont fournis.

`npm test` inclut un contrôle de parité des clés, entrées de tableaux, types et
paramètres de traduction. Ce contrôle ne remplace pas une relecture linguistique
ni la vérification des textes écrits directement dans un composant.

Les lectures de cauris sont disponibles en français et en anglais. Le frontend
transmet `Accept-Language: fr` ou `en` au relais API, puis au backend pour l’état,
le tirage et l’historique. La langue ne modifie ni les codes, ni l’humeur, ni la
semaine, ni l’identité de la lecture. Aucun nouveau tirage n’est créé lors d’un
changement de langue.

La banque française est `totem_backend/src/totem/totem-cauris.ts` ; la traduction
est `totem-cauris.en.ts`. Conserver strictement l’ordre des 20 phrases de chaque
couche des huit séries : leur position fait partie du code enregistré. Les
nouveaux tirages conservent les deux versions dans `readingPayload`. Les anciens
sont traduits à partir de leurs codes. Si un ancien code est inconnu mais qu’un
texte français a été conservé, ce texte reste affiché et signalé comme français.
L’attribut HTML `lang` suit la langue effective du texte pour les lecteurs d’écran.

Déployer le backend avant le frontend. Aucune migration de base n’est nécessaire.
Les tests backend vérifient les 480 correspondances, la stabilité du tirage et
la lecture des anciens enregistrements. Une relecture éditoriale anglaise reste
recommandée pour valider le ton des textes.

L’administration utilise `admin.fr.json` et `admin.en.json`. Les phrases sources
françaises servent de clés communes dans ces deux catalogues isolés.
`lib/admin-copy.ts` traduit les libellés, statuts et offres ; `useAdminLocale`
sélectionne la langue de l’URL. Conserver les clés dans les deux catalogues et
leurs paramètres `{count}`, `{customer}` et `{file}`. Les erreurs de chargement
et délais de nouvelle tentative sont localisés ; les messages techniques des
journaux et les données saisies par les utilisateurs restent dans leur langue
d’origine. Le rôle administrateur et la vérification MFA restent obligatoires.

Les emails de livraison et les PDF/certificats suivent la langue de la commande.
Les modèles anglais manquants utilisent le contenu anglais intégré au backend.
Les résultats déjà enregistrés ne sont pas régénérés. Voir
`totem_backend/DELIVERY_LANGUAGES.md` pour les détails et limites.

Les modèles Supabase Auth FR/EN sont dans `docs/emails`, avec leurs sujets.
Ils nécessitent une installation manuelle dans le Dashboard Supabase et utilisent
la métadonnée `langue` du compte. Leur présence sur disque ne prouve pas leur
installation en production ; voir `docs/emails/README.md`.

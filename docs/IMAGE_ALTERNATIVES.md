# Alternatives des images — revue du 24 octobre 2026

Revue du contexte des composants du frontend source. Une alternative vide est
intentionnelle lorsque l'image ne transmet pas d'information supplémentaire.
Les descriptions ne sont pas déduites des noms de fichiers ou inventées.

| Images / composants | Traitement retenu et justification |
| --- | --- |
| Logo dans Brand, navigation, administration et paiement | Décoratif ou redondant avec le texte ; alt vide. Brand conserve son texte de lien « Totem Ancestral ». |
| Panneaux des formulaires Inscription, Connexion, Contact, MotDePasseOublie, Verification | Masque d'ambiance sans instruction supplémentaire ; alt vide. |
| Hero et CtaFinal | Détails du masque et identité visuelle ; alt vide. Retrait de l'ancien alt français du CtaFinal, inutile dans les deux langues. |
| AvantDetreVous, Manifeste, LaMaison, LeSeuil et LeSeuilPinned | Illustrations d'ambiance associées aux textes éditoriaux ; alt vide. Aucun texte, graphique ou instruction supplémentaire identifié dans le code. |
| Temoignages | Portrait avec nom et ville affichés dans la même carte ; alt vide pour éviter de répéter le nom. Ne pas affirmer l'identité réelle de la personne photographiée sans validation éditoriale. |
| Faq | Image de fond derrière une réponse déjà textuelle ; alt vide. Les fichiers absents restent un sujet distinct. |
| ApresLeTotem, EspaceNav, ConsultationTirage | Cauris décoratifs ; les positions animées ne représentent pas le résultat serveur. La lecture est fournie en texte dans CaurisReading. |
| Espace et EspaceOeuvres | Vignettes dans des liens déjà nommés par le nom du totem et son numéro ; alt vide. |
| Oeuvre | Portrait principal informatif : alternative existante localisée avec le nom de l'archétype. Cette identification ne décrit pas tous les détails visuels d'une image générée. |
| app/icon.tsx et apple-icon.tsx | Images utilisées pour produire des icônes raster, pas des images de contenu dans une page ; pas de texte alternatif à ajouter dans cette génération. |

Limite : revue du code et du rôle éditorial, pas validation visuelle exhaustive
des pixels de chaque image, ni certification WCAG globale. Une nouvelle image
avec du texte, un schéma ou une information indispensable devra recevoir une
alternative adaptée. La description détaillée des portraits générés demanderait
des données descriptives vérifiées ; elle n'est pas fabriquée à partir du seul
nom d'archétype. Les nouveaux liens constitués uniquement d'une image doivent
toujours avoir un nom accessible pertinent.

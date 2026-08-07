# Voix anglaises des questions de parcours

Le code lit déjà les voix anglaises. Il ne reste qu'à **déposer les fichiers**
aux emplacements ci-dessous, avec exactement ces noms.

Tant qu'un fichier est absent, le lecteur bascule automatiquement sur la voix
française correspondante (repli défini dans `src/lib/question-audio.ts`), donc
rien ne casse pendant la mise en place.

## Parcours adulte → `public/assets/adulte/en/`

Source Drive : <https://drive.google.com/drive/folders/1sjeT3EkY0Gm17k87Ue9vTCpk83BPuq1q>

| Fichier Drive | À déposer sous |
| --- | --- |
| `Quiz 1.mp3` | `public/assets/adulte/en/q1.mp3` |
| `Quiz 2.mp3` | `public/assets/adulte/en/q2.mp3` |
| `Quiz 3.mp3` | `public/assets/adulte/en/q3.mp3` |
| `Quiz 4.mp3` | `public/assets/adulte/en/q4.mp3` |
| `Quiz 5.mp3` | `public/assets/adulte/en/q5.mp3` |
| `Quiz 6.mp3` | `public/assets/adulte/en/q6.mp3` |
| `Quiz 7.mp3` | `public/assets/adulte/en/q7.mp3` |
| `Quiz 8.mp3` | `public/assets/adulte/en/q8.mp3` |
| `Quiz 9.mp3` | `public/assets/adulte/en/q9.mp3` |
| `Quiz 10.mp3` | `public/assets/adulte/en/q10.mp3` |

## Parcours junior → `public/assets/junior/en/`

Source Drive : <https://drive.google.com/drive/folders/1-dlGLJXdaudjhWHuM_htyxjigYp3P3MW>

| Fichier Drive | À déposer sous |
| --- | --- |
| `Junior Quiz 1.mp3` | `public/assets/junior/en/q1.mp3` |
| `Junior Quiz 2.mp3` | `public/assets/junior/en/q2.mp3` |
| `Junior Quiz 3.mp3` | `public/assets/junior/en/q3.mp3` |
| `Junior Quiz 4.mp3` | `public/assets/junior/en/q4.mp3` |
| `Junior Quiz 5.mp3` | `public/assets/junior/en/q5.mp3` |

## Convention

- Français : `public/assets/<parcours>/qN.mp3`
- Anglais : `public/assets/<parcours>/en/qN.mp3`

Le numéro `N` correspond au numéro de la question dans le parcours.

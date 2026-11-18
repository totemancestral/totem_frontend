# Correctifs de sécurité — 18 novembre 2026

Next.js et `eslint-config-next` passent de 16.4.2 à **16.4.6**, avec leurs
dépendances Next.js correspondantes dans le verrouillage. Le registre npm ne
signale aucun avis pour Next.js 16.4.6 lors de cette vérification.

Cette mise à jour corrige notamment les avis
[GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) et
[GHSA-vc7v-qv4w-wrv8](https://github.com/advisories/GHSA-vc7v-qv4w-wrv8).

Vérifications : 239 tests réussis, compilation de production réussie et ESLint
sans erreur (trois avertissements d'image existants). Navigation de production
vérifiée en français et en anglais : pages publiques, confirmation parentale et
espace client sur mobile et ordinateur, avec données simulées pour les comptes.
Aucun paiement ni e-mail réel n'a été déclenché.

Zod passe ensuite de 4.5.4 à **4.6.6**, version exacte inscrite dans le manifeste
et le verrouillage, pour corriger
[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
Seul le paquet Zod a changé lors de cette seconde mise à jour.
Les 239 tests passent avec cette version, notamment les validations des réponses
du parcours et du partage public.

Après ces mises à jour, `npm audit --omit=dev` ne signale aucune vulnérabilité.
`typescript-eslint` et ses paquets associés passent ensuite de 8.69.0 à
**8.73.0**, dans les contraintes déjà autorisées par `eslint-config-next`.
Minimatch passe de 10.2.6 à **11.0.9**, corrigeant
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Seul le verrouillage des dépendances change pour cette étape ; le manifeste
et le code applicatif restent identiques. Les 239 tests, ESLint (zéro erreur,
trois avertissements existants) et la compilation de production passent.

L'audit complet signale désormais **16 alertes hautes**, toutes rattachées à
la même vulnérabilité Picomatch
[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf),
propagée dans les dépendances de développement. Aucun correctif Picomatch
n'est publié au moment de la vérification. Le changement de sévérité des
paquets parents reflète cette propagation, pas une nouvelle faille distincte.
L'audit de production reste à zéro. Aucune correction automatique générale
n'a été appliquée. Aucun push ni déploiement effectué.

## Historique — 22 octobre 2026

Next.js et `eslint-config-next` passent à 16.4.2, `sharp` à 0.35.5 et Vitest à
4.1.12. Les fichiers de verrouillage sont mis à jour pour conserver ces correctifs.

La mise à jour de Next.js et sharp traite notamment l'avis
[GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw).
Vitest 4.1.12 corrige notamment
[GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8).

## Alertes restantes des outils de développement

L'audit npm complet signale encore cinq paquets de sévérité haute dans une même
chaîne : `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` →
`micromatch` → `braces`.

La version publiée de `braces` (3.0.3) reste affectée par
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
Le correctif automatique proposé rétrograderait `eslint-config-next` à la branche
14 ; cette rétrogradation n'a pas été appliquée à une application Next.js 16.
Ces alertes restent visibles et doivent être réexaminées à la publication d'un
correctif amont. Elles concernent les outils de développement, pas les dépendances
de production selon `npm audit --omit=dev`, qui ne signale aucune alerte.

## Vérifications

- 33 tests frontend réussis.
- Vérification TypeScript et compilation de production réussies.
- ESLint : aucune erreur, trois avertissements `no-img-element` déjà présents.
- Cohérence du verrouillage vérifiée par `npm ci --dry-run --ignore-scripts`.

L'audit reflète les avis publiés à cette date ; il ne garantit pas l'absence de
vulnérabilité et ne remplace pas les vérifications des autres points de l'audit.

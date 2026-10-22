# Correctifs de sécurité — 22 octobre 2026

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

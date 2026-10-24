# Emails Totem Ancestral

Deux familles d'emails :

| Type | Envoyé par | Où le configurer |
|------|-----------|------------------|
| **Confirmation de compte, réinitialisation, lien magique, changement d'email** | Supabase Auth | Dashboard Supabase (templates ci-dessous) |
| **Livraison adulte/Junior, alerte erreur** | `totem_backend` (Resend, `resend-mailer.service.ts`) | Modèles de livraison par langue dans `email_templates`, ou modèles intégrés au code |

---

## Installer les templates Supabase

**Supabase → Authentication → Emails → Templates**. Pour chaque type, colle le
contenu du fichier correspondant dans **Message body (HTML)** :

| Template Supabase | Fichier |
|-------------------|---------|
| Confirm signup | `confirm-signup.html` |
| Reset password | `reset-password.html` |
| Magic Link | `magic-link.html` |
| Change Email Address | `change-email.html` |

Pour **Subject**, copier le fichier `.subject.txt` du même nom. Il contient
également les deux langues. Les quatre corps HTML et sujets utilisent
`{{ if eq .Data.langue "en" }}` : anglais lorsque la métadonnée `langue` du
compte vaut `en`, français sinon. L'inscription enregistre déjà cette métadonnée.
Les blocs HTML déclarent leur langue avec `lang="fr"` ou `lang="en"`.

La condition repose sur les métadonnées du compte, et non sur la langue de la
page au moment de demander un lien. Un ancien compte sans `langue` recevra le
français. Les URL de retour restent celles transmises par le site ; la langue
du lien et celle du corps peuvent donc différer si la personne change de langue
après son inscription. Une sélection de langue par demande nécessiterait un
flux d'envoi personnalisé ; il n'est pas ajouté ici.

La prise en charge de `.Data` et des conditions Go est documentée par
[Supabase](https://supabase.com/docs/guides/auth/auth-email-templates).
Les fichiers locaux ne sont pas automatiquement synchronisés avec le Dashboard.
Après installation, utiliser l'aperçu Supabase pour vérifier les deux branches,
puis un compte de test de chaque langue pour contrôler l'envoi effectif.

Les variables `{{ .RedirectTo }}`, `{{ .TokenHash }}`, `{{ .Email }}` sont
remplacées automatiquement par Supabase.

**Important : ces templates n'utilisent plus `{{ .ConfirmationURL }}`.** Cette
variable renvoie un lien qui pointe d'abord vers
`https://<ref>.supabase.co/auth/v1/verify?...` avant de rediriger vers le
site — le domaine Supabase apparaît alors dans l'email et brièvement dans la
barre d'adresse, ce qui fait mauvais effet pour une marque de luxe. À la
place, chaque template construit son propre lien vers notre domaine, jamais
vers `supabase.co` : `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=<signup|recovery|magiclink|email_change>`.

Les 4 flux sont maintenant branchés dans le code, chacun garantissant un `?`
déjà présent dans son `emailRedirectTo`/`redirectTo` (condition nécessaire
pour que la concaténation `&token_hash=...` produise une URL valide) :

- **Confirm signup** — `app/api/auth/signup` → `/verification?next=...`
- **Reset password** — `app/api/auth/recover` → `/mot-de-passe-oublie?ref=email`
- **Magic Link** — `app/api/auth/magic-link` (bouton "Recevoir un lien magique" sur `/connexion`) → `/verification?next=/espace`
- **Change Email** — champ "Nouvel email" sur `/profil`, appelle `supabase.auth.updateUser({ email })` directement → `/verification?next=/profil`

La page `/verification` lit `token_hash` et `type` dans l'URL et appelle
`supabase.auth.verifyOtp({ token_hash, type })` elle-même pour valider le
jeton (le `type` n'est plus supposé être `"signup"`, il est lu dynamiquement
et validé contre une liste blanche). Pour `type=email_change` spécifiquement,
la page appelle ensuite `PATCH /api/profil` pour resynchroniser
`profiles.email` avec l'email confirmé côté Auth — aucun trigger DB ne le
fait automatiquement. `/mot-de-passe-oublie` gère `type=recovery` séparément
de la même façon.

Les tests locaux vérifient les deux branches HTML, les sujets et la conservation
des paramètres de vérification pour les quatre flux. Ils n'envoient aucun email
et ne valident pas la configuration actuellement installée dans Supabase.

Pas de logo en image dans ces templates : le domaine du site n'est pas encore
en ligne, donc aucune URL publique stable n'existe pour l'asset, et les
clients mail bloquent les images par défaut de toute façon. La marque tient
sur le nom seul (« TOTEM ANCESTRAL » en toutes lettres, doré). Le jour où le
site est déployé, un logo léger (PNG, quelques Ko, pas le SVG actuel qui pèse
1,5 Mo) pourra être ajouté dans le bandeau si souhaité.

Domaine utilisé dans le pied de page et les liens : **`totemancestral.com`**
(sans tiret — c'est le seul domaine vérifié dans Resend actuellement).

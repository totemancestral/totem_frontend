# Emails Totem Ancestral

Deux familles d'emails :

| Type | Envoyé par | Où le configurer |
|------|-----------|------------------|
| **Confirmation de compte, réinitialisation, lien magique, changement d'email** | Supabase Auth | Dashboard Supabase (templates ci-dessous) |
| **Confirmation de commande, livraison, alerte erreur** | `totem_backend` (Resend, `resend-mailer.service.ts`) | Déjà stylé dans le code — rien à faire |

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

Sujets recommandés :

- Confirm signup — `Confirme ton compte Totem Ancestral`
- Reset password — `Réinitialise ton mot de passe`
- Magic Link — `Ton lien de connexion Totem Ancestral`
- Change Email — `Confirme ta nouvelle adresse email`

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

Testé de bout en bout contre le vrai projet Supabase (génération de lien +
`verifyOtp()`) pour signup et recovery. Magic link et change email suivent
exactement le même mécanisme, avec un `redirectTo` désormais garanti par
leurs points d'entrée respectifs.

Pas de logo en image dans ces templates : le domaine du site n'est pas encore
en ligne, donc aucune URL publique stable n'existe pour l'asset, et les
clients mail bloquent les images par défaut de toute façon. La marque tient
sur le nom seul (« TOTEM ANCESTRAL » en toutes lettres, doré). Le jour où le
site est déployé, un logo léger (PNG, quelques Ko, pas le SVG actuel qui pèse
1,5 Mo) pourra être ajouté dans le bandeau si souhaité.

Domaine utilisé dans le pied de page et les liens : **`totemancestral.com`**
(sans tiret — c'est le seul domaine vérifié dans Resend actuellement).

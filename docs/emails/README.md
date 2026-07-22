# Emails Totem Ancestral

Deux familles d'emails :

| Type | Envoyé par | Où le configurer |
|------|-----------|------------------|
| **Confirmation de compte, réinitialisation, lien magique, changement d'email** | Supabase Auth | Dashboard Supabase (SMTP + templates ci-dessous) |
| **Confirmation de commande, livraison, alerte erreur** | Le code (`src/lib/services/email.ts` via Resend) | Déjà stylé — rien à faire |

---

## 1. Brancher Supabase sur Resend (SMTP)

Par défaut, Supabase envoie via son SMTP de test (limité et peu fiable). On le
remplace par **Resend**.

1. **Resend → Domains** : vérifie le domaine `totem-ancestral.com` (SPF + DKIM).
2. **Resend → API Keys** : crée une clé (`re_...`).
3. **Supabase → Project Settings → Authentication → SMTP Settings** → *Enable Custom SMTP* :
   - **Sender email** : `no-reply@totem-ancestral.com` (doit appartenir au domaine vérifié)
   - **Sender name** : `Totem Ancestral`
   - **Host** : `smtp.resend.com`
   - **Port** : `465` (SSL) — ou `587` (STARTTLS)
   - **Username** : `resend`
   - **Password** : la clé API Resend (`re_...`)
4. **Save**. Fais un test (invite un email, ou déclenche un reset).

> ⚠️ Sans domaine vérifié dans Resend, l'envoi échouera. Tant que le domaine
> n'est pas prêt, tu peux laisser le SMTP Supabase par défaut.

---

## 2. Installer les templates

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

Les variables `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}` sont
remplacées automatiquement par Supabase.

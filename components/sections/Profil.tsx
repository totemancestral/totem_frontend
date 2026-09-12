"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

type ProfileData = {
  prenom: string | null;
  nom: string | null;
  sexe: string | null;
  langue: string;
  email: string | null;
};

export default function Profil({ dict, lang }: { dict: Dictionary["profil"]; lang: Locale }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const response = await fetch("/api/profil", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const data = (await response.json()) as ProfileData;
      setProfile(data);
      setFirstName(data.prenom ?? "");
      setLastName(data.nom ?? "");
    })();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expirée");

      const response = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prenom: firstName, nom: lastName }),
      });
      const payload = (await response.json().catch(() => null)) as ProfileData & { error?: string };
      if (!response.ok) throw new Error(payload?.error ?? "Mise à jour impossible");
      setProfile(payload);

      if (newPassword) {
        if (newPassword.length < 8) throw new Error("Le nouveau mot de passe doit faire au moins 8 caractères.");
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
        setNewPassword("");
      }

      let emailChangeRequested = false;
      if (newEmail && newEmail !== profile?.email) {
        const redirectTo = `${window.location.origin}/${lang}/verification?next=${encodeURIComponent(`/${lang}/profil`)}`;
        const { error: emailError } = await supabase.auth.updateUser(
          { email: newEmail },
          { emailRedirectTo: redirectTo },
        );
        if (emailError) throw emailError;
        emailChangeRequested = true;
        setNewEmail("");
      }

      setNotice(emailChangeRequested ? dict.emailChangeNotice : "Profil mis à jour.");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error(dict.deleteError);

      const response = await fetch("/api/profil", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(dict.deleteError);

      await supabase.auth.signOut();
      router.replace(`/${lang}`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : dict.deleteError);
      setDeleting(false);
    }
  }

  const genderDisplay =
    profile?.sexe === "homme" ? dict.genderMale : profile?.sexe === "femme" ? dict.genderFemale : "—";
  const languageDisplay = profile?.langue === "en" ? "English" : "Français";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-16">
      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
        <h1 className="font-display text-3xl text-ivoire lg:text-4xl">{dict.title}</h1>
      </div>

      {/* informations non modifiables : toujours affichées, jamais dans le formulaire d'édition */}
      <div className="mt-9 flex max-w-lg flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.genderLabel}</span>
          <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-grisclair">{genderDisplay}</p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.languageLabel}</span>
          <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-grisclair">{languageDisplay}</p>
        </div>
      </div>

      {notice && (
        <p className="mt-4 text-sm text-orpale" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm" style={{ color: "#B0473E" }} role="alert">
          {error}
        </p>
      )}

      {isEditing ? (
        <form onSubmit={onSubmit} className="mt-5 flex max-w-lg flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.firstNameLabel}</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={80}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.lastNameLabel}</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={80}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
            <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-grisclair">{profile?.email}</p>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.newEmailLabel}</span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={dict.newEmailPlaceholder}
              maxLength={255}
              className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.newPasswordLabel}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
              minLength={8}
              maxLength={128}
              className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
            />
          </label>

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <Button type="submit" disabled={saving}>
              {saving ? "…" : dict.saveButton}
            </Button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-grisclair"
            >
              {dict.cancelButton}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex max-w-lg flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.firstNameLabel}</span>
              <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire">{profile?.prenom || "—"}</p>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.lastNameLabel}</span>
              <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire">{profile?.nom || "—"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.emailLabel}</span>
            <p className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire">{profile?.email || "—"}</p>
          </div>

          <Button className="mt-2 w-fit" onClick={() => setIsEditing(true)}>
            {dict.editButton}
          </Button>
        </div>
      )}

      {/* zone sensible */}
      <div className="mt-14 flex max-w-lg flex-col items-start gap-3 border border-ombre p-6">
        <p className="text-sm font-medium text-ivoire">{dict.dangerTitle}</p>
        <p className="text-sm text-grisclair">{dict.dangerText}</p>

        {!confirmingDelete ? (
          <Button variant="outline" className="mt-2" onClick={() => setConfirmingDelete(true)}>
            {dict.deleteButton}
          </Button>
        ) : (
          <div className="mt-2 flex w-full flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gris">{dict.deleteConfirmLabel}</span>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={dict.deleteConfirmWord}
                className="border border-ombre bg-indigo px-4 py-3.5 text-sm text-ivoire"
              />
            </label>

            {deleteError && (
              <p className="text-sm" style={{ color: "#B0473E" }} role="alert">
                {deleteError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <Button
                variant="outline"
                disabled={deleteInput !== dict.deleteConfirmWord || deleting}
                onClick={deleteAccount}
                className="disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "…" : dict.deleteConfirmButton}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteInput("");
                  setDeleteError(null);
                }}
                className="text-sm font-medium text-grisclair"
              >
                {dict.deleteCancelButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

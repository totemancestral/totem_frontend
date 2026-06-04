import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import totemLogo from "@/assets/totem-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accès — Totem Ancestral" },
      { name: "description", content: "Connecte-toi pour accéder à ton espace ancestral." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/mon-compte", replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/mon-compte", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const onGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/mon-compte",
    });
    if (result.error) setError(result.error.message ?? "Connexion Google impossible.");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/mon-compte`,
            data: { prenom },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'authentification.";
      setError(translate(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 pt-28 pb-16"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[460px] flex flex-col items-center gap-8 text-center"
      >
        <Link to="/" className="flex flex-col items-center gap-4">
          <img
            src={totemLogo}
            alt="Totem Ancestral"
            className="w-[140px] h-auto drop-shadow-[0_10px_30px_rgba(201,168,76,0.18)]"
          />
          <span
            className="h-display text-xl tracking-[0.28em] uppercase"
            style={{ color: "var(--or-ancestral)" }}
          >
            Totem Ancestral
          </span>
        </Link>

        <p className="quote-italic text-base" style={{ color: "var(--ivoire)" }}>
          {mode === "signin"
            ? "L'ancêtre reconnaît ton retour."
            : "Le seuil s'ouvre à toi."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-md transition-colors"
          style={{
            background: "var(--ivoire)",
            color: "#1A1A2E",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.96v2.33A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.71A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
          <span className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "var(--or-pale)" }}>
            ou
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
        </div>

        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4 text-left">
          {mode === "signup" && (
            <Field label="Prénom" value={prenom} onChange={setPrenom} type="text" />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required autoComplete="email" />
          <Field
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            type="password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />

          {error && (
            <p className="text-sm text-center" style={{ color: "#E07A6B", fontFamily: "var(--font-sans)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? "..." : mode === "signin" ? "Entrer" : "Composer mon compte"}
          </button>

          {mode === "signin" && (
            <Link
              to="/reset-password"
              className="text-center text-xs tracking-[0.16em] uppercase mt-2 transition-colors"
              style={{ color: "var(--or-pale)" }}
            >
              Mot de passe oublié
            </Link>
          )}
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="text-xs tracking-[0.18em] uppercase transition-colors"
          style={{ color: "var(--or-ancestral)" }}
        >
          {mode === "signin"
            ? "Je n'ai pas encore de compte"
            : "J'ai déjà un compte"}
        </button>
      </motion.div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[11px] tracking-[0.24em] uppercase"
        style={{ color: "var(--or-pale)" }}
      >
        {props.label}
      </span>
      <input
        type={props.type}
        required={props.required}
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          background: "#1A1A2E",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 6,
          padding: "12px 16px",
          color: "var(--ivoire)",
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
      />
    </label>
  );
}

function translate(msg: string): string {
  if (msg.toLowerCase().includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (msg.toLowerCase().includes("already registered")) return "Un compte existe déjà avec cet email.";
  if (msg.toLowerCase().includes("password")) return "Mot de passe trop court (minimum 6 caractères).";
  return msg;
}

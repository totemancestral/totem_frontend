import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import totemLogo from "@/assets/totem-logo.png";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Réinitialiser le mot de passe — Totem Ancestral" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [phase, setPhase] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("type=recovery")) setPhase("update");
  }, []);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Un lien vient de t'être envoyé. Vérifie tes mails.");
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Mot de passe mis à jour. Tu peux maintenant te connecter.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 pt-28 pb-16"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[440px] flex flex-col items-center gap-8 text-center"
      >
        <Link to="/" className="flex flex-col items-center gap-4">
          <img src={totemLogo} alt="Totem Ancestral" className="w-[120px] h-auto" />
        </Link>
        <h1 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
          {phase === "request" ? "Mot de passe oublié" : "Nouveau mot de passe"}
        </h1>

        <form
          onSubmit={phase === "request" ? onRequest : onUpdate}
          className="w-full flex flex-col gap-4 text-left"
        >
          {phase === "request" ? (
            <input
              type="email"
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              style={inputStyle}
            />
          ) : (
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          )}
          {err && <p style={{ color: "#E07A6B", fontSize: 14 }}>{err}</p>}
          {msg && <p style={{ color: "var(--or-pale)", fontSize: 14 }}>{msg}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "..." : phase === "request" ? "Envoyer le lien" : "Mettre à jour"}
          </button>
        </form>

        <Link
          to="/auth"
          className="text-xs tracking-[0.18em] uppercase"
          style={{ color: "var(--or-ancestral)" }}
        >
          Retour à la connexion
        </Link>
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#1A1A2E",
  border: "1px solid rgba(201,168,76,0.3)",
  borderRadius: 6,
  padding: "12px 16px",
  color: "var(--ivoire)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  outline: "none",
};

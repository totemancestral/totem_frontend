import { useEffect, useState } from "react";
import { motion } from "motion/react";
import totemLogo from "@/assets/totem-logo.png";

const ALLOWED_EMAIL = "beneditelovi@gmail.com";
const ALLOWED_PASSWORD = "TOTEM";
const STORAGE_KEY = "totem.auth.v1";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(STORAGE_KEY) === "ok");
    } catch {
      setAuthed(false);
    }
  }, []);

  if (authed === null) {
    return <div style={{ background: "var(--nuit-profonde)", minHeight: "100vh" }} />;
  }

  if (authed) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email.trim().toLowerCase() === ALLOWED_EMAIL &&
      password === ALLOWED_PASSWORD
    ) {
      try {
        localStorage.setItem(STORAGE_KEY, "ok");
      } catch {}
      setAuthed(true);
    } else {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-5"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] flex flex-col items-center gap-8 text-center"
      >
        <img
          src={totemLogo}
          alt="Totem Ancestral"
          className="w-[180px] h-auto drop-shadow-[0_10px_30px_rgba(201,168,76,0.18)]"
        />
        <div className="flex flex-col items-center gap-3">
          <span
            className="h-display text-2xl tracking-[0.28em] uppercase"
            style={{ color: "var(--or-ancestral)" }}
          >
            Totem Ancestral
          </span>
          <span
            className="h-px w-20"
            style={{ background: "var(--or-ancestral)" }}
          />
          <p
            className="quote-italic text-base mt-1"
            style={{ color: "var(--ivoire)" }}
          >
            L'accès est réservé.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 text-left">
          <label className="flex flex-col gap-2">
            <span
              className="text-[11px] tracking-[0.24em] uppercase"
              style={{ color: "var(--or-pale)" }}
            >
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")
              }
            />
          </label>
          <label className="flex flex-col gap-2">
            <span
              className="text-[11px] tracking-[0.24em] uppercase"
              style={{ color: "var(--or-pale)" }}
            >
              Mot de passe
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")
              }
            />
          </label>
          {error && (
            <p
              className="text-sm text-center"
              style={{ color: "#E07A6B", fontFamily: "var(--font-sans)" }}
            >
              {error}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full justify-center">
          Entrer
        </button>
      </motion.form>
    </div>
  );
}

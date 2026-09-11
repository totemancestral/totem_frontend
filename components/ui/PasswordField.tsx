"use client";
import { useState } from "react";
import { passwordRequirements } from "@/lib/password";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z" />
      <circle cx="9" cy="9" r="2.4" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z" />
      <circle cx="9" cy="9" r="2.4" />
      <line x1="2" y1="16" x2="16" y2="2" />
    </svg>
  );
}

type PasswordFieldProps = {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  showRequirements?: boolean;
  className?: string;
};

// Champ mot de passe partagé (inscription, connexion, réinitialisation) :
// bouton afficher/masquer intégré, et checklist de robustesse en direct
// quand showRequirements est activé (création/changement de mot de passe —
// pas utile pour une simple connexion).
export function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength,
  required,
  showRequirements = false,
  className = "",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const req = passwordRequirements(value);

  return (
    <label className="flex flex-col gap-2">
      {label && <span className="text-xs font-medium uppercase tracking-wide text-gris">{label}</span>}
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          className={`w-full border border-ombre bg-indigo py-3.5 pl-4 pr-12 text-sm text-ivoire ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-grisclair hover:text-ivoire"
        >
          <EyeIcon open={visible} />
        </button>
      </div>

      {showRequirements && (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { ok: req.length, label: "8 caractères min." },
            { ok: req.uppercase, label: "une majuscule" },
            { ok: req.lowercase, label: "une minuscule" },
            { ok: req.digit, label: "un chiffre" },
          ].map((item) => (
            <li key={item.label} className={`text-xs ${item.ok ? "text-or" : "text-grisclair"}`}>
              {item.ok ? "✓" : "·"} {item.label}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

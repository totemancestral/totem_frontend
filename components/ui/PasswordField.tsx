"use client";
import { useId, useState } from "react";
import { passwordRequirements } from "@/lib/password";
import { interfaceCopy } from "@/lib/interface-copy";

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
  id?: string;
  lang?: "fr" | "en";
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
  invalid?: boolean;
  describedBy?: string;
};

// Champ mot de passe partagé (inscription, connexion, réinitialisation) :
// bouton afficher/masquer intégré, et checklist de robustesse en direct
// quand showRequirements est activé (création/changement de mot de passe —
// pas utile pour une simple connexion).
export function PasswordField({
  id,
  lang = "fr",
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
  invalid,
  describedBy,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const requirementsId = `${inputId}-requirements`;
  const copy = interfaceCopy(lang).password;
  const req = passwordRequirements(value);

  return (
    <div className="flex flex-col gap-2">
      {label && <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-gris">{label}</label>}
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={invalid || undefined}
          aria-describedby={[showRequirements ? requirementsId : "", describedBy].filter(Boolean).join(" ") || undefined}
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
          aria-label={visible ? copy.hide : copy.show}
          aria-controls={inputId}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-grisclair hover:text-ivoire"
        >
          <EyeIcon open={visible} />
        </button>
      </div>

      {showRequirements && (
        <ul id={requirementsId} className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { ok: req.length, label: copy.rules[0] },
            { ok: req.uppercase, label: copy.rules[1] },
            { ok: req.lowercase, label: copy.rules[2] },
            { ok: req.digit, label: copy.rules[3] },
          ].map((item) => (
            <li key={item.label} className={`text-xs ${item.ok ? "text-or" : "text-grisclair"}`}>
              <span aria-hidden="true">{item.ok ? "✓" : "·"}</span>
              <span className="sr-only">{item.ok ? copy.met : copy.unmet} : </span>{item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

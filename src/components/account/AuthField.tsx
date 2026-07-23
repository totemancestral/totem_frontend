"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Champ de formulaire premium utilisé par les écrans d'authentification. */
export function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  minLength,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <label className="flex flex-col gap-2">
      <span className="caption uppercase" style={{ color: "rgba(246,200,101,0.78)" }}>
        {label}
      </span>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={inputType}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          className="form-input"
          style={isPassword ? { paddingRight: 44 } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={revealed}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
            style={{ color: "rgba(246,200,101,0.7)" }}
          >
            {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </label>
  );
}

"use client";

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
  return (
    <label className="flex flex-col gap-2">
      <span className="caption uppercase" style={{ color: "rgba(246,200,101,0.78)" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="form-input"
      />
    </label>
  );
}

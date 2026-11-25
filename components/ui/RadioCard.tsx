import type { ReactNode } from "react";

/** Native radio behavior (Tab, arrows, Space) with the existing card design. */
export function RadioCard({ name, value, checked, onChange, disabled, required, className, children }: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  required?: boolean;
  className: string;
  children: ReactNode;
}) {
  return (
    <label className={`relative cursor-pointer focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-or ${disabled ? "cursor-wait opacity-60" : ""} ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} required={required} className="sr-only" />
      {children}
    </label>
  );
}

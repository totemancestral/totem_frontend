import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = "gold", children, ...props }, ref) => {
    const base =
      "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

    const variants: Record<Variant, string> = {
      gold: "border border-or/40 bg-gradient-to-br from-or via-or-pale to-ombre text-nuit shadow-lg shadow-or/15 hover:shadow-or/30 hover:brightness-110 active:brightness-90",
      outline:
        "border border-or/40 bg-transparent text-or hover:bg-or/10 active:bg-or/20",
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props}>
        {children}
      </button>
    );
  },
);

GoldButton.displayName = "GoldButton";

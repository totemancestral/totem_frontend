import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Bouton doré premium à coins biseautés (DA Totem Ancestral). */
export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = "gold", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn-clip group relative inline-flex items-center justify-center gap-2.5",
          "px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em]",
          "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "gold" &&
            "text-primary-foreground shadow-[0_0_24px_-6px_var(--gold)] hover:shadow-[0_0_40px_-4px_var(--gold-light)] active:scale-[0.98]",
          variant === "outline" &&
            "border border-gold/40 bg-transparent text-gold-light hover:border-gold hover:bg-gold/10",
          className,
        )}
        style={variant === "gold" ? { backgroundImage: "var(--gradient-gold)" } : undefined}
        {...props}
      >
        {variant === "gold" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s linear infinite",
            }}
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
      </button>
    );
  },
);
GoldButton.displayName = "GoldButton";

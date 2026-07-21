import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bouton du design system TOTEM.
 *
 * - `variant="rounded"` (nouveau) : forme arrondie premium, transitions douces,
 *   halo doré subtil au hover — s'aligne sur la charte or/nuit-profonde.
 *   À utiliser en priorité sur les CTAs marketing (offres, checkout, hero).
 * - Les variantes historiques (default, secondary, outline, …) restent
 *   disponibles pour compat.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium cursor-pointer select-none",
    "transition-[background-color,box-shadow,transform,color] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Nouveau : bouton arrondi premium (défaut recommandé)
        rounded:
          "rounded-full bg-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_10px_30px_-10px_rgba(216,173,77,0.55)] hover:bg-primary/95 hover:-translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_16px_36px_-10px_rgba(216,173,77,0.65)] active:translate-y-0",
        "rounded-outline":
          "rounded-full border border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/70",
        "rounded-ghost":
          "rounded-full bg-transparent text-foreground/80 hover:bg-primary/10 hover:text-foreground",

        // ── Legacy (compat existante)
        default: "rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "rounded-md hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8 text-[15px]",
        xl: "h-12 px-9 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "rounded",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

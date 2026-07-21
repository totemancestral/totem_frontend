import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Bouton du design system TOTEM.
 *
 * Pattern inspiré d'Orix (https://orix-three.vercel.app/) — "Luminous Edge"
 * multi-couches (inner border blanc translucide + shadow discrète), transition
 * tactile `active:scale-[0.97]`. Adapté à la palette TOTEM (or ancestral,
 * nuit profonde, ivoire, indigo) au lieu de zinc.
 *
 * Rayon par défaut : `rounded-2xl` (choix produit).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl",
    "text-sm font-medium shrink-0 cursor-pointer select-none",
    "transition-[background-color,box-shadow,transform,color,border-color] duration-150 ease-out",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97] active:brightness-95",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Or ancestral sur nuit — inner border ivoire translucide + halo doré
        default: [
          "border text-primary-foreground",
          "bg-[var(--or-ancestral)] border-[color-mix(in_oklab,var(--or-pale)_45%,transparent)]",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.28)_inset,0_10px_28px_-12px_rgba(216,173,77,0.55)]",
          "hover:bg-[var(--or-pale)] hover:border-[color-mix(in_oklab,var(--or-pale)_65%,transparent)]",
          "hover:shadow-[0_1px_0_0_rgba(255,255,255,0.36)_inset,0_16px_36px_-12px_rgba(216,173,77,0.70)]",
        ].join(" "),

        // Contour or, transparent — pour actions secondaires premium
        outline: [
          "border bg-transparent text-primary",
          "border-[color-mix(in_oklab,var(--or-ancestral)_55%,transparent)]",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]",
          "hover:bg-[color-mix(in_oklab,var(--or-ancestral)_10%,transparent)]",
          "hover:border-[var(--or-ancestral)]",
        ].join(" "),

        // Indigo ancestral — pour actions tertiaires (annuler, retour)
        secondary: [
          "border text-foreground",
          "bg-[var(--indigo-ancestral)] border-[color-mix(in_oklab,var(--or-ancestral)_18%,transparent)]",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]",
          "hover:bg-[color-mix(in_oklab,var(--indigo-ancestral)_85%,var(--or-ancestral)_15%)]",
          "hover:border-[color-mix(in_oklab,var(--or-ancestral)_35%,transparent)]",
        ].join(" "),

        // Rouge — actions destructives (supprimer, annuler commande)
        destructive: [
          "border border-red-500/70 bg-red-600 text-white",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(0,0,0,0.25)]",
          "hover:bg-red-500 hover:border-red-400",
        ].join(" "),

        // Discret, sans fond
        ghost:
          "text-foreground/80 hover:bg-[color-mix(in_oklab,var(--or-ancestral)_10%,transparent)] hover:text-foreground",

        // Lien souligné
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-11 px-8 text-base",
        xl: "h-12 px-9 text-base",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
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

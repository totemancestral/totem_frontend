import type { ComponentProps } from "react";
import Link from "next/link";

// ButtonProps = toutes les props qu'accepte un <button> HTML natif
// (onClick, type, disabled, etc.), plus un "href" optionnel : si présent,
// le composant se comporte comme un lien plutôt qu'un vrai bouton.
type ButtonProps = { variant?: "gold" | "outline" | "account" | "accountOutline" } & (
  | (ComponentProps<"button"> & { href?: never })
  | (ComponentProps<typeof Link> & { href: ComponentProps<typeof Link>["href"] })
);

const styles = {
  gold: "border-or text-or before:bg-or hover:text-nuit hover:before:w-full",
  outline: "border-or text-ivoire before:bg-or hover:text-nuit hover:before:w-full hover:border-orpale",
  account: "border-or bg-or text-nuit before:hidden hover:brightness-110",
  accountOutline: "border-or text-or before:hidden hover:border-orpale",
};

export function Button({ children, variant = "gold", className, ...rest }: ButtonProps) {
  // children = le texte/contenu passé entre <Button> et </Button>
  // ...rest = toutes les autres props reçues (onClick, type, disabled...),
  // qu'on renvoie telles quelles sur le vrai <button> via {...rest}

  const account = variant === "account" || variant === "accountOutline";
  const classes = `
    relative inline-flex min-h-11 min-w-0 max-w-full items-center justify-center overflow-hidden ${account ? "rounded-lg" : "rounded-tl-[12px] rounded-br-[12px]"}
    border
    font-body font-medium whitespace-normal px-6 py-3.5 text-center sm:px-8 sm:py-4 lg:px-10
    transition-colors duration-300

    before:content-[''] before:absolute before:inset-y-0 before:left-0
    before:w-0 before:transition-[width] before:duration-300 before:ease-out

    ${styles[variant]}
    ${className ?? ""}
  `;

  // z-10 + relative : garde le texte AU-DESSUS du rideau doré (le ::before)
  const label = <span className="relative z-10">{children}</span>;

  if (rest.href !== undefined) {
    return (
      <Link {...rest} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" {...rest} className={classes}>
      {label}
    </button>
  );
}

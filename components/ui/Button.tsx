import type { ComponentProps } from "react";
import Link from "next/link";

// ButtonProps = toutes les props qu'accepte un <button> HTML natif
// (onClick, type, disabled, etc.), plus un "href" optionnel : si présent,
// le composant se comporte comme un lien plutôt qu'un vrai bouton.
type ButtonProps = ComponentProps<"button"> & {
  variant?: "gold" | "outline";
  href?: string;
};

const styles = {
  gold: "border-or text-or before:bg-or hover:text-nuit hover:before:w-full",
  outline: "border-or text-ivoire before:bg-or hover:text-nuit hover:before:w-full hover:border-orpale",
};

export function Button({ children, variant = "gold", className, href, onClick, ...rest }: ButtonProps) {
  // children = le texte/contenu passé entre <Button> et </Button>
  // ...rest = toutes les autres props reçues (onClick, type, disabled...),
  // qu'on renvoie telles quelles sur le vrai <button> via {...rest}

  const classes = `
    relative overflow-hidden
    border
    font-body px-10 py-4
    transition-colors duration-300

    before:content-[''] before:absolute before:inset-y-0 before:left-0
    before:w-0 before:transition-[width] before:duration-300 before:ease-out

    ${styles[variant]}
    ${className ?? ""}
  `;

  // z-10 + relative : garde le texte AU-DESSUS du rideau doré (le ::before)
  const label = <span className="relative z-10">{children}</span>;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick as () => void}>
        {label}
      </Link>
    );
  }

  return (
    <button {...rest} onClick={onClick} className={classes}>
      {label}
    </button>
  );
}

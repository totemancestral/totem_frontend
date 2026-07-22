import { cn } from "@/lib/utils";

/**
 * Skeleton du design system TOTEM.
 *
 * Utilise le shimmer doré (`.premium-skeleton`) au lieu du `bg-primary/10`
 * shadcn par défaut : sheen or ancestral qui balaie sur nuit profonde,
 * cohérent avec les panneaux `premium-*`. Respecte `prefers-reduced-motion`.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("premium-skeleton", className)} {...props} />;
}

/** Lignes de texte simulées (dernière ligne plus courte). */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className="h-3"
          style={{ width: index === lines - 1 ? "62%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Carte statistique simulée (icône + label + valeur). */
function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("premium-panel p-5", className)}>
      <Skeleton className="mb-4 h-5 w-5 !rounded-full" />
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonStatCard };

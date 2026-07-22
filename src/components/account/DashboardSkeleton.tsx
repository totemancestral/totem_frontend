import { Skeleton, SkeletonStatCard } from "@/components/ui/skeleton";

type Locale = "fr" | "en";

/**
 * Squelette de l'espace personnel — reproduit la vraie mise en page
 * (sidebar + header + cartes stats + panneau composition) pour une
 * perception de chargement fluide, sans flash de contenu.
 *
 * Réutilisé à la fois par le `loading.tsx` de route (navigation) et par
 * l'état de chargement interne du `DashboardClient` (fetch des données).
 */
export function DashboardSkeleton({ locale = "fr" }: { locale?: Locale }) {
  const preparing = locale === "fr" ? "Préparation de ton espace…" : "Preparing your space…";

  return (
    <div
      className="premium-page flex min-h-[100svh]"
      style={{ background: "var(--nuit-profonde)" }}
      aria-busy="true"
      aria-label={preparing}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>

      {/* Sidebar (desktop) */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-64 pt-20 lg:block"
        style={{ borderRight: "1px solid rgba(216,173,77,0.18)" }}
      >
        <div className="premium-sidebar flex h-full flex-col gap-6 p-6">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-12 w-12 !rounded-full" />
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden px-5 pb-12 pt-24 md:px-8 md:pb-16 md:pt-28 lg:ml-64">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="premium-panel-strong p-6 md:p-8">
            {/* Header éditorial */}
            <div className="mb-6 flex flex-col gap-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-11 w-3/4 max-w-md" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>

            {/* Cartes stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>

            {/* Panneau composition */}
            <div className="premium-panel grid gap-5 p-5 md:grid-cols-[0.82fr_1.18fr] md:p-6">
              <div className="flex flex-col gap-5">
                <Skeleton className="h-8 w-48" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-7 w-32" />
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="mt-1 h-2 w-2 !rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

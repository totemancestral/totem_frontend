import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MaskLogo } from "@/components/MaskLogo";
import { AuthGate } from "@/components/AuthGate";

function NotFoundComponent() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="max-w-md text-center flex flex-col items-center gap-8">
        <MaskLogo size={80} />
        <h1 className="h-display text-5xl" style={{ color: "var(--or-ancestral)" }}>
          Cette page n'existe pas.
        </h1>
        <p className="quote-italic text-lg">
          Le chemin que vous cherchez s'est égaré dans la nuit.
        </p>
        <Link to="/" className="btn-primary">
          Retour à la maison
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-md text-center flex flex-col items-center gap-6">
        <h1 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
          Cette page n'a pas pu être composée.
        </h1>
        <p className="text-sm" style={{ color: "var(--ivoire)" }}>
          Quelque chose s'est interrompu. Essayez à nouveau, ou revenez à la maison.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Réessayer
          </button>
          <a href="/" className="btn-secondary">Accueil</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Totem Ancestral — Le portrait imaginaire de l'Africain que vous auriez pu être" },
      {
        name: "description",
        content:
          "Une œuvre numérique unique, assistée par intelligence artificielle, inspirée des cosmogonies africaines. Composée pour vous.",
      },
      { name: "author", content: "SENYCE PARTNERS" },
      { property: "og:title", content: "Totem Ancestral" },
      {
        property: "og:description",
        content: "Le portrait imaginaire de l'Africain que vous auriez pu être.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <div style={{ background: "var(--nuit-profonde)", minHeight: "100vh" }}>
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </AuthGate>
    </QueryClientProvider>
  );
}

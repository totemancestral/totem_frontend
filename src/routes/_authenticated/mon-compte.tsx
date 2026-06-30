import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { MaskLogo } from "@/components/MaskLogo";

export const Route = createFileRoute("/_authenticated/mon-compte")({
  head: () => ({
    meta: [{ title: "Mon espace — Totem Ancestral" }],
  }),
  component: MonCompte,
});

type Oeuvre = {
  id: string;
  nom_totem: string | null;
  numero_serie: string | null;
  image_url: string | null;
  statut: string;
  created_at: string;
};

type Profile = { prenom: string | null; email: string | null };

function MonCompte() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, o] = await Promise.all([
        supabase.from("profiles").select("prenom, email").eq("id", user.id).maybeSingle(),
        supabase
          .from("oeuvres")
          .select("id, nom_totem, numero_serie, image_url, statut, created_at")
          .order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      setProfile(p.data ?? { prenom: null, email: user.email ?? null });
      setOeuvres((o.data as Oeuvre[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user.id, user.email]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const prenom = profile?.prenom || profile?.email?.split("@")[0] || "Voyageur";

  return (
    <div
      className="min-h-screen pt-32 pb-20 px-5 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="max-w-[1080px] mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center gap-6 mb-16"
        >
          <MaskLogo size={56} />
          <div className="flex flex-col items-center gap-3">
            <span
              className="text-[11px] tracking-[0.28em] uppercase"
              style={{ color: "var(--or-pale)" }}
            >
              Ton espace ancestral
            </span>
            <h1 className="h-display text-4xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              Bienvenue, {prenom}
            </h1>
            <p className="quote-italic" style={{ color: "var(--ivoire)" }}>
              Les œuvres qui te sont nées reposent ici.
            </p>
          </div>
        </motion.header>

        <section>
          {loading ? (
            <p className="text-center" style={{ color: "var(--or-pale)" }}>
              Les ancêtres rassemblent tes œuvres...
            </p>
          ) : oeuvres.length === 0 ? (
            <div
              className="text-center max-w-xl mx-auto py-16 px-8 border rounded-md"
              style={{ borderColor: "rgba(201,168,76,0.2)" }}
            >
              <p className="quote-italic text-lg mb-6" style={{ color: "var(--ivoire)" }}>
                Aucune œuvre n'a encore été composée pour toi.
              </p>
              <Link to="/parcours" className="btn-primary">
                Composer ma première œuvre
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {oeuvres.map((o) => (
                <article
                  key={o.id}
                  className="rounded-md overflow-hidden border"
                  style={{
                    background: "var(--indigo-ancestral)",
                    borderColor: "rgba(201,168,76,0.2)",
                  }}
                >
                  {o.image_url ? (
                    <img
                      src={o.image_url}
                      alt={o.nom_totem ?? "Œuvre"}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div
                      className="w-full aspect-square flex items-center justify-center"
                      style={{ background: "var(--ombre-doree)" }}
                    >
                      <span className="quote-italic" style={{ color: "var(--or-pale)" }}>
                        En cours de composition...
                      </span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col gap-3">
                    <h2 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
                      {o.nom_totem ?? "Œuvre sans nom"}
                    </h2>
                    {o.numero_serie && (
                      <span
                        className="text-xs tracking-[0.2em] uppercase"
                        style={{ color: "var(--or-pale)" }}
                      >
                        № {o.numero_serie}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "#888" }}>
                      {new Date(o.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-20 flex flex-col items-center gap-6">
          <Link to="/parcours" className="btn-secondary">
            Composer une nouvelle œuvre
          </Link>
          <button
            onClick={onLogout}
            className="text-xs tracking-[0.2em] uppercase transition-colors"
            style={{ color: "#888" }}
          >
            Quitter l'espace
          </button>
        </footer>
      </div>
    </div>
  );
}

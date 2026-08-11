-- =====================================================================
--  TOTEM ANCESTRAL — Setup complet d'un nouveau projet Supabase
--  À coller tel quel dans : Supabase → SQL Editor → Run
--  Crée : enums, tables applicatives, RLS, triggers, fonctions,
--  + le bucket storage privé "totem-deliveries".
--  Idempotent-friendly : conçu pour un projet VIERGE.
--  (Les tables backend TotemOrder / TotemPipelineError sont créées par
--   le backend via `prisma migrate deploy` au démarrage — pas ici.)
-- =====================================================================

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.commande_statut AS ENUM ('en_attente_paiement', 'paye', 'en_generation', 'livree', 'erreur', 'remboursee');
-- 'junior' inclus dès la création (évite un ALTER TYPE en transaction)
CREATE TYPE public.offre_type AS ENUM ('essentiel', 'signature', 'heritage', 'junior');

-- ============ helper updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT,
  nom TEXT,
  email TEXT,
  langue TEXT NOT NULL DEFAULT 'fr',
  pays TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-création du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, prenom, nom, langue)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'langue', 'fr')
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ REPONSES PARCOURS ============
CREATE TABLE public.reponses_parcours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  reponses JSONB NOT NULL DEFAULT '{}'::jsonb,
  langue TEXT NOT NULL DEFAULT 'fr',
  termine BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reponses_parcours_user_session_unique UNIQUE (user_id, session_id)
);
GRANT SELECT, INSERT, UPDATE ON public.reponses_parcours TO authenticated;
GRANT ALL ON public.reponses_parcours TO service_role;
ALTER TABLE public.reponses_parcours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own parcours" ON public.reponses_parcours
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all parcours" ON public.reponses_parcours
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_reponses_user ON public.reponses_parcours(user_id);
CREATE TRIGGER reponses_updated_at BEFORE UPDATE ON public.reponses_parcours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COMMANDES ============
CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reponses_id UUID REFERENCES public.reponses_parcours(id) ON DELETE SET NULL,
  offre public.offre_type NOT NULL,
  statut public.commande_statut NOT NULL DEFAULT 'en_attente_paiement',
  montant_cents INTEGER NOT NULL,
  devise TEXT NOT NULL DEFAULT 'EUR',
  pays TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  langue TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commandes TO authenticated;
GRANT ALL ON public.commandes TO service_role;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own commandes" ON public.commandes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all commandes" ON public.commandes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_commandes_user ON public.commandes(user_id);
CREATE INDEX idx_commandes_statut ON public.commandes(statut);
CREATE INDEX idx_commandes_pays ON public.commandes(pays);
CREATE TRIGGER commandes_updated_at BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ OEUVRES ============
CREATE TABLE public.oeuvres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commande_id UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  numero_serie TEXT UNIQUE,
  nom_totem TEXT,
  recit TEXT,
  image_url TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  statut TEXT NOT NULL DEFAULT 'en_cours',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.oeuvres TO authenticated;
GRANT ALL ON public.oeuvres TO service_role;
ALTER TABLE public.oeuvres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own oeuvres" ON public.oeuvres
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all oeuvres" ON public.oeuvres
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_oeuvres_user ON public.oeuvres(user_id);
CREATE INDEX idx_oeuvres_commande ON public.oeuvres(commande_id);
CREATE TRIGGER oeuvres_updated_at BEFORE UPDATE ON public.oeuvres
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ERREURS PIPELINE ============
CREATE TABLE public.erreurs_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  etape TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  tentative INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.erreurs_pipeline TO service_role;
ALTER TABLE public.erreurs_pipeline ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_erreurs_pipeline_commande ON public.erreurs_pipeline(commande_id);

-- ============ OEUVRE VERSIONS (contrat miroir backend) ============
CREATE TABLE public.oeuvre_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oeuvre_id UUID NOT NULL REFERENCES public.oeuvres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'full',
  recit TEXT,
  nom_totem TEXT,
  image_url TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (oeuvre_id, version, type)
);
GRANT SELECT ON public.oeuvre_versions TO authenticated;
GRANT ALL ON public.oeuvre_versions TO service_role;
ALTER TABLE public.oeuvre_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own oeuvre versions" ON public.oeuvre_versions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all oeuvre versions" ON public.oeuvre_versions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_oeuvre_versions_oeuvre ON public.oeuvre_versions(oeuvre_id);
CREATE INDEX idx_oeuvre_versions_user ON public.oeuvre_versions(user_id);
CREATE INDEX idx_oeuvre_versions_current ON public.oeuvre_versions(oeuvre_id, is_current);
CREATE TRIGGER oeuvre_versions_updated_at BEFORE UPDATE ON public.oeuvre_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Hardening des fonctions ============
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ============ STORAGE : bucket privé des livrables ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('totem-deliveries', 'totem-deliveries', false)
ON CONFLICT (id) DO NOTHING;

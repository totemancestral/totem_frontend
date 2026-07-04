-- ============ BACKEND MIRROR CONTRACT ============
-- Keeps the Supabase schema aligned with backend/TOTEM SupabaseMirrorService.

ALTER TABLE public.commandes
  ADD COLUMN IF NOT EXISTS pays TEXT;

CREATE INDEX IF NOT EXISTS idx_commandes_pays ON public.commandes(pays);

CREATE TABLE IF NOT EXISTS public.oeuvre_versions (
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

CREATE INDEX IF NOT EXISTS idx_oeuvre_versions_oeuvre ON public.oeuvre_versions(oeuvre_id);
CREATE INDEX IF NOT EXISTS idx_oeuvre_versions_user ON public.oeuvre_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_oeuvre_versions_current ON public.oeuvre_versions(oeuvre_id, is_current);

DROP TRIGGER IF EXISTS oeuvre_versions_updated_at ON public.oeuvre_versions;
CREATE TRIGGER oeuvre_versions_updated_at BEFORE UPDATE ON public.oeuvre_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

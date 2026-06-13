
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

-- ============ UNIQUE CONSTRAINT REPONSES ============
-- Supprimer les eventuels doublons avant d'ajouter la contrainte
DELETE FROM public.reponses_parcours a USING (
  SELECT MIN(id::text)::uuid AS id, user_id, session_id
  FROM public.reponses_parcours
  GROUP BY user_id, session_id
  HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id AND a.session_id = b.session_id AND a.id <> b.id;

ALTER TABLE public.reponses_parcours
  ADD CONSTRAINT reponses_parcours_user_session_unique
  UNIQUE (user_id, session_id);

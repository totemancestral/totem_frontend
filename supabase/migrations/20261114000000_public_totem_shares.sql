BEGIN;

CREATE TABLE public.totem_shares (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id uuid NOT NULL UNIQUE REFERENCES public.commandes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 40),
  slug text NOT NULL,
  totem_name text NOT NULL,
  excerpt text NOT NULL CHECK (char_length(excerpt) <= 280),
  preview_jpeg text NOT NULL,
  social_jpeg text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only the server may read previews, after verifying the share token or owner.
ALTER TABLE public.totem_shares ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.totem_shares FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.totem_shares TO service_role;

COMMIT;

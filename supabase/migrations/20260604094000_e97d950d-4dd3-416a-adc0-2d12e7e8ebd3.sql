
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role reste callable par authenticated (utilisé dans les politiques RLS via SECURITY DEFINER).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

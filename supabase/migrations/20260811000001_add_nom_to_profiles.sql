-- Nom de famille sur le profil.
--
-- Les oeuvres portent un numero de serie et devront pouvoir etre rattachees a
-- une personne identifiee : le prenom seul ne suffit pas a certifier qu'une
-- oeuvre appartient bien a tel client. Le nom est donc demande des la creation
-- du compte, au meme titre que le prenom.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nom TEXT;

-- Le profil cree automatiquement a l'inscription reprend desormais le nom
-- transmis dans les metadonnees du compte.
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

-- Rattrapage des comptes existants : on remonte le nom depuis les
-- metadonnees du compte quand il y est deja.
UPDATE public.profiles p
SET nom = COALESCE(NULLIF(u.raw_user_meta_data->>'nom', ''), p.nom)
FROM auth.users u
WHERE u.id = p.id AND (p.nom IS NULL OR p.nom = '');

-- Sexe declare sur le profil.
--
-- Le genre etait demande au milieu du questionnaire, juste avant la derniere
-- question. Il est desormais collecte a la creation du compte et modifiable
-- dans les parametres du profil : une seule reponse, posee une seule fois,
-- qui accorde ensuite le recit sur l'ancetre et l'adresse au client.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sexe TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sexe_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_sexe_check
  CHECK (sexe IS NULL OR sexe IN ('homme', 'femme'));

-- Le profil cree a l'inscription reprend le sexe transmis dans les
-- metadonnees du compte, au meme titre que le nom et le prenom.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, prenom, nom, sexe, langue)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    NULLIF(NEW.raw_user_meta_data->>'sexe', ''),
    COALESCE(NEW.raw_user_meta_data->>'langue', 'fr')
  );
  RETURN NEW;
END;
$$;

-- Rattrapage : on remonte le sexe deja present dans les metadonnees.
UPDATE public.profiles p
SET sexe = u.raw_user_meta_data->>'sexe'
FROM auth.users u
WHERE u.id = p.id
  AND p.sexe IS NULL
  AND u.raw_user_meta_data->>'sexe' IN ('homme', 'femme');

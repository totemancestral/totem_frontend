-- Ajoute la valeur 'junior' a l'ENUM offre_type pour libeller correctement les
-- commandes Junior. Auparavant, une commande Junior etait enregistree avec le
-- placeholder 'essentiel' (l'ENUM ne comportait pas 'junior').
-- Additif et non destructif : aucune ligne existante n'est modifiee.
ALTER TYPE public.offre_type ADD VALUE IF NOT EXISTS 'junior';

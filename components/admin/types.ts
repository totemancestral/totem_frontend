export type CommandeRow = {
  id: string;
  user_id: string;
  offre: string;
  statut: string;
  montant_cents: number;
  devise: string;
  langue: string;
  created_at: string;
  stripe_session_id: string | null;
  client_email: string | null;
  client_prenom: string | null;
};

export type OeuvreRow = {
  id: string;
  commande_id: string;
  user_id: string;
  nom_totem: string | null;
  numero_serie: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  statut: string;
  created_at: string;
  client_email: string | null;
  client_prenom: string | null;
  commande_offre: string | null;
  commande_statut: string | null;
};

export type UtilisateurRow = {
  id: string;
  email: string | null;
  prenom: string | null;
  nom: string | null;
  langue: string;
  created_at: string;
  total_commandes: number;
  commandes_actives: number;
};

export type StatsData = {
  totalCommandes: number;
  commandesActives: number;
  revenuTotal: number;
  erreurs: number;
  aujourdHui: number;
  totalUtilisateurs: number;
  totalOeuvres: number;
  oeuvresLivrees: number;
};

export type ActivitePoint = { date: string; commandes: number; revenu: number; inscriptions: number };

export type ErreurPipeline = {
  id: string;
  commande_id: string;
  etape: string;
  message: string;
  created_at: string;
  type: string;
};

export type ChangementCommande = {
  id: string;
  offre: string;
  statut: string;
  updated_at: string;
  user_id: string;
};

export type Paginated<TKey extends string, TRow> = {
  [K in TKey]: TRow[];
} & {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

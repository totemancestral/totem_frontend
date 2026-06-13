/**
 * @deprecated Legacy local auth — plus utilisé dans le flux production.
 * Conservé pour reference et tests locaux uniquement.
 * Toute nouvelle fonctionnalité doit utiliser Supabase Auth.
 */

export type Locale = "fr" | "en";

export type LocalUser = {
  id: string;
  prenom: string;
  email: string;
  langue: Locale;
  password: string;
  createdAt: string;
};

export type LocalSession = Omit<LocalUser, "password">;

export type LocalOffer = "essentiel" | "signature" | "heritage";
export type LocalOrderStatus =
  | "en_attente_paiement"
  | "paye"
  | "en_generation"
  | "livree"
  | "erreur"
  | "remboursee";

export type LocalOrder = {
  id: string;
  user_id: string;
  offre: LocalOffer;
  statut: LocalOrderStatus;
  montant_cents: number;
  devise: string;
  langue: Locale;
  created_at: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

export type LocalArtwork = {
  id: string;
  user_id: string;
  commande_id: string;
  nom_totem: string | null;
  numero_serie: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  statut: string;
  created_at: string;
};

export type LocalJourney = {
  answers?: Record<string, unknown>;
  account?: { prenom?: string; email?: string };
  hasUnlockedRest?: boolean;
  index?: number;
  phase?: string;
};

const USERS_KEY = "totem_local_users_v1";
const SESSION_KEY = "totem_local_session_v1";
const ORDERS_KEY = "totem_local_orders_v1";
const ARTWORKS_KEY = "totem_local_artworks_v1";
const JOURNEY_KEY = "totem_parcours_v1";

export function getLocalSession(): LocalSession | null {
  return readJson<LocalSession | null>(SESSION_KEY, null);
}

export function createLocalUser(input: {
  prenom: string;
  email: string;
  password: string;
  langue: Locale;
}): LocalSession {
  const users = getLocalUsers();
  const email = normalizeEmail(input.email);
  const existing = users.find((user) => normalizeEmail(user.email) === email);
  const now = new Date().toISOString();
  const user: LocalUser = existing
    ? {
        ...existing,
        prenom: input.prenom.trim() || existing.prenom,
        password: input.password,
        langue: input.langue,
      }
    : {
        id: createId(),
        prenom: input.prenom.trim(),
        email,
        password: input.password,
        langue: input.langue,
        createdAt: now,
      };

  writeJson(
    USERS_KEY,
    existing ? users.map((stored) => (stored.id === user.id ? user : stored)) : [...users, user],
  );

  return setLocalSession(user);
}

export function updateLocalUserProfile(input: {
  prenom: string;
  email: string;
  langue: Locale;
}): LocalSession {
  const session = getLocalSession();
  if (!session) {
    return createLocalUser({ ...input, password: "test-local" });
  }

  const users = getLocalUsers();
  const nextUser: LocalUser = {
    ...session,
    password: users.find((user) => user.id === session.id)?.password ?? "test-local",
    prenom: input.prenom.trim() || session.prenom,
    email: normalizeEmail(input.email) || session.email,
    langue: input.langue,
  };

  writeJson(
    USERS_KEY,
    users.some((user) => user.id === session.id)
      ? users.map((user) => (user.id === session.id ? nextUser : user))
      : [...users, nextUser],
  );

  return setLocalSession(nextUser);
}

export function signInLocalUser(email: string, password: string): LocalSession {
  const user = getLocalUsers().find(
    (stored) => normalizeEmail(stored.email) === normalizeEmail(email),
  );
  if (!user || user.password !== password) {
    throw new Error("invalid_credentials");
  }

  return setLocalSession(user);
}

export function sendLocalMagicLink(
  email: string,
  locale: Locale,
  shouldCreateUser: boolean,
): LocalSession {
  const normalizedEmail = normalizeEmail(email);
  const existing = getLocalUsers().find((user) => normalizeEmail(user.email) === normalizedEmail);
  if (existing) return setLocalSession(existing);
  if (!shouldCreateUser) throw new Error("user_not_found");

  return createLocalUser({
    prenom: normalizedEmail.split("@")[0] ?? "Voyageur",
    email: normalizedEmail,
    password: "magic-link-local",
    langue: locale,
  });
}

export function signOutLocalUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getLocalOrders(userId: string): LocalOrder[] {
  return readJson<LocalOrder[]>(ORDERS_KEY, []).filter((order) => order.user_id === userId);
}

export function getLocalArtworks(userId: string): LocalArtwork[] {
  return readJson<LocalArtwork[]>(ARTWORKS_KEY, []).filter((artwork) => artwork.user_id === userId);
}

export function getLocalJourney(): LocalJourney | null {
  return readJson<LocalJourney | null>(JOURNEY_KEY, null);
}

export function countJourneyAnswers(journey: LocalJourney | null): number {
  if (!journey?.answers) return 0;
  return Object.values(journey.answers).filter((answer) => {
    if (!answer || typeof answer !== "object") return false;
    const value = answer as { choice?: string; field?: string; skipped?: boolean };
    return Boolean(value.choice || value.field?.trim() || value.skipped);
  }).length;
}

export function createLocalOrder(input: {
  userId: string;
  offre: LocalOffer;
  montantCents: number;
  devise?: string;
  langue: Locale;
  stripeSessionId?: string | null;
}): LocalOrder {
  const orders = readJson<LocalOrder[]>(ORDERS_KEY, []);
  const order: LocalOrder = {
    id: createId(),
    user_id: input.userId,
    offre: input.offre,
    statut: "en_generation",
    montant_cents: input.montantCents,
    devise: input.devise ?? "EUR",
    langue: input.langue,
    created_at: new Date().toISOString(),
    stripe_session_id: input.stripeSessionId ?? null,
    stripe_payment_intent_id: null,
  };

  writeJson(ORDERS_KEY, [order, ...orders]);
  return order;
}

export function localOfferFromCheckoutOffer(
  offer: "origine" | "ancestral" | "famille",
): LocalOffer {
  if (offer === "origine") return "essentiel";
  if (offer === "famille") return "heritage";
  return "signature";
}

function setLocalSession(user: LocalUser): LocalSession {
  const { password: _password, ...session } = user;
  writeJson(SESSION_KEY, session);
  return session;
}

function getLocalUsers(): LocalUser[] {
  return readJson<LocalUser[]>(USERS_KEY, []);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

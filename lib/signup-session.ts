type SignupTokens = { accessToken?: string | null; refreshToken?: string | null };
type SessionClient = {
  setSession(tokens: { access_token: string; refresh_token: string }): Promise<{ error: unknown }>;
};

/** Resolve only after the browser auth client has persisted the new session. */
export async function establishSignupSession(payload: SignupTokens, auth: SessionClient): Promise<boolean> {
  if (!payload.accessToken || !payload.refreshToken) return false;
  const { error } = await auth.setSession({ access_token: payload.accessToken, refresh_token: payload.refreshToken });
  return !error;
}

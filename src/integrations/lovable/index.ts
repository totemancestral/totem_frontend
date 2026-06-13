import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google", opts?: { redirect_uri?: string }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: opts?.redirect_uri },
      });
      if (error) return { error };
      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
      }
      return { data, error: null };
    },
  },
};

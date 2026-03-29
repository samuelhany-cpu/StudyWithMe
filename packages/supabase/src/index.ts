export type SupabaseRuntimeConfig = {
  url?: string;
  anonKey?: string;
};

export const readSupabaseConfig = (config: SupabaseRuntimeConfig) => ({
  configured: Boolean(config.url && config.anonKey),
  url: config.url,
  anonKey: config.anonKey,
});

export const getSupabaseStatusMessage = (configured: boolean) =>
  configured
    ? "Supabase keys detected. Auth, persistence, and live presence can be wired next."
    : "Supabase env vars are not configured yet. The UI is running on shared mock data until keys are added.";

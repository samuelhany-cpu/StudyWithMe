import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseRuntimeConfig = {
  url?: string;
  anonKey?: string;
};

export type SupabaseStorageAdapter = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

export const supabaseTableNames = {
  profiles: "profiles",
  focusSessions: "focus_sessions",
  studyTasks: "study_tasks",
  focusRooms: "focus_rooms",
  notificationPreferences: "notification_preferences",
} as const;

export const readSupabaseConfig = (config: SupabaseRuntimeConfig) => ({
  configured: Boolean(config.url && config.anonKey),
  url: config.url,
  anonKey: config.anonKey,
});

export const getSupabaseStatusMessage = (configured: boolean) =>
  configured
    ? "Supabase keys detected. Auth, persistence, and live presence are ready to connect."
    : "Supabase env vars are not configured yet. The UI is running on shared mock data until keys are added.";

export const createStudyWithMeBrowserClient = (config: SupabaseRuntimeConfig): SupabaseClient | null => {
  if (!config.url || !config.anonKey) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const createStudyWithMeNativeClient = (
  config: SupabaseRuntimeConfig,
  storage: SupabaseStorageAdapter,
): SupabaseClient | null => {
  if (!config.url || !config.anonKey) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
};

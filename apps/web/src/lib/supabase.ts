import { createStudyWithMeBrowserClient, readSupabaseConfig } from "@studywithme/supabase";

export const supabaseConfig = readSupabaseConfig({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const supabase = createStudyWithMeBrowserClient(supabaseConfig);

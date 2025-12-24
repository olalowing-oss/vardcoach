import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log Supabase config status (remove in production)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase config missing:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
  });
}

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabaseConfigStatus = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      enabled: false,
      reason: 'SUPABASE_MISSING_CONFIG',
    };
  }
  return { enabled: true };
};

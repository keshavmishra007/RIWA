import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from './env.js';

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase client initialized with provided credentials.');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or using placeholders.');
  console.log('ℹ️ Running with fallback memory store. Update .env with SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to connect live database.');
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;

import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseAdmin = null;

if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase Admin client:', err.message);
  }
}

export { supabaseAdmin };


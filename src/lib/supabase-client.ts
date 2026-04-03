import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../config/supabase';

export const isSupabaseEnabled =
  supabaseConfig.url.trim().length > 0 &&
  supabaseConfig.anonKey.trim().length > 0;

let cachedSupabase: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!isSupabaseEnabled) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY first.',
    );
  }

  if (cachedSupabase) {
    return cachedSupabase;
  }

  cachedSupabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });

  return cachedSupabase;
};

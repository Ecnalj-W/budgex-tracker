import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabaseConfig } from '../config/supabase';
import { getSupabaseClient } from './supabase-client';
import type { AccountProfile } from '../types/account';

WebBrowser.maybeCompleteAuthSession();

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  provider: string | null;
};

const buildProfile = (user: {
  id: string;
  email?: string | null;
  app_metadata?: { provider?: string };
  user_metadata?: { display_name?: string; full_name?: string };
}): AccountProfile => ({
  userId: user.id,
  email: user.email ?? '',
  displayName:
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    '',
  provider:
    user.app_metadata?.provider === 'google' ? 'google' : 'email',
});

const upsertProfile = async (profile: AccountProfile) => {
  if (!profile.userId) {
    return;
  }

  const supabase = getSupabaseClient();

  await supabase.from(supabaseConfig.profilesTable).upsert(
    {
      id: profile.userId,
      email: profile.email,
      display_name: profile.displayName,
      provider: profile.provider ?? 'email',
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: 'id' },
  );
};

export const getCurrentAccountProfile = async () => {
  const supabase = getSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from(supabaseConfig.profilesTable)
    .select('id, email, display_name, provider')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (data) {
    return {
      userId: data.id,
      email: data.email ?? user.email ?? '',
      displayName: data.display_name ?? '',
      provider: data.provider === 'google' ? 'google' : 'email',
    } satisfies AccountProfile;
  }

  const fallbackProfile = buildProfile(user);
  await upsertProfile(fallbackProfile);
  return fallbackProfile;
};

export const registerWithEmail = async ({
  email,
  password,
  displayName,
}: {
  email: string;
  password: string;
  displayName: string;
}) => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Registration did not return a user.');
  }

  const profile = buildProfile({
    ...data.user,
    user_metadata: {
      ...data.user.user_metadata,
      display_name: displayName,
    },
  });
  await upsertProfile(profile);
  return profile;
};

export const loginWithEmail = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Login did not return a user.');
  }

  const profile = await getCurrentAccountProfile();

  if (!profile) {
    throw new Error('Could not load the account profile after login.');
  }

  return profile;
};

export const loginWithGoogle = async () => {
  const supabase = getSupabaseClient();

  const redirectTo = Linking.createURL('/auth/callback', {
    scheme: supabaseConfig.redirectScheme,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('Google OAuth did not return a login URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google login was cancelled or did not complete.');
  }

  const { queryParams } = Linking.parse(result.url);
  const code =
    typeof queryParams?.code === 'string' ? queryParams.code : undefined;

  if (!code) {
    throw new Error('Google login did not return an authorization code.');
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code,
  );

  if (exchangeError) {
    throw exchangeError;
  }

  const profile = await getCurrentAccountProfile();

  if (!profile) {
    throw new Error('Could not load the account profile after Google login.');
  }

  await upsertProfile(profile);
  return profile;
};

export const logout = async () => {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AppTheme } from '../lib/theme';
import type { AccountProfile, AppSettings } from '../types/account';

type GeneralScreenProps = {
  accountProfile: AccountProfile;
  appSettings: AppSettings;
  onAuthSubmit: (payload: {
    mode: 'login' | 'register';
    displayName: string;
    email: string;
    password: string;
  }) => void;
  onGoogleAuth: () => void;
  onSignOut: () => void;
  onToggleSetting: (field: keyof AppSettings) => void;
  theme: AppTheme;
};

export function GeneralScreen({
  accountProfile,
  appSettings,
  onAuthSubmit,
  onGoogleAuth,
  onSignOut,
  onToggleSetting,
  theme,
}: GeneralScreenProps) {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState(accountProfile.displayName);
  const [email, setEmail] = useState(accountProfile.email);
  const [password, setPassword] = useState('');

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setDisplayName(accountProfile.displayName);
    setEmail(accountProfile.email);
    setPassword('');
    setIsAuthModalVisible(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalVisible(false);
    setPassword('');
  };

  const submitAuth = () => {
    onAuthSubmit({
      mode: authMode,
      displayName,
      email,
      password,
    });
    closeAuthModal();
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.screenBg}`}>
      <ScrollView contentContainerClassName="gap-[18px] px-5 py-4 pb-8">
        <View className={`gap-4 rounded-[28px] p-6 ${theme.heroBg}`}>
          <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-slate-300">
            General
          </Text>
          <Text className="text-3xl font-extrabold text-white">
            Account and app settings
          </Text>
          <Text className="text-[15px] leading-6 text-slate-300">
            This is the home for user-specific account info, sync preferences, and
            other app controls. It is also the starting point for multi-user support.
          </Text>
        </View>

        <View className={`gap-4 rounded-3xl p-5 ${theme.cardBg}`}>
          <View className="gap-1">
            <Text className={`text-xl font-extrabold ${theme.textPrimary}`}>Account</Text>
            <Text className={`text-[13px] ${theme.textMuted}`}>
              Start with register or login, then we can connect this flow to Supabase Auth next.
            </Text>
          </View>

          <View className={`gap-3 rounded-2xl p-4 ${theme.cardAltBg}`}>
            <Text className={`text-sm ${theme.textMuted}`}>
              {accountProfile.email
                ? `Current account: ${accountProfile.displayName || 'User'} (${accountProfile.email})`
                : 'No account is active yet on this device.'}
            </Text>
            {accountProfile.email ? (
              <Pressable
                className={`rounded-2xl px-4 py-3 ${theme.chipBg}`}
                onPress={onSignOut}
              >
                <Text className={`text-center text-sm font-bold ${theme.chipText}`}>
                  Sign out
                </Text>
              </Pressable>
            ) : null}
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 rounded-2xl bg-emerald-700 px-4 py-4"
                onPress={() => openAuthModal('register')}
              >
                <Text className="text-center text-base font-bold text-white">
                  Register
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-2xl px-4 py-4 ${theme.chipBg}`}
                onPress={() => openAuthModal('login')}
              >
                <Text className={`text-center text-base font-bold ${theme.chipText}`}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className={`gap-4 rounded-3xl p-5 ${theme.cardBg}`}>
          <View className="gap-1">
            <Text className={`text-xl font-extrabold ${theme.textPrimary}`}>Settings</Text>
            <Text className={`text-[13px] ${theme.textMuted}`}>
              Sync behavior and app preferences for each user.
            </Text>
          </View>

          <Pressable
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${theme.cardAltBg}`}
            onPress={() => onToggleSetting('autoSyncOnOpen')}
          >
            <View className="flex-1 pr-4">
              <Text className={`text-base font-bold ${theme.textPrimary}`}>
                Auto sync on app open
              </Text>
              <Text className={`mt-1 text-[13px] ${theme.textMuted}`}>
                Automatically try syncing pending records when the app opens.
              </Text>
            </View>
            <Text
              className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                appSettings.autoSyncOnOpen
                  ? 'bg-emerald-100 text-emerald-800'
                  : `${theme.chipBg} ${theme.chipText}`
              }`}
            >
              {appSettings.autoSyncOnOpen ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          <Pressable
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${theme.cardAltBg}`}
            onPress={() => onToggleSetting('syncOnWifiOnly')}
          >
            <View className="flex-1 pr-4">
              <Text className={`text-base font-bold ${theme.textPrimary}`}>
                Sync on Wi-Fi only
              </Text>
              <Text className={`mt-1 text-[13px] ${theme.textMuted}`}>
                Keep sync more conservative when mobile data is limited.
              </Text>
            </View>
            <Text
              className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                appSettings.syncOnWifiOnly
                  ? 'bg-emerald-100 text-emerald-800'
                  : `${theme.chipBg} ${theme.chipText}`
              }`}
            >
              {appSettings.syncOnWifiOnly ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          <Pressable
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${theme.cardAltBg}`}
            onPress={() => onToggleSetting('darkMode')}
          >
            <View className="flex-1 pr-4">
              <Text className={`text-base font-bold ${theme.textPrimary}`}>
                Night mode
              </Text>
              <Text className={`mt-1 text-[13px] ${theme.textMuted}`}>
                Easier on the eyes when checking records at night.
              </Text>
            </View>
            <Text
              className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                appSettings.darkMode
                  ? 'bg-emerald-100 text-emerald-800'
                  : `${theme.chipBg} ${theme.chipText}`
              }`}
            >
              {appSettings.darkMode ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>

        <View className={`gap-4 rounded-3xl p-5 ${theme.cardBg}`}>
          <View className="gap-1">
            <Text className={`text-xl font-extrabold ${theme.textPrimary}`}>
              Multi-user Plan
            </Text>
            <Text className={`text-[13px] ${theme.textMuted}`}>
              What this tab is preparing for next.
            </Text>
          </View>

          <View className={`gap-3 rounded-2xl p-4 ${theme.cardAltBg}`}>
            <Text className={`text-sm leading-6 ${theme.textMuted}`}>
              Each coworker should eventually have their own authenticated account,
              their own profile row, and their own transaction records filtered by user ID.
            </Text>
            <Text className={`text-sm leading-6 ${theme.textMuted}`}>
              This screen gives the app a dedicated place for account setup, sync rules,
              and future sign in / sign out actions.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isAuthModalVisible}
        onRequestClose={closeAuthModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className={`rounded-t-[28px] p-5 ${theme.cardBg}`}>
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-extrabold ${theme.textPrimary}`}>
                  {authMode === 'register' ? 'Register account' : 'Login'}
                </Text>
                <Text className={`mt-1 text-[13px] ${theme.textMuted}`}>
                  {authMode === 'register'
                    ? 'Create an account profile for this device.'
                    : 'Open the login form and continue with your account.'}
                </Text>
              </View>
              <Pressable
                className={`rounded-full px-3 py-2 ${theme.chipBg}`}
                onPress={closeAuthModal}
              >
                <Text className={`text-xs font-bold ${theme.chipText}`}>Close</Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {authMode === 'register' ? (
                <TextInput
                  className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
                  placeholder="Display name"
                  placeholderTextColor="#78716c"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              ) : null}
              <TextInput
                className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
                placeholder="Email"
                placeholderTextColor="#78716c"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
                placeholder="Password"
                placeholderTextColor="#78716c"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              className="mt-4 rounded-2xl bg-emerald-700 px-4 py-4"
              onPress={submitAuth}
            >
              <Text className="text-center text-base font-bold text-white">
                {authMode === 'register' ? 'Create Account' : 'Login'}
              </Text>
            </Pressable>

            <View className="mt-4 flex-row items-center gap-3">
              <View className={`h-px flex-1 ${theme.border} bg-current`} />
              <Text className={`text-sm font-semibold ${theme.textMuted}`}>
                - or -
              </Text>
              <View className={`h-px flex-1 ${theme.border} bg-current`} />
            </View>

            <Pressable
              className={`mt-4 flex-row items-center justify-center gap-3 rounded-2xl border px-4 py-4 ${theme.inputBorder} ${theme.cardAltBg}`}
              onPress={() => {
                onGoogleAuth();
                closeAuthModal();
              }}
            >
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <Text className={`text-base font-bold ${theme.textPrimary}`}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              className="mt-3 px-4 py-3"
              onPress={() =>
                setAuthMode((current) =>
                  current === 'register' ? 'login' : 'register',
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-emerald-700">
                {authMode === 'register'
                  ? 'Already have an account? Switch to Login'
                  : 'Need an account? Switch to Register'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

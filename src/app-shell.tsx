import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';

import {
  loadAccountProfile,
  loadAppSettings,
  saveAccountProfile,
  saveAppSettings,
} from './lib/settings-storage';
import {
  getCurrentAccountProfile,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
} from './lib/auth';
import { getTheme } from './lib/theme';
import {
  createSeedTransactions,
  createTransaction,
  loadTransactions,
  saveTransactions,
} from './lib/transaction-storage';
import { syncPendingTransactions } from './lib/supabase-sync';
import { isSupabaseEnabled } from './lib/supabase-client';
import { GeneralScreen } from './screens/general-screen';
import { HomeScreen } from './screens/home-screen';
import { RecordsScreen } from './screens/records-screen';
import type { AccountProfile, AppSettings } from './types/account';
import type { Transaction, TransactionType } from './types/transactions';

type RootTabParamList = {
  Home: undefined;
  Records: undefined;
  General: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const navigationRef = createNavigationContainerRef<RootTabParamList>();

export function AppShell() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountProfile, setAccountProfile] = useState<AccountProfile>({
    displayName: '',
    email: '',
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    autoSyncOnOpen: false,
    syncOnWifiOnly: true,
    darkMode: false,
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSignInPromptVisible, setIsSignInPromptVisible] = useState(false);
  const [syncMessage, setSyncMessage] = useState(
    'Offline mode is active. Pending transactions will stay on this device until you sync them.',
  );

  const isSignedIn = Boolean(accountProfile.userId && accountProfile.email);

  useEffect(() => {
    const bootstrap = async () => {
      const [storedProfile, storedSettings, storedTransactions, remoteProfile] =
        await Promise.all([
          loadAccountProfile(),
          loadAppSettings(),
          loadTransactions(),
          isSupabaseEnabled ? getCurrentAccountProfile() : Promise.resolve(null),
        ]);

      setAccountProfile(remoteProfile ?? storedProfile);
      setAppSettings(storedSettings);

      if (storedTransactions.length > 0) {
        setTransactions(storedTransactions);
        setIsBootstrapping(false);
        return;
      }

      const seedTransactions = createSeedTransactions();
      await saveTransactions(seedTransactions);
      setTransactions(seedTransactions);
      setIsBootstrapping(false);
    };

    bootstrap().catch(() => {
      setSyncMessage(
        'We could not load local storage on startup. Try restarting the app.',
      );
      setIsBootstrapping(false);
    });
  }, []);

  useEffect(() => {
    if (!appSettings.autoSyncOnOpen || isBootstrapping || transactions.length === 0) {
      return;
    }

    void handleManualSync('auto');
  }, [appSettings.autoSyncOnOpen, isBootstrapping]);

  const handleAddTransaction = async ({
    description,
    amount,
    remarks,
    category,
    type,
    dateKey,
  }: {
    description: string;
    amount: string;
    remarks: string;
    category: string;
    type: TransactionType;
    dateKey: string;
  }) => {
    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription) {
      Alert.alert(
        'Missing description',
        'Add a short description for this ledger entry.',
      );
      return false;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount greater than zero.');
      return false;
    }

    const nextTransaction = createTransaction({
      description: trimmedDescription,
      category,
      amount: parsedAmount,
      type,
      remarks,
      date: `${dateKey}T12:00:00.000Z`,
    });

    const nextTransactions = [nextTransaction, ...transactions];

    await saveTransactions(nextTransactions);
    setTransactions(nextTransactions);
    setSyncMessage(
      'Transaction saved locally. It is available offline and marked as pending sync.',
    );
    return true;
  };

  const handleManualSync = async (source: 'manual' | 'auto' = 'manual') => {
    if (!isSignedIn) {
      setSyncMessage(
        'Your records are still saved locally. Sign in first when you want to back them up online.',
      );

      if (source === 'manual') {
        setIsSignInPromptVisible(true);
      }

      return;
    }

    setIsSyncing(true);

    try {
      const result = await syncPendingTransactions(transactions);
      await saveTransactions(result.syncedTransactions);
      setTransactions(result.syncedTransactions);
      setSyncMessage(result.message);
    } catch {
      setSyncMessage('Sync failed. Your local transactions are still safe.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAuthSubmit = async ({
    mode,
    displayName,
    email,
    password,
  }: {
    mode: 'login' | 'register';
    displayName: string;
    email: string;
    password: string;
  }) => {
    if (!isSupabaseEnabled) {
      setSyncMessage(
        'Supabase auth is not configured yet. Add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY first.',
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      setSyncMessage('Email and password are required for account access.');
      return;
    }

    try {
      const nextProfile =
        mode === 'register'
          ? await registerWithEmail({
              email: email.trim(),
              password,
              displayName: displayName.trim(),
            })
          : await loginWithEmail({
              email: email.trim(),
              password,
            });

      await saveAccountProfile(nextProfile);
      setAccountProfile(nextProfile);
      setSyncMessage(
        mode === 'register'
          ? 'Account registered with Supabase and saved on this device.'
          : 'Logged in with Supabase successfully.',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Authentication failed.';
      setSyncMessage(message);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isSupabaseEnabled) {
      setSyncMessage(
        'Supabase auth is not configured yet. Add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY first.',
      );
      return;
    }

    try {
      const nextProfile = await loginWithGoogle();
      await saveAccountProfile(nextProfile);
      setAccountProfile(nextProfile);
      setSyncMessage('Logged in with Google via Supabase successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google login failed.';
      setSyncMessage(message);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isSupabaseEnabled) {
        await logout();
      }

      const clearedProfile = {
        displayName: '',
        email: '',
      };

      await saveAccountProfile(clearedProfile);
      setAccountProfile(clearedProfile);
      setSyncMessage('Signed out from this device.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed.';
      setSyncMessage(message);
    }
  };

  const handleToggleSetting = async (field: keyof AppSettings) => {
    const nextSettings = {
      ...appSettings,
      [field]: !appSettings[field],
    };

    setAppSettings(nextSettings);
    await saveAppSettings(nextSettings);
  };

  const theme = getTheme(appSettings.darkMode);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={appSettings.darkMode ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0f766e',
          tabBarInactiveTintColor: appSettings.darkMode ? '#94a3b8' : '#78716c',
          tabBarStyle: {
            backgroundColor: theme.tabBarBg,
            borderTopColor: theme.tabBarBorder,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => {
            const iconName =
              route.name === 'Home'
                ? focused
                  ? 'home'
                  : 'home-outline'
                : route.name === 'Records'
                  ? focused
                    ? 'receipt'
                    : 'receipt-outline'
                  : focused
                    ? 'menu'
                    : 'menu-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">
          {() => (
            <HomeScreen
              transactions={transactions}
              isBootstrapping={isBootstrapping}
              isSyncing={isSyncing}
              syncMessage={syncMessage}
              theme={theme}
              onManualSync={() => {
                void handleManualSync('manual');
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Records">
          {() => (
            <RecordsScreen
              transactions={transactions}
              theme={theme}
              onAddTransaction={handleAddTransaction}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="General">
          {() => (
            <GeneralScreen
              accountProfile={accountProfile}
              appSettings={appSettings}
              theme={theme}
              onAuthSubmit={({ mode, displayName, email, password }) => {
                void handleAuthSubmit({ mode, displayName, email, password });
              }}
              onGoogleAuth={() => {
                void handleGoogleAuth();
              }}
              onSignOut={() => {
                void handleSignOut();
              }}
              onToggleSetting={(field) => {
                void handleToggleSetting(field);
              }}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <Modal
        animationType="fade"
        transparent
        visible={isSignInPromptVisible}
        onRequestClose={() => setIsSignInPromptVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View
            className={`w-full max-w-[360px] rounded-[28px] p-6 ${theme.cardBg}`}
          >
            <Text className={`text-2xl font-extrabold ${theme.textPrimary}`}>
              Sign in required
            </Text>
            <Text className={`mt-3 text-[15px] leading-6 ${theme.textMuted}`}>
              You can keep using the app offline without an account. To save your
              data online and sync it to backup storage, please sign in first.
            </Text>

            <View className="mt-5 gap-3">
              <Pressable
                className="rounded-2xl bg-emerald-700 px-4 py-4"
                onPress={() => {
                  setIsSignInPromptVisible(false);
                  if (navigationRef.isReady()) {
                    navigationRef.navigate('General');
                  }
                }}
              >
                <Text className="text-center text-base font-bold text-white">
                  Open Account Tab
                </Text>
              </Pressable>

              <Pressable
                className={`rounded-2xl px-4 py-4 ${theme.chipBg}`}
                onPress={() => setIsSignInPromptVisible(false)}
              >
                <Text
                  className={`text-center text-base font-bold ${theme.chipText}`}
                >
                  Keep Using Offline
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

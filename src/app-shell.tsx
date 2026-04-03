import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createSeedTransactions,
  createTransaction,
  loadTransactions,
  saveTransactions,
} from './lib/transaction-storage';
import { syncPendingTransactions } from './lib/supabase-sync';
import { HomeScreen } from './screens/home-screen';
import { RecordsScreen } from './screens/records-screen';
import type { Transaction, TransactionType } from './types/transactions';

const Tab = createBottomTabNavigator();

export function AppShell() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(
    'Offline mode is active. Pending transactions will stay on this device until you sync them.',
  );

  useEffect(() => {
    const bootstrap = async () => {
      const storedTransactions = await loadTransactions();

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

  const handleManualSync = async () => {
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

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0f766e',
          tabBarInactiveTintColor: '#78716c',
          tabBarStyle: {
            backgroundColor: '#fafaf9',
            borderTopColor: '#e7e5e4',
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
                : focused
                  ? 'receipt'
                  : 'receipt-outline';

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
              onManualSync={() => {
                void handleManualSync();
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Records">
          {() => (
            <RecordsScreen
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

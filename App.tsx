import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getCategoriesByType } from './src/constants/categories';
import {
  createSeedTransactions,
  createTransaction,
  loadTransactions,
  saveTransactions,
} from './src/lib/transaction-storage';
import {
  isSupabaseConfigured,
  syncPendingTransactions,
} from './src/lib/supabase-sync';
import type { Transaction, TransactionType } from './src/types/transactions';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const budgetCategoryTargets = [
  {
    name: 'Food',
    limit: 5000,
    color: '#e76f51',
  },
  {
    name: 'Utilities',
    limit: 3000,
    color: '#f4a261',
  },
  {
    name: 'Transport',
    limit: 2500,
    color: '#2a9d8f',
  },
];

const formatTransactionDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: '2-digit',
  }).format(new Date(isoDate));

const formatLedgerDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-PH', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  }).format(new Date(isoDate));

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [category, setCategory] = useState(getCategoriesByType('expense')[0]);
  const [remarks, setRemarks] = useState('');
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

  useEffect(() => {
    setCategory(getCategoriesByType(transactionType)[0]);
  }, [transactionType]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const balance = totalIncome - totalExpenses;

  const pendingSyncCount = useMemo(
    () =>
      transactions.filter((transaction) => transaction.syncStatus === 'pending')
        .length,
    [transactions],
  );

  const categoryTotals = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce<Record<string, number>>((accumulator, transaction) => {
          const currentTotal = accumulator[transaction.category] ?? 0;
          accumulator[transaction.category] = currentTotal + transaction.amount;
          return accumulator;
        }, {}),
    [transactions],
  );

  const budgetCategories = useMemo(
    () =>
      budgetCategoryTargets.map((categoryTarget) => ({
        ...categoryTarget,
        spent: categoryTotals[categoryTarget.name] ?? 0,
      })),
    [categoryTotals],
  );

  const ledgerEntries = useMemo(() => {
    const oldestFirst = [...transactions].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
    );

    let runningBalance = 0;

    return oldestFirst.map((transaction) => {
      const deposit = transaction.type === 'income' ? transaction.amount : null;
      const withdrawal =
        transaction.type === 'expense' ? transaction.amount : null;

      runningBalance += deposit ?? 0;
      runningBalance -= withdrawal ?? 0;

      return {
        ...transaction,
        deposit,
        withdrawal,
        balance: runningBalance,
        ledgerRemarks:
          transaction.remarks ??
          (transaction.syncStatus === 'synced' ? 'Synced' : 'Pending sync'),
      };
    });
  }, [transactions]);

  const handleAddTransaction = async () => {
    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription) {
      Alert.alert(
        'Missing description',
        'Add a short description for this ledger entry.',
      );
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount greater than zero.');
      return;
    }

    const nextTransaction = createTransaction({
      description: trimmedDescription,
      category,
      amount: parsedAmount,
      type: transactionType,
      remarks,
    });

    const nextTransactions = [nextTransaction, ...transactions];

    await saveTransactions(nextTransactions);
    setTransactions(nextTransactions);
    setDescription('');
    setAmount('');
    setRemarks('');
    setSyncMessage(
      'Transaction saved locally. It is available offline and marked as pending sync.',
    );
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
    <SafeAreaView className="flex-1 bg-stone-100">
      <StatusBar style="light" />
      <ScrollView contentContainerClassName="gap-[18px] px-5 py-4">
        <View className="gap-[18px] rounded-[28px] bg-emerald-950 p-6 shadow-sm shadow-black/20">
          <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-emerald-100">
            Budgex Tracker
          </Text>
          <Text className="text-3xl font-extrabold leading-9 text-white">
            Your money, easier to read.
          </Text>
          <Text className="text-[15px] leading-[22px] text-emerald-50/85">
            Start simple: track what came in, what went out, and where your
            budget is going this month.
          </Text>

          <View className="gap-1.5 rounded-[20px] bg-white/10 p-[18px]">
            <Text className="text-sm text-emerald-50/85">Available Balance</Text>
            <Text className="text-[34px] font-extrabold text-white">
              {currencyFormatter.format(balance)}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2 rounded-[20px] bg-emerald-700 p-4">
              <Text className="text-[13px] text-stone-50">Income</Text>
              <Text className="text-xl font-bold text-white">
                {currencyFormatter.format(totalIncome)}
              </Text>
            </View>

            <View className="flex-1 gap-2 rounded-[20px] bg-orange-700 p-4">
              <Text className="text-[13px] text-stone-50">Expenses</Text>
              <Text className="text-xl font-bold text-white">
                {currencyFormatter.format(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4 rounded-3xl bg-stone-50 p-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-xl font-extrabold text-slate-900">
                Add Transaction
              </Text>
              <Text className="text-[13px] text-slate-500">
                Passbook-style entry stored on-device first, then ready for sync.
              </Text>
            </View>
            <Text className="rounded-full bg-stone-200 px-3 py-1 text-[12px] font-semibold text-slate-600">
              30-day local cache
            </Text>
          </View>

          <View className="flex-row gap-3">
            {(['expense', 'income'] as TransactionType[]).map((type) => {
              const selected = transactionType === type;

              return (
                <Pressable
                  key={type}
                  className={`flex-1 rounded-2xl px-4 py-3 ${
                    selected ? 'bg-emerald-950' : 'bg-stone-200'
                  }`}
                  onPress={() => setTransactionType(type)}
                >
                  <Text
                    className={`text-center text-sm font-bold capitalize ${
                      selected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="gap-3">
            <TextInput
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900"
              placeholder="Description"
              placeholderTextColor="#78716c"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900"
              placeholder="Amount"
              placeholderTextColor="#78716c"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900"
              placeholder="Remarks"
              placeholderTextColor="#78716c"
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>

          <View className="gap-3">
            <Text className="text-sm font-semibold text-slate-600">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {getCategoriesByType(transactionType).map((item) => {
                const selected = item === category;

                return (
                  <Pressable
                    key={item}
                    className={`rounded-full px-4 py-2 ${
                      selected ? 'bg-orange-700' : 'bg-stone-200'
                    }`}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            className="rounded-2xl bg-emerald-700 px-4 py-4"
            onPress={() => {
              void handleAddTransaction();
            }}
          >
            <Text className="text-center text-base font-bold text-white">
              Save Transaction Offline
            </Text>
          </Pressable>
        </View>

        <View className="gap-4 rounded-3xl bg-stone-50 p-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-xl font-extrabold text-slate-900">
                Sync Status
              </Text>
              <Text className="text-[13px] text-slate-500">
                {isSupabaseConfigured()
                  ? 'Supabase connection is configured.'
                  : 'Supabase is not configured yet.'}
              </Text>
            </View>
            <Text className="rounded-full bg-stone-200 px-3 py-1 text-[12px] font-semibold text-slate-600">
              {pendingSyncCount} pending
            </Text>
          </View>

          <Text className="text-sm leading-6 text-slate-600">
            {syncMessage}
          </Text>

          <Pressable
            className={`rounded-2xl px-4 py-4 ${
              isSyncing ? 'bg-stone-300' : 'bg-slate-900'
            }`}
            disabled={isSyncing || isBootstrapping}
            onPress={() => {
              void handleManualSync();
            }}
          >
            <Text className="text-center text-base font-bold text-white">
              {isSyncing ? 'Syncing...' : 'Run Manual Sync'}
            </Text>
          </Pressable>
        </View>

        <View className="gap-4 rounded-3xl bg-stone-50 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-slate-900">
              Budget Overview
            </Text>
            <Text className="text-[13px] font-semibold text-slate-500">
              April Plan
            </Text>
          </View>

          {budgetCategories.map((category) => {
            const progress = Math.min(category.spent / category.limit, 1);

            return (
              <View key={category.name} className="gap-2.5">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-bold text-slate-800">
                      {category.name}
                    </Text>
                    <Text className="mt-0.5 text-[13px] text-slate-500">
                      {currencyFormatter.format(category.spent)} of{' '}
                      {currencyFormatter.format(category.limit)}
                    </Text>
                  </View>
                  <Text className="text-[15px] font-bold text-emerald-950">
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <View className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View className="gap-4 rounded-3xl bg-stone-50 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-slate-900">
              Ledger Records
            </Text>
            <Text className="text-[13px] font-semibold text-slate-500">
              Passbook View
            </Text>
          </View>
          <View className="rounded-2xl border border-stone-200 bg-white">
            <View className="flex-row border-b border-stone-200 bg-stone-100 px-3 py-2">
              <Text className="w-[52px] text-[11px] font-bold uppercase text-slate-500">
                Date
              </Text>
              <Text className="flex-1 text-[11px] font-bold uppercase text-slate-500">
                Description
              </Text>
              <Text className="w-[78px] text-right text-[11px] font-bold uppercase text-slate-500">
                Withdraw
              </Text>
              <Text className="w-[78px] text-right text-[11px] font-bold uppercase text-slate-500">
                Deposit
              </Text>
              <Text className="w-[78px] text-right text-[11px] font-bold uppercase text-slate-500">
                Balance
              </Text>
            </View>

            {ledgerEntries.map((entry) => (
              <View
                key={entry.id}
                className="border-b border-stone-200 px-3 py-3 last:border-b-0"
              >
                <View className="flex-row items-start">
                  <Text className="w-[52px] text-[12px] font-semibold text-slate-600">
                    {formatLedgerDate(entry.date)}
                  </Text>
                  <View className="flex-1 pr-2">
                    <Text className="text-[13px] font-bold text-slate-800">
                      {entry.description}
                    </Text>
                    <Text className="text-[11px] text-slate-500">
                      {entry.category}
                    </Text>
                  </View>
                  <Text className="w-[78px] text-right text-[12px] font-semibold text-orange-700">
                    {entry.withdrawal
                      ? currencyFormatter.format(entry.withdrawal)
                      : '-'}
                  </Text>
                  <Text className="w-[78px] text-right text-[12px] font-semibold text-emerald-700">
                    {entry.deposit ? currencyFormatter.format(entry.deposit) : '-'}
                  </Text>
                  <Text className="w-[78px] text-right text-[12px] font-bold text-slate-800">
                    {currencyFormatter.format(entry.balance)}
                  </Text>
                </View>
                <Text className="mt-2 text-[11px] text-slate-500">
                  Remarks: {entry.ledgerRemarks}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

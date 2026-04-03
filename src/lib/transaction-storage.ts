import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Transaction, TransactionType } from '../types/transactions';

const STORAGE_KEY = 'budgex:transactions';
const RETENTION_DAYS = 30;

const createIsoDate = (date = new Date()) => date.toISOString();

const isWithinRetentionWindow = (isoDate: string) => {
  const transactionTime = new Date(isoDate).getTime();
  const retentionCutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return transactionTime >= retentionCutoff;
};

export const pruneTransactions = (transactions: Transaction[]) =>
  transactions
    .filter((transaction) => isWithinRetentionWindow(transaction.date))
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    );

export const loadTransactions = async () => {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  const parsed = JSON.parse(storedValue) as Transaction[];
  const pruned = pruneTransactions(parsed);

  if (pruned.length !== parsed.length) {
    await saveTransactions(pruned);
  }

  return pruned;
};

export const saveTransactions = async (transactions: Transaction[]) => {
  const pruned = pruneTransactions(transactions);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
};

const createId = () =>
  `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createTransaction = ({
  title,
  category,
  amount,
  type,
  date,
}: {
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  date?: string;
}): Transaction => {
  const now = new Date();
  const transactionDate = date ? new Date(date) : now;
  const isoNow = createIsoDate(now);

  return {
    id: createId(),
    title: title.trim(),
    category,
    amount,
    type,
    date: createIsoDate(transactionDate),
    createdAt: isoNow,
    updatedAt: isoNow,
    syncStatus: 'pending',
    lastSyncedAt: null,
    remoteId: null,
  };
};

const createSeedDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return createIsoDate(date);
};

export const createSeedTransactions = () =>
  [
    createTransaction({
      title: 'Monthly Salary',
      category: 'Salary',
      amount: 42000,
      type: 'income',
      date: createSeedDate(2),
    }),
    createTransaction({
      title: 'Groceries',
      category: 'Food',
      amount: 2450,
      type: 'expense',
      date: createSeedDate(1),
    }),
    createTransaction({
      title: 'Internet Bill',
      category: 'Utilities',
      amount: 1699,
      type: 'expense',
      date: createSeedDate(1),
    }),
    createTransaction({
      title: 'Fuel',
      category: 'Transport',
      amount: 1200,
      type: 'expense',
      date: createSeedDate(0),
    }),
    createTransaction({
      title: 'Freelance Task',
      category: 'Side Income',
      amount: 3500,
      type: 'income',
      date: createSeedDate(0),
    }),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

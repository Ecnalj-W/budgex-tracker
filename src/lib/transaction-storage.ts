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
  userId,
  description,
  category,
  amount,
  type,
  date,
  remarks,
}: {
  userId?: string | null;
  description?: string | null;
  category: string;
  amount: number;
  type: TransactionType;
  date?: string;
  remarks?: string;
}): Transaction => {
  const now = new Date();
  const transactionDate = date ? new Date(date) : now;
  const isoNow = createIsoDate(now);

  return {
    id: createId(),
    userId: userId ?? null,
    description: description?.trim() || null,
    category,
    amount,
    type,
    date: createIsoDate(transactionDate),
    createdAt: isoNow,
    updatedAt: isoNow,
    syncStatus: 'pending',
    lastSyncedAt: null,
    remoteId: null,
    remarks: remarks?.trim() || null,
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
      description: 'Monthly Salary',
      category: 'Salary',
      amount: 42000,
      type: 'income',
      date: createSeedDate(2),
      remarks: 'Payroll credited',
    }),
    createTransaction({
      description: 'Groceries',
      category: 'Food',
      amount: 2450,
      type: 'expense',
      date: createSeedDate(1),
      remarks: 'Weekend restock',
    }),
    createTransaction({
      description: 'Internet Bill',
      category: 'Utilities',
      amount: 1699,
      type: 'expense',
      date: createSeedDate(1),
      remarks: 'Monthly service',
    }),
    createTransaction({
      description: 'Fuel',
      category: 'Transport',
      amount: 1200,
      type: 'expense',
      date: createSeedDate(0),
      remarks: 'Field travel',
    }),
    createTransaction({
      description: 'Freelance Task',
      category: 'Side Income',
      amount: 3500,
      type: 'income',
      date: createSeedDate(0),
      remarks: 'Client payout',
    }),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

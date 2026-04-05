import { supabaseConfig } from '../config/supabase';
import { getSupabaseClient } from './supabase-client';
import type { Transaction } from '../types/transactions';

export const isSupabaseConfigured = () =>
  supabaseConfig.url.trim().length > 0 &&
  supabaseConfig.anonKey.trim().length > 0;

type TransactionRow = {
  id: string;
  user_id: string | null;
  description: string | null;
  category: string;
  amount: number;
  transaction_date: string;
  transaction_type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | null;
  last_synced_at: string | null;
  remote_id: string | null;
  remarks: string | null;
};

const toTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  userId: row.user_id,
  description: row.description,
  category: row.category,
  amount: Number(row.amount),
  date: row.transaction_date,
  type: row.transaction_type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  syncStatus: row.sync_status === 'pending' ? 'pending' : 'synced',
  lastSyncedAt: row.last_synced_at,
  remoteId: row.remote_id,
  remarks: row.remarks,
});

export const mergeTransactions = (
  localTransactions: Transaction[],
  remoteTransactions: Transaction[],
) => {
  const mergedById = new Map<string, Transaction>();

  for (const transaction of remoteTransactions) {
    mergedById.set(transaction.id, transaction);
  }

  for (const transaction of localTransactions) {
    const existing = mergedById.get(transaction.id);

    if (!existing) {
      mergedById.set(transaction.id, transaction);
      continue;
    }

    if (transaction.syncStatus === 'pending') {
      mergedById.set(transaction.id, transaction);
      continue;
    }

    const localUpdatedAt = new Date(transaction.updatedAt).getTime();
    const remoteUpdatedAt = new Date(existing.updatedAt).getTime();

    if (localUpdatedAt >= remoteUpdatedAt) {
      mergedById.set(transaction.id, transaction);
    }
  }

  return [...mergedById.values()].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
};

export const fetchTransactionsForUser = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(supabaseConfig.transactionsTable)
    .select(
      'id, user_id, description, category, amount, transaction_date, transaction_type, created_at, updated_at, sync_status, last_synced_at, remote_id, remarks',
    )
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as TransactionRow[]).map(toTransaction);
};

export const syncPendingTransactions = async (
  transactions: Transaction[],
  userId: string,
) => {
  if (!isSupabaseConfigured()) {
    return {
      syncedTransactions: transactions,
      syncedCount: 0,
      message:
        'Supabase is not configured yet. Local storage is working and pending transactions are kept on-device.',
    };
  }

  const pendingTransactions = transactions.filter(
    (transaction) => transaction.syncStatus === 'pending',
  );

  if (pendingTransactions.length === 0) {
    return {
      syncedTransactions: transactions,
      syncedCount: 0,
      message: 'No pending transactions to sync.',
    };
  }

  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user || session.user.id !== userId) {
    throw new Error(
      'You are not fully signed in to Supabase yet. Log in with your account again before running cloud sync.',
    );
  }

  const syncedAt = new Date().toISOString();
  const upsertRows = pendingTransactions.map((transaction) => ({
    id: transaction.id,
    user_id: userId,
    description: transaction.description ?? null,
    category: transaction.category,
    amount: transaction.amount,
    transaction_date: transaction.date,
    transaction_type: transaction.type,
    created_at: transaction.createdAt,
    updated_at: syncedAt,
    sync_status: 'synced',
    last_synced_at: syncedAt,
    remote_id: transaction.remoteId ?? transaction.id,
    remarks: transaction.remarks,
  }));

  const { error } = await supabase
    .from(supabaseConfig.transactionsTable)
    .upsert(upsertRows as never[], { onConflict: 'id' });

  if (error) {
    throw error;
  }

  const syncedTransactions = transactions.map((transaction) => {
    if (transaction.syncStatus !== 'pending') {
      return transaction;
    }

    return {
      ...transaction,
      userId,
      syncStatus: 'synced' as const,
      lastSyncedAt: syncedAt,
      updatedAt: syncedAt,
      remoteId: transaction.remoteId ?? transaction.id,
    };
  });

  return {
    syncedTransactions,
    syncedCount: pendingTransactions.length,
    message: `Synced ${pendingTransactions.length} transaction(s) to Supabase.`,
  };
};

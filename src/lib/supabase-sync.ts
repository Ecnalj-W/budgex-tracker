import { createClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../config/supabase';
import type { Transaction } from '../types/transactions';

export const isSupabaseConfigured = () =>
  supabaseConfig.url.trim().length > 0 &&
  supabaseConfig.anonKey.trim().length > 0;

export const syncPendingTransactions = async (transactions: Transaction[]) => {
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

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

  const { error } = await supabase.from(supabaseConfig.transactionsTable).upsert(
    pendingTransactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      transaction_date: transaction.date,
      transaction_type: transaction.type,
      created_at: transaction.createdAt,
      updated_at: transaction.updatedAt,
      sync_status: transaction.syncStatus,
      last_synced_at: transaction.lastSyncedAt,
      remote_id: transaction.remoteId,
      remarks: transaction.remarks,
    })),
    { onConflict: 'id' },
  );

  if (error) {
    throw error;
  }

  const syncedAt = new Date().toISOString();
  const syncedTransactions = transactions.map((transaction) => {
    if (transaction.syncStatus !== 'pending') {
      return transaction;
    }

    return {
      ...transaction,
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

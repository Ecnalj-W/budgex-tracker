export type TransactionType = 'income' | 'expense';

export type SyncStatus = 'pending' | 'synced';

export type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: TransactionType;
  syncStatus: SyncStatus;
  lastSyncedAt?: string | null;
  remoteId?: string | null;
};

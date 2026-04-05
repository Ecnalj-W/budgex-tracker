export type TransactionType = 'income' | 'expense';

export type SyncStatus = 'pending' | 'synced';

export type Transaction = {
  id: string;
  userId?: string | null;
  description?: string | null;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: TransactionType;
  syncStatus: SyncStatus;
  lastSyncedAt?: string | null;
  remoteId?: string | null;
  remarks?: string | null;
};

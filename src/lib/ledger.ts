import { getLocalDateKey } from './date-utils';
import type { Transaction } from '../types/transactions';

export const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

type LedgerMode = 'overall' | 'daily';

export const buildLedgerEntries = (
  transactions: Transaction[],
  mode: LedgerMode = 'overall',
) => {
  const oldestFirst = [...transactions].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );

  let runningBalance = 0;
  let currentDateKey: string | null = null;

  return oldestFirst.map((transaction) => {
    const deposit = transaction.type === 'income' ? transaction.amount : null;
    const withdrawal = transaction.type === 'expense' ? transaction.amount : null;
    const dateKey = getLocalDateKey(transaction.date);

    if (mode === 'daily' && currentDateKey !== dateKey) {
      currentDateKey = dateKey;
      runningBalance = 0;
    }

    runningBalance += deposit ?? 0;
    runningBalance -= withdrawal ?? 0;

    return {
      ...transaction,
      dateKey,
      deposit,
      withdrawal,
      balance: runningBalance,
      ledgerRemarks:
        transaction.remarks ??
        (transaction.syncStatus === 'synced' ? 'Synced' : 'Pending sync'),
    };
  });
};

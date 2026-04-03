import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { LedgerTable } from '../components/ledger-table';
import { buildLedgerEntries, currencyFormatter } from '../lib/ledger';
import { isSupabaseConfigured } from '../lib/supabase-sync';
import type { Transaction } from '../types/transactions';

const budgetCategoryTargets = [
  { name: 'Food', limit: 5000, color: '#e76f51' },
  { name: 'Utilities', limit: 3000, color: '#f4a261' },
  { name: 'Transport', limit: 2500, color: '#2a9d8f' },
];

type HomeScreenProps = {
  transactions: Transaction[];
  isBootstrapping: boolean;
  isSyncing: boolean;
  syncMessage: string;
  onManualSync: () => void;
};

export function HomeScreen({
  transactions,
  isBootstrapping,
  isSyncing,
  syncMessage,
  onManualSync,
}: HomeScreenProps) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  const pendingSyncCount = transactions.filter(
    (transaction) => transaction.syncStatus === 'pending',
  ).length;

  const categoryTotals = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce<Record<string, number>>((accumulator, transaction) => {
      const currentTotal = accumulator[transaction.category] ?? 0;
      accumulator[transaction.category] = currentTotal + transaction.amount;
      return accumulator;
    }, {});

  const budgetCategories = budgetCategoryTargets.map((categoryTarget) => ({
    ...categoryTarget,
    spent: categoryTotals[categoryTarget.name] ?? 0,
  }));

  const ledgerEntries = buildLedgerEntries(transactions);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <ScrollView contentContainerClassName="gap-[18px] px-5 py-4 pb-8">
        <View className="gap-[18px] rounded-[28px] bg-emerald-950 p-6 shadow-sm shadow-black/20">
          <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-emerald-100">
            Budgex Tracker
          </Text>
          <Text className="text-3xl font-extrabold leading-9 text-white">
            Your money, easier to read.
          </Text>
          <Text className="text-[15px] leading-[22px] text-emerald-50/85">
            Homepage view for full summaries, consolidated records, and sync status.
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

          <Text className="text-sm leading-6 text-slate-600">{syncMessage}</Text>

          <Pressable
            className={`rounded-2xl px-4 py-4 ${
              isSyncing ? 'bg-stone-300' : 'bg-slate-900'
            }`}
            disabled={isSyncing || isBootstrapping}
            onPress={onManualSync}
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
              Consolidated
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
              Consolidated Ledger
            </Text>
            <Text className="text-[13px] font-semibold text-slate-500">
              All Records
            </Text>
          </View>
          <LedgerTable
            entries={ledgerEntries}
            emptyMessage="No saved records yet. Add your first entry from the Records page."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

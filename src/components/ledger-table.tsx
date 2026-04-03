import { ScrollView, Text, View } from 'react-native';

import { formatLedgerDate } from '../lib/date-utils';
import { currencyFormatter } from '../lib/ledger';

type LedgerEntry = ReturnType<typeof import('../lib/ledger').buildLedgerEntries>[number];

type LedgerTableProps = {
  entries: LedgerEntry[];
  emptyMessage: string;
};

export function LedgerTable({ entries, emptyMessage }: LedgerTableProps) {
  if (entries.length === 0) {
    return (
      <View className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8">
        <Text className="text-center text-sm text-slate-500">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="min-w-[720px] rounded-2xl border border-stone-200 bg-white">
        <View className="flex-row border-b border-stone-200 bg-stone-100 px-3 py-2">
          <Text className="w-[72px] text-[11px] font-bold uppercase text-slate-500">
            Date
          </Text>
          <Text className="w-[170px] text-[11px] font-bold uppercase text-slate-500">
            Description
          </Text>
          <Text className="w-[92px] text-right text-[11px] font-bold uppercase text-slate-500">
            Withdraw
          </Text>
          <Text className="w-[92px] text-right text-[11px] font-bold uppercase text-slate-500">
            Deposit
          </Text>
          <Text className="w-[92px] text-right text-[11px] font-bold uppercase text-slate-500">
            Balance
          </Text>
          <Text className="flex-1 pl-3 text-[11px] font-bold uppercase text-slate-500">
            Remarks
          </Text>
        </View>

        {entries.map((entry) => (
          <View
            key={entry.id}
            className="flex-row border-b border-stone-200 px-3 py-3 last:border-b-0"
          >
            <Text className="w-[72px] text-[12px] font-semibold text-slate-600">
              {formatLedgerDate(entry.date)}
            </Text>
            <View className="w-[170px] pr-3">
              <Text className="text-[13px] font-bold text-slate-800">
                {entry.description}
              </Text>
              <Text className="text-[11px] text-slate-500">{entry.category}</Text>
            </View>
            <Text className="w-[92px] text-right text-[12px] font-semibold text-orange-700">
              {entry.withdrawal ? currencyFormatter.format(entry.withdrawal) : '-'}
            </Text>
            <Text className="w-[92px] text-right text-[12px] font-semibold text-emerald-700">
              {entry.deposit ? currencyFormatter.format(entry.deposit) : '-'}
            </Text>
            <Text className="w-[92px] text-right text-[12px] font-bold text-slate-800">
              {currencyFormatter.format(entry.balance)}
            </Text>
            <Text className="flex-1 pl-3 text-[11px] text-slate-500">
              {entry.ledgerRemarks}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

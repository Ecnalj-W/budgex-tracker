import { Pressable, ScrollView, Text, View } from 'react-native';

import { formatLedgerDate } from '../lib/date-utils';
import { currencyFormatter } from '../lib/ledger';
import type { AppTheme } from '../lib/theme';

type LedgerEntry = ReturnType<typeof import('../lib/ledger').buildLedgerEntries>[number];

type LedgerTableProps = {
  entries: LedgerEntry[];
  emptyMessage: string;
  theme: AppTheme;
  onSelectEntry?: (entry: LedgerEntry) => void;
  selectedEntryId?: string | null;
};

export function LedgerTable({
  entries,
  emptyMessage,
  theme,
  onSelectEntry,
  selectedEntryId,
}: LedgerTableProps) {
  if (entries.length === 0) {
    return (
      <View className={`rounded-2xl border border-dashed px-4 py-8 ${theme.inputBorder} ${theme.cardAltBg}`}>
        <Text className={`text-center text-sm ${theme.textMuted}`}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className={`min-w-[720px] rounded-2xl border ${theme.border} ${theme.cardAltBg}`}>
        <View className={`flex-row border-b px-3 py-2 ${theme.border} ${theme.screenBg}`}>
          <Text className={`w-[72px] text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Date
          </Text>
          <Text className={`w-[170px] text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Description
          </Text>
          <Text className={`w-[92px] text-right text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Withdraw
          </Text>
          <Text className={`w-[92px] text-right text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Deposit
          </Text>
          <Text className={`w-[92px] text-right text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Balance
          </Text>
          <Text className={`flex-1 pl-3 text-[11px] font-bold uppercase ${theme.textMuted}`}>
            Remarks
          </Text>
        </View>

        {entries.map((entry) => {
          const isSelectable = Boolean(onSelectEntry);
          const isSelected = selectedEntryId === entry.id;
          const rowClasses = isSelected
            ? 'bg-emerald-50'
            : '';

          const content = (
            <View
            key={entry.id}
            className={`flex-row border-b px-3 py-3 last:border-b-0 ${theme.border} ${rowClasses}`}
          >
            <Text className={`w-[72px] text-[12px] font-semibold ${theme.textMuted}`}>
              {formatLedgerDate(entry.date)}
            </Text>
            <View className="w-[170px] pr-3">
              <Text className={`text-[13px] font-bold ${theme.textSecondary}`}>
                {entry.description?.trim() || 'No description'}
              </Text>
              <Text className={`text-[11px] ${theme.textMuted}`}>{entry.category}</Text>
            </View>
            <Text className="w-[92px] text-right text-[12px] font-semibold text-orange-700">
              {entry.withdrawal ? currencyFormatter.format(entry.withdrawal) : '-'}
            </Text>
            <Text className="w-[92px] text-right text-[12px] font-semibold text-emerald-700">
              {entry.deposit ? currencyFormatter.format(entry.deposit) : '-'}
            </Text>
            <Text className={`w-[92px] text-right text-[12px] font-bold ${theme.textSecondary}`}>
              {currencyFormatter.format(entry.balance)}
            </Text>
            <Text className={`flex-1 pl-3 text-[11px] ${theme.textMuted}`}>
              {entry.ledgerRemarks}
            </Text>
          </View>
          );

          if (!isSelectable) {
            return content;
          }

          return (
            <Pressable key={entry.id} onPress={() => onSelectEntry?.(entry)}>
              {content}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

import { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LedgerTable } from '../components/ledger-table';
import { getCategoriesByType } from '../constants/categories';
import {
  formatDisplayDate,
  getLocalDateKey,
  getRecentDateKeys,
  getTodayDateKey,
} from '../lib/date-utils';
import { buildLedgerEntries, currencyFormatter } from '../lib/ledger';
import type { AppTheme } from '../lib/theme';
import type { Transaction, TransactionType } from '../types/transactions';

type RecordsScreenProps = {
  transactions: Transaction[];
  onAddTransaction: (payload: {
    description: string;
    amount: string;
    remarks: string;
    category: string;
    type: TransactionType;
    dateKey: string;
  }) => Promise<boolean>;
  theme: AppTheme;
};

export function RecordsScreen({
  transactions,
  onAddTransaction,
  theme,
}: RecordsScreenProps) {
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [category, setCategory] = useState(getCategoriesByType('expense')[0]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    setCategory(getCategoriesByType(transactionType)[0]);
  }, [transactionType]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setSelectedDateKey(getTodayDateKey());
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const todayKey = getTodayDateKey();
  const isTodayView = selectedDateKey === todayKey;
  const ledgerEntries = buildLedgerEntries(transactions, 'daily');
  const dailyEntries = ledgerEntries.filter(
    (entry) => entry.dateKey === selectedDateKey,
  );
  const dailyIncome = dailyEntries.reduce(
    (sum, entry) => sum + (entry.deposit ?? 0),
    0,
  );
  const dailyExpenses = dailyEntries.reduce(
    (sum, entry) => sum + (entry.withdrawal ?? 0),
    0,
  );
  const dailyNet = dailyIncome - dailyExpenses;

  const dateKeys = Array.from(
    new Set([
      todayKey,
      ...getRecentDateKeys(7),
      ...transactions.map((transaction) => getLocalDateKey(transaction.date)),
    ]),
  )
    .sort((left, right) => right.localeCompare(left))
    .slice(0, 8);

  const saveTodayEntry = async () => {
    if (!isTodayView) {
      Alert.alert(
        'Today only',
        'Daily entries can only be added from today’s view. Switch back to today to continue.',
      );
      return;
    }

    const saved = await onAddTransaction({
      description,
      amount,
      remarks,
      category,
      type: transactionType,
      dateKey: selectedDateKey,
    });

    if (saved) {
      setDescription('');
      setAmount('');
      setRemarks('');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.screenBg}`}>
      <ScrollView contentContainerClassName="gap-[18px] px-5 py-4 pb-8">
        <View className={`gap-4 rounded-[28px] p-5 ${theme.cardBg}`}>
          <View className="gap-1">
            <Text className={`text-[13px] font-bold uppercase tracking-[1.2px] ${theme.textMuted}`}>
              Daily Records
            </Text>
            <Text className={`text-3xl font-extrabold ${theme.textPrimary}`}>
              {formatDisplayDate(selectedDateKey)}
            </Text>
            <Text className={`text-[14px] leading-6 ${theme.textMuted}`}>
              Each day stands on its own here. When a new day starts, this page
              returns to that day’s view and its daily totals begin from zero until
              you add entries.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {dateKeys.map((dateKey) => {
                const selected = dateKey === selectedDateKey;
                const isToday = dateKey === todayKey;

                return (
                  <Pressable
                    key={dateKey}
                    className={`rounded-full px-4 py-2 ${
                      selected ? 'bg-emerald-950' : theme.chipBg
                    }`}
                    onPress={() => setSelectedDateKey(dateKey)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : theme.chipText
                      }`}
                    >
                      {isToday ? 'Today' : formatDisplayDate(dateKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-emerald-100 p-4">
              <Text className="text-[12px] font-semibold text-emerald-900">
                Daily Income
              </Text>
              <Text className="mt-2 text-lg font-bold text-emerald-950">
                {currencyFormatter.format(dailyIncome)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-orange-100 p-4">
              <Text className="text-[12px] font-semibold text-orange-900">
                Daily Expense
              </Text>
              <Text className="mt-2 text-lg font-bold text-orange-950">
                {currencyFormatter.format(dailyExpenses)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-slate-200 p-4">
              <Text className="text-[12px] font-semibold text-slate-700">
                Net Today
              </Text>
              <Text className="mt-2 text-lg font-bold text-slate-900">
                {currencyFormatter.format(dailyNet)}
              </Text>
            </View>
          </View>
        </View>

        <View className={`gap-4 rounded-3xl p-5 ${theme.cardBg}`}>
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className={`text-xl font-extrabold ${theme.textPrimary}`}>
                Add Daily Entry
              </Text>
              <Text className={`text-[13px] ${theme.textMuted}`}>
                {isTodayView
                  ? 'This entry will be saved under today’s records.'
                  : 'Viewing an older day. Switch to Today to add a new entry.'}
              </Text>
            </View>
            <Text className={`rounded-full px-3 py-1 text-[12px] font-semibold ${theme.chipBg} ${theme.chipText}`}>
              {isTodayView ? 'Today' : 'Read only'}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {(['expense', 'income'] as TransactionType[]).map((type) => {
              const selected = transactionType === type;

              return (
                <Pressable
                  key={type}
                  className={`flex-1 rounded-2xl px-4 py-3 ${
                    selected ? 'bg-emerald-950' : theme.chipBg
                  }`}
                  onPress={() => setTransactionType(type)}
                >
                  <Text
                    className={`text-center text-sm font-bold capitalize ${
                      selected ? 'text-white' : theme.chipText
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="gap-3">
            <TextInput
              className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
              placeholder="Description"
              placeholderTextColor="#78716c"
              value={description}
              editable={isTodayView}
              onChangeText={setDescription}
            />
            <TextInput
              className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
              placeholder="Amount"
              placeholderTextColor="#78716c"
              keyboardType="decimal-pad"
              value={amount}
              editable={isTodayView}
              onChangeText={setAmount}
            />
            <TextInput
              className={`rounded-2xl border px-4 py-3 text-base ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary}`}
              placeholder="Remarks"
              placeholderTextColor="#78716c"
              value={remarks}
              editable={isTodayView}
              onChangeText={setRemarks}
            />
          </View>

          <View className="gap-3">
            <Text className={`text-sm font-semibold ${theme.chipText}`}>Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {getCategoriesByType(transactionType).map((item) => {
                const selected = item === category;

                return (
                  <Pressable
                    key={item}
                    className={`rounded-full px-4 py-2 ${
                      selected ? 'bg-orange-700' : theme.chipBg
                    }`}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : theme.chipText
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            className={`rounded-2xl px-4 py-4 ${
              isTodayView ? 'bg-emerald-700' : 'bg-stone-300'
            }`}
            disabled={!isTodayView}
            onPress={() => {
              void saveTodayEntry();
            }}
          >
            <Text className="text-center text-base font-bold text-white">
              Save To Today's Records
            </Text>
          </Pressable>
        </View>

        <View className={`gap-4 rounded-3xl p-5 ${theme.cardBg}`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-xl font-extrabold ${theme.textPrimary}`}>
              Daily Ledger
            </Text>
            <Text className={`text-[13px] font-semibold ${theme.textMuted}`}>
              {isTodayView ? 'Today' : formatDisplayDate(selectedDateKey)}
            </Text>
          </View>
          <LedgerTable
            entries={dailyEntries}
            emptyMessage="No records for this day yet. When a new day begins, this view starts fresh at zero until new entries are added."
            theme={theme}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

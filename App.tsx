import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

type TransactionType = 'income' | 'expense';

type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: TransactionType;
};

const transactions: Transaction[] = [
  {
    id: '1',
    title: 'Monthly Salary',
    category: 'Income',
    amount: 42000,
    date: 'Apr 01',
    type: 'income',
  },
  {
    id: '2',
    title: 'Groceries',
    category: 'Food',
    amount: 2450,
    date: 'Apr 02',
    type: 'expense',
  },
  {
    id: '3',
    title: 'Internet Bill',
    category: 'Utilities',
    amount: 1699,
    date: 'Apr 02',
    type: 'expense',
  },
  {
    id: '4',
    title: 'Fuel',
    category: 'Transport',
    amount: 1200,
    date: 'Apr 03',
    type: 'expense',
  },
  {
    id: '5',
    title: 'Freelance Task',
    category: 'Side Income',
    amount: 3500,
    date: 'Apr 03',
    type: 'income',
  },
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const totalIncome = transactions
  .filter((transaction) => transaction.type === 'income')
  .reduce((sum, transaction) => sum + transaction.amount, 0);

const totalExpenses = transactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce((sum, transaction) => sum + transaction.amount, 0);

const balance = totalIncome - totalExpenses;

const categoryTotals = transactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce<Record<string, number>>((accumulator, transaction) => {
    const currentTotal = accumulator[transaction.category] ?? 0;
    accumulator[transaction.category] = currentTotal + transaction.amount;
    return accumulator;
  }, {});

const budgetCategories = [
  {
    name: 'Food',
    spent: categoryTotals.Food ?? 0,
    limit: 5000,
    color: '#e76f51',
  },
  {
    name: 'Utilities',
    spent: categoryTotals.Utilities ?? 0,
    limit: 3000,
    color: '#f4a261',
  },
  {
    name: 'Transport',
    spent: categoryTotals.Transport ?? 0,
    limit: 2500,
    color: '#2a9d8f',
  },
];

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <StatusBar style="light" />
      <ScrollView contentContainerClassName="gap-[18px] px-5 py-4">
        <View className="gap-[18px] rounded-[28px] bg-emerald-950 p-6 shadow-sm shadow-black/20">
          <Text className="text-[13px] font-bold uppercase tracking-[1.2px] text-emerald-100">
            Budgex Tracker
          </Text>
          <Text className="text-3xl font-extrabold leading-9 text-white">
            Your money, easier to read.
          </Text>
          <Text className="text-[15px] leading-[22px] text-emerald-50/85">
            Start simple: track what came in, what went out, and where your
            budget is going this month.
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
            <Text className="text-xl font-extrabold text-slate-900">
              Budget Overview
            </Text>
            <Text className="text-[13px] font-semibold text-slate-500">
              April Plan
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
              Recent Transactions
            </Text>
            <Text className="text-[13px] font-semibold text-slate-500">
              This Week
            </Text>
          </View>

          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';

            return (
              <View
                key={transaction.id}
                className="flex-row items-center justify-between border-b border-stone-200 pb-3.5"
              >
                <View className="flex-1 gap-1 pr-3">
                  <Text className="text-base font-bold text-slate-800">
                    {transaction.title}
                  </Text>
                  <Text className="text-[13px] text-slate-500">
                    {transaction.category} • {transaction.date}
                  </Text>
                </View>

                <Text
                  className={`text-[15px] font-extrabold ${
                    isIncome ? 'text-emerald-700' : 'text-orange-700'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {currencyFormatter.format(transaction.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

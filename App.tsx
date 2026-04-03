import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Budgex Tracker</Text>
          <Text style={styles.heroTitle}>Your money, easier to read.</Text>
          <Text style={styles.heroSubtitle}>
            Start simple: track what came in, what went out, and where your
            budget is going this month.
          </Text>

          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>
              {currencyFormatter.format(balance)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>
                {currencyFormatter.format(totalIncome)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryValue}>
                {currencyFormatter.format(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <Text style={styles.sectionCaption}>April Plan</Text>
          </View>

          {budgetCategories.map((category) => {
            const progress = Math.min(category.spent / category.limit, 1);

            return (
              <View key={category.name} style={styles.budgetRow}>
                <View style={styles.budgetTopLine}>
                  <View>
                    <Text style={styles.budgetCategory}>{category.name}</Text>
                    <Text style={styles.budgetMeta}>
                      {currencyFormatter.format(category.spent)} of{' '}
                      {currencyFormatter.format(category.limit)}
                    </Text>
                  </View>
                  <Text style={styles.budgetPercent}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: category.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text style={styles.sectionCaption}>This Week</Text>
          </View>

          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';

            return (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionMeta}>
                    {transaction.category} • {transaction.date}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    isIncome ? styles.amountIncome : styles.amountExpense,
                  ]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efe7',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#1f3c34',
    borderRadius: 28,
    padding: 24,
    gap: 18,
    shadowColor: '#10231d',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  eyebrow: {
    color: '#cde7d9',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#d5e3dc',
    fontSize: 15,
    lineHeight: 22,
  },
  balanceBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  balanceLabel: {
    color: '#d5e3dc',
    fontSize: 14,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  incomeCard: {
    backgroundColor: '#2d6a4f',
  },
  expenseCard: {
    backgroundColor: '#9c6644',
  },
  summaryLabel: {
    color: '#f6f2eb',
    fontSize: 13,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#1c2b27',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionCaption: {
    color: '#6f7d78',
    fontSize: 13,
    fontWeight: '600',
  },
  budgetRow: {
    gap: 10,
  },
  budgetTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetCategory: {
    color: '#253733',
    fontSize: 16,
    fontWeight: '700',
  },
  budgetMeta: {
    color: '#73807b',
    fontSize: 13,
    marginTop: 2,
  },
  budgetPercent: {
    color: '#1f3c34',
    fontSize: 15,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e8e1d5',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eadf',
  },
  transactionDetails: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  transactionTitle: {
    color: '#253733',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionMeta: {
    color: '#73807b',
    fontSize: 13,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  amountIncome: {
    color: '#2d6a4f',
  },
  amountExpense: {
    color: '#b05a3c',
  },
});

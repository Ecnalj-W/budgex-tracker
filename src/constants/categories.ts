import type { TransactionType } from '../types/transactions';

export const expenseCategories = ['Food', 'Utilities', 'Transport', 'Housing', 'Health', 'Other'];

export const incomeCategories = ['Salary', 'Allowance', 'Side Income', 'Bonus', 'Other'];

export const getCategoriesByType = (type: TransactionType) =>
  type === 'income' ? incomeCategories : expenseCategories;

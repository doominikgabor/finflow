export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  lastUsed?: Date;
  status: 'active' | 'inactive' | 'cancelled';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

export interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}

export interface SpendingData {
  category: string;
  amount: number;
  color: string;
}
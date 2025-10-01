import { create } from 'zustand'
import { Transaction, Subscription, Budget } from '@/types'
import {
  mockTransactions,
  mockSubscriptions,
  mockBudgets,
} from '@/lib/mockData'

interface FinancialDataStore {
  transactions: Transaction[]
  subscriptions: Subscription[]
  budgets: Budget[]

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void

  // Subscription actions
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  deleteSubscription: (id: string) => void
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void
}

export const useFinancialData = create<FinancialDataStore>((set) => ({
  transactions: mockTransactions,
  subscriptions: mockSubscriptions,
  budgets: mockBudgets,

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  updateTransaction: (id, transaction) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...transaction } : t
      ),
    })),

  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [
        ...state.subscriptions,
        {
          ...subscription,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),

  deleteSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    })),

  updateSubscription: (id, subscription) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...subscription } : s
      ),
    })),

  addBudget: (budget) =>
    set((state) => ({
      budgets: [
        ...state.budgets,
        {
          ...budget,
          id: Math.random().toString(36).substr(2, 9),
          spent: 0, // Will be calculated dynamically
        },
      ],
    })),

  updateBudget: (id, budget) =>
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...budget } : b)),
    })),

  deleteBudget: (id) =>
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    })),
}))
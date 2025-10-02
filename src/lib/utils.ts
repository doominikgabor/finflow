import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transaction, Subscription } from "@/types"
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateSubscriptionCost(
  subscriptions: Subscription[],
  period: 'monthly' | 'yearly' = 'monthly'
): number {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + (period === 'yearly' ? monthlyCost * 12 : monthlyCost)
    }, 0)
}

export interface CashFlowData {
  month: string
  income: number
  expenses: number
}

export interface SpendingData {
  category: string
  amount: number
  fill: string
  [key: string]: string | number
}

export function calculateCashFlowData(transactions: Transaction[]): CashFlowData[] {
  const now = new Date()
  const monthsData: CashFlowData[] = []

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    // Filter transactions for this month
    const monthTransactions = transactions.filter(t =>
      isWithinInterval(t.date, { start: monthStart, end: monthEnd })
    )

    // Calculate income and expenses
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    monthsData.push({
      month: format(monthDate, 'MMM'),
      income,
      expenses,
    })
  }

  return monthsData
}

export function calculateSpendingData(transactions: Transaction[]): SpendingData[] {
  const categoryColors: Record<string, string> = {
    'Food': 'hsl(var(--chart-1))',
    'Transport': 'hsl(var(--chart-2))',
    'Entertainment': 'hsl(var(--chart-3))',
    'Shopping': 'hsl(var(--chart-4))',
    'Bills': 'hsl(var(--chart-5))',
    'Healthcare': 'hsl(142, 71%, 45%)',
    'Education': 'hsl(262, 83%, 58%)',
    'Other': 'hsl(0, 0%, 50%)',
  }

  // Group expenses by category
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  // Convert to array format for charts
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      fill: categoryColors[category] || categoryColors['Other'],
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

export function getMonthlyData(transactions: Transaction[], monthsBack: number = 6): Transaction[] {
  const now = new Date()
  const startDate = subMonths(now, monthsBack)

  return transactions.filter(t =>
    isWithinInterval(t.date, { start: startDate, end: now })
  )
}

export function calculateBudgetSpent(
  transactions: Transaction[],
  category: string,
  period: 'monthly' | 'yearly'
): number {
  const now = new Date()
  const startDate = period === 'monthly'
    ? startOfMonth(now)
    : new Date(now.getFullYear(), 0, 1) // Start of current year

  return transactions
    .filter(t =>
      t.type === 'expense' &&
      t.category === category &&
      isWithinInterval(t.date, { start: startDate, end: now })
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter(t =>
    isWithinInterval(t.date, { start: startDate, end: endDate })
  )
}

export interface MonthlyStats {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  categoryBreakdown: Record<string, number>
  dailySpending: Array<{ date: string; amount: number }>
  topCategory: string
  transactionCount: number
  avgDailySpending: number
}

export function getMonthlyStats(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): MonthlyStats {
  const filtered = filterTransactionsByDateRange(transactions, startDate, endDate)

  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netCashFlow = totalIncome - totalExpenses

  // Category breakdown (expenses only)
  const categoryBreakdown = filtered
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  // Find top spending category
  const topCategory = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

  // Daily spending
  const dailyMap = filtered
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const dateKey = format(t.date, 'yyyy-MM-dd')
      acc[dateKey] = (acc[dateKey] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const dailySpending = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const transactionCount = filtered.length
  const avgDailySpending = dailySpending.length > 0
    ? totalExpenses / dailySpending.length
    : 0

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    categoryBreakdown,
    dailySpending,
    topCategory,
    transactionCount,
    avgDailySpending,
  }
}

export function compareMonths(
  currentStats: MonthlyStats,
  previousStats: MonthlyStats
): {
  incomeChange: number
  expenseChange: number
  cashFlowChange: number
} {
  const incomeChange = previousStats.totalIncome > 0
    ? ((currentStats.totalIncome - previousStats.totalIncome) / previousStats.totalIncome) * 100
    : 0

  const expenseChange = previousStats.totalExpenses > 0
    ? ((currentStats.totalExpenses - previousStats.totalExpenses) / previousStats.totalExpenses) * 100
    : 0

  const cashFlowChange = previousStats.netCashFlow !== 0
    ? ((currentStats.netCashFlow - previousStats.netCashFlow) / Math.abs(previousStats.netCashFlow)) * 100
    : 0

  return {
    incomeChange,
    expenseChange,
    cashFlowChange,
  }
}

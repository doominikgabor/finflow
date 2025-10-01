import * as XLSX from 'xlsx'
import { Transaction, Subscription } from '@/types'
import { formatCurrency } from './utils'
import { format } from 'date-fns'

export interface ExportOptions {
  transactions: Transaction[]
  subscriptions: Subscription[]
  dateRange: {
    start: Date
    end: Date
  }
  includeSummary?: boolean
  includeTransactions?: boolean
  includeIncomeBreakdown?: boolean
  includeExpenseBreakdown?: boolean
  includeSubscriptions?: boolean
}

export function exportToExcel(options: ExportOptions) {
  const {
    transactions,
    subscriptions,
    dateRange,
    includeSummary = true,
    includeTransactions = true,
    includeIncomeBreakdown = true,
    includeExpenseBreakdown = true,
    includeSubscriptions = true,
  } = options

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(
    t => t.date >= dateRange.start && t.date <= dateRange.end
  )

  const workbook = XLSX.utils.book_new()

  // Sheet 1 - Summary
  if (includeSummary) {
    const summarySheet = generateSummarySheet(filteredTransactions, subscriptions)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  }

  // Sheet 2 - All Transactions
  if (includeTransactions) {
    const transactionsSheet = generateTransactionsSheet(filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions')
  }

  // Sheet 3 - Income Breakdown
  if (includeIncomeBreakdown) {
    const incomeSheet = generateIncomeBreakdownSheet(filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Breakdown')
  }

  // Sheet 4 - Expense Breakdown
  if (includeExpenseBreakdown) {
    const expenseSheet = generateExpenseBreakdownSheet(filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Breakdown')
  }

  // Sheet 5 - Subscriptions
  if (includeSubscriptions && subscriptions.length > 0) {
    const subscriptionsSheet = generateSubscriptionsSheet(subscriptions)
    XLSX.utils.book_append_sheet(workbook, subscriptionsSheet, 'Subscriptions')
  }

  // Generate filename
  const filename = `FinFlow_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

  // Write the file
  XLSX.writeFile(workbook, filename)
}

function generateSummarySheet(transactions: Transaction[], subscriptions: Subscription[]) {
  const income = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : '0.00'

  // Income by category
  const incomeByCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Expense by category
  const expenseByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Active subscriptions
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const subscriptionsCost = activeSubscriptions.reduce((sum, s) => {
    const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
    return sum + monthlyCost
  }, 0)

  const data = [
    ['FINANCIAL SUMMARY'],
    [''],
    ['INCOME'],
    ['Total Income', totalIncome],
    [''],
    ['Income by Category:'],
    ...Object.entries(incomeByCategory).map(([cat, amount]) => [cat, amount]),
    [''],
    ['EXPENSES'],
    ['Total Expenses', totalExpenses],
    [''],
    ['Expense by Category:'],
    ...Object.entries(expenseByCategory).map(([cat, amount]) => [cat, amount]),
    [''],
    ['SUBSCRIPTIONS'],
    ['Active Subscriptions', activeSubscriptions.length],
    ['Monthly Subscription Cost', subscriptionsCost],
    ['Annual Projection', subscriptionsCost * 12],
    [''],
    ['NET SUMMARY'],
    ['Net Savings', netSavings],
    ['Savings Rate', `${savingsRate}%`],
  ]

  return XLSX.utils.aoa_to_sheet(data)
}

function generateTransactionsSheet(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime())

  const data = [
    ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring', 'Frequency'],
    ...sorted.map(t => [
      format(t.date, 'yyyy-MM-dd'),
      t.description,
      t.category,
      t.type,
      t.amount,
      t.recurring ? 'Yes' : 'No',
      t.recurring ? (t.frequency || 'N/A') : 'N/A',
    ])
  ]

  return XLSX.utils.aoa_to_sheet(data)
}

function generateIncomeBreakdownSheet(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income')
  const total = income.reduce((sum, t) => sum + t.amount, 0)

  const byCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const data = [
    ['INCOME BREAKDOWN'],
    [''],
    ['Category', 'Amount', 'Percentage'],
    ...Object.entries(byCategory).map(([cat, amount]) => [
      cat,
      amount,
      `${((amount / total) * 100).toFixed(2)}%`
    ]),
    [''],
    ['TOTAL INCOME', total, '100.00%'],
  ]

  return XLSX.utils.aoa_to_sheet(data)
}

function generateExpenseBreakdownSheet(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amount, 0)

  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const data = [
    ['EXPENSE BREAKDOWN'],
    [''],
    ['Category', 'Amount', 'Percentage'],
    ...Object.entries(byCategory).map(([cat, amount]) => [
      cat,
      amount,
      `${((amount / total) * 100).toFixed(2)}%`
    ]),
    [''],
    ['TOTAL EXPENSES', total, '100.00%'],
  ]

  return XLSX.utils.aoa_to_sheet(data)
}

function generateSubscriptionsSheet(subscriptions: Subscription[]) {
  const active = subscriptions.filter(s => s.status === 'active')

  const data = [
    ['ACTIVE SUBSCRIPTIONS'],
    [''],
    ['Name', 'Category', 'Cost', 'Billing Cycle', 'Monthly Cost', 'Annual Cost', 'Next Billing', 'Last Used'],
    ...active.map(s => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
      const annualCost = monthlyCost * 12
      return [
        s.name,
        s.category,
        s.cost,
        s.billingCycle,
        monthlyCost,
        annualCost,
        format(s.nextBillingDate, 'yyyy-MM-dd'),
        s.lastUsed ? format(s.lastUsed, 'yyyy-MM-dd') : 'Never',
      ]
    }),
    [''],
    ['TOTALS'],
    ['Total Monthly Cost', active.reduce((sum, s) => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + monthlyCost
    }, 0)],
    ['Total Annual Cost', active.reduce((sum, s) => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + (monthlyCost * 12)
    }, 0)],
  ]

  return XLSX.utils.aoa_to_sheet(data)
}
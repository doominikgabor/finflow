import * as XLSX from 'xlsx-js-style'
import { Transaction, Subscription, Budget } from '@/types'
import { formatCurrency, getMonthlyStats } from './utils'
import { format } from 'date-fns'

export interface ExportOptions {
  transactions: Transaction[]
  subscriptions: Subscription[]
  budgets: Budget[]
  dateRange: {
    start: Date
    end: Date
    label: string
  }
  includeSummary?: boolean
  includeTransactions?: boolean
  includeIncomeBreakdown?: boolean
  includeExpenseBreakdown?: boolean
  includeSubscriptions?: boolean
  includeBudgets?: boolean
  filename?: string
}

// Color palette for professional styling
const COLORS = {
  header: { fgColor: { rgb: '1976D2' } },
  headerText: { color: { rgb: 'FFFFFF' } },
  income: { fgColor: { rgb: 'E8F5E9' } },
  incomeLight: { fgColor: { rgb: 'F1F8E9' } },
  expense: { fgColor: { rgb: 'FFEBEE' } },
  expenseLight: { fgColor: { rgb: 'FCE4EC' } },
  savings: { fgColor: { rgb: 'E3F2FD' } },
  warning: { fgColor: { rgb: 'FFF3E0' } },
  danger: { fgColor: { rgb: 'FFCDD2' } },
  success: { fgColor: { rgb: 'C8E6C9' } },
  highlight: { fgColor: { rgb: 'FFF9C4' } },
  purple: { fgColor: { rgb: 'E1BEE7' } },
  gold: { fgColor: { rgb: 'FFD54F' } },
  silver: { fgColor: { rgb: 'E0E0E0' } },
  bronze: { fgColor: { rgb: 'FFAB91' } },
}

const FONTS = {
  title: { name: 'Calibri', sz: 18, bold: true },
  heading: { name: 'Calibri', sz: 14, bold: true },
  subheading: { name: 'Calibri', sz: 12, bold: true },
  normal: { name: 'Calibri', sz: 11 },
  small: { name: 'Calibri', sz: 10 },
}

const BORDERS = {
  thin: { style: 'thin', color: { rgb: 'CCCCCC' } },
  thick: { style: 'thick', color: { rgb: '666666' } },
  double: { style: 'double', color: { rgb: '333333' } },
}

const ALIGNMENT = {
  center: { horizontal: 'center', vertical: 'center' },
  left: { horizontal: 'left', vertical: 'center' },
  right: { horizontal: 'right', vertical: 'center' },
}

export function exportToExcel(options: ExportOptions) {
  const {
    transactions,
    subscriptions,
    budgets,
    dateRange,
    includeSummary = true,
    includeTransactions = true,
    includeIncomeBreakdown = true,
    includeExpenseBreakdown = true,
    includeSubscriptions = true,
    includeBudgets = true,
    filename,
  } = options

  const filteredTransactions = transactions.filter(
    t => t.date >= dateRange.start && t.date <= dateRange.end
  )

  const workbook = XLSX.utils.book_new()

  if (includeSummary) {
    const sheet = generateExecutiveSummary(filteredTransactions, subscriptions, budgets, dateRange.label, transactions)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Executive Summary')
    workbook.Sheets['Executive Summary']['!tabColor'] = { rgb: '1976D2' }
  }

  if (includeTransactions) {
    const sheet = generateTransactionsSheet(filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, sheet, 'All Transactions')
    workbook.Sheets['All Transactions']['!tabColor'] = { rgb: '4CAF50' }
  }

  if (includeIncomeBreakdown) {
    const sheet = generateIncomeAnalysis(filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Income Analysis')
    workbook.Sheets['Income Analysis']['!tabColor'] = { rgb: '2E7D32' }
  }

  if (includeExpenseBreakdown) {
    const sheet = generateExpenseAnalysis(filteredTransactions, budgets)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Expense Analysis')
    workbook.Sheets['Expense Analysis']['!tabColor'] = { rgb: 'D32F2F' }
  }

  if (includeSubscriptions && subscriptions.length > 0) {
    const sheet = generateSubscriptionsSheet(subscriptions)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Subscriptions')
    workbook.Sheets['Subscriptions']['!tabColor'] = { rgb: '7B1FA2' }
  }

  if (includeBudgets && budgets.length > 0) {
    const sheet = generateBudgetReport(budgets, filteredTransactions)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Budget Report')
    workbook.Sheets['Budget Report']['!tabColor'] = { rgb: 'F57C00' }
  }

  const defaultFilename = filename || `FinFlow_Report_${format(new Date(), 'MMM_yyyy')}.xlsx`
  XLSX.writeFile(workbook, defaultFilename)
}

function generateExecutiveSummary(
  filteredTransactions: Transaction[],
  subscriptions: Subscription[],
  budgets: Budget[],
  periodLabel: string,
  allTransactions: Transaction[]
) {
  const stats = getMonthlyStats(allTransactions, filteredTransactions[0]?.date || new Date(), new Date())

  const income = filteredTransactions.filter(t => t.type === 'income')
  const expenses = filteredTransactions.filter(t => t.type === 'expense')

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0'

  const incomeByCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const expenseByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const subscriptionsCost = activeSubscriptions.reduce((sum, s) => {
    const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
    return sum + monthlyCost
  }, 0)

  const ws: any = {}

  // Title and header
  ws['A1'] = {
    v: '💰 FINFLOW FINANCIAL REPORT',
    s: { font: FONTS.title, alignment: ALIGNMENT.center, fill: COLORS.header, font: { ...FONTS.title, color: { rgb: 'FFFFFF' } } }
  }
  ws['A2'] = {
    v: `Period: ${periodLabel}`,
    s: { font: FONTS.heading, alignment: ALIGNMENT.center, fill: COLORS.highlight }
  }
  ws['A3'] = {
    v: `Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
    s: { font: FONTS.small, alignment: ALIGNMENT.center }
  }

  let row = 5

  // KEY METRICS SECTION
  ws[`A${row}`] = { v: '📊 KEY METRICS', s: { font: FONTS.heading, fill: COLORS.header, font: { ...FONTS.heading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.left } }
  row += 2

  const metrics = [
    { label: 'Total Income', value: totalIncome, color: COLORS.income },
    { label: 'Total Expenses', value: totalExpenses, color: COLORS.expense },
    { label: 'Net Savings', value: netSavings, color: netSavings >= 0 ? COLORS.success : COLORS.danger },
    { label: 'Savings Rate', value: `${savingsRate}%`, color: COLORS.savings, isPercent: true },
  ]

  metrics.forEach((metric) => {
    ws[`A${row}`] = { v: metric.label, s: { font: FONTS.subheading, alignment: ALIGNMENT.left } }
    ws[`B${row}`] = {
      v: metric.isPercent ? metric.value : metric.value,
      t: metric.isPercent ? 's' : 'n',
      z: metric.isPercent ? '0' : '"$"#,##0.00',
      s: { font: { ...FONTS.heading, bold: true }, fill: metric.color, alignment: ALIGNMENT.right, border: { top: BORDERS.thin, bottom: BORDERS.thin, left: BORDERS.thin, right: BORDERS.thin } }
    }
    row++
  })

  row += 2

  // INCOME BREAKDOWN
  ws[`A${row}`] = { v: '💵 INCOME BREAKDOWN', s: { font: FONTS.heading, fill: COLORS.income, alignment: ALIGNMENT.left } }
  row += 2

  ws[`A${row}`] = { v: 'Category', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.left } }
  ws[`B${row}`] = { v: 'Amount', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`C${row}`] = { v: '%', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`D${row}`] = { v: 'Visual', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.left } }
  row++

  Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, amount], index) => {
      const percentage = (amount / totalIncome) * 100
      const barLength = Math.round(percentage / 5)
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength)

      ws[`A${row}`] = { v: cat, s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.left } }
      ws[`B${row}`] = { v: amount, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`C${row}`] = { v: `${percentage.toFixed(1)}%`, s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`D${row}`] = { v: bar, s: { font: { ...FONTS.small, name: 'Courier New' }, fill: COLORS.incomeLight, alignment: ALIGNMENT.left } }
      row++
    })

  ws[`A${row}`] = { v: 'TOTAL', s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }
  ws[`B${row}`] = { v: totalIncome, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`C${row}`] = { v: '100.0%', s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  row += 3

  // EXPENSE BREAKDOWN
  ws[`A${row}`] = { v: '💳 EXPENSE BREAKDOWN', s: { font: FONTS.heading, fill: COLORS.expense, alignment: ALIGNMENT.left } }
  row += 2

  ws[`A${row}`] = { v: 'Category', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.left } }
  ws[`B${row}`] = { v: 'Amount', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`C${row}`] = { v: '%', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`D${row}`] = { v: 'Visual', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.left } }
  row++

  Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, amount], index) => {
      const percentage = (amount / totalExpenses) * 100
      const barLength = Math.round(percentage / 5)
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength)

      let fillColor = COLORS.expenseLight
      if (index === 0) fillColor = COLORS.gold
      else if (index === 1) fillColor = COLORS.silver
      else if (index === 2) fillColor = COLORS.bronze

      ws[`A${row}`] = { v: cat, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.left } }
      ws[`B${row}`] = { v: amount, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`C${row}`] = { v: `${percentage.toFixed(1)}%`, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`D${row}`] = { v: bar, s: { font: { ...FONTS.small, name: 'Courier New' }, fill: fillColor, alignment: ALIGNMENT.left } }
      row++
    })

  ws[`A${row}`] = { v: 'TOTAL', s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }
  ws[`B${row}`] = { v: totalExpenses, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`C${row}`] = { v: '100.0%', s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  row += 3

  // KEY INSIGHTS
  ws[`A${row}`] = { v: '💡 KEY INSIGHTS', s: { font: FONTS.heading, fill: COLORS.highlight, alignment: ALIGNMENT.left } }
  row += 2

  const insights = [
    { label: 'Financial Health', value: netSavings >= 0 ? '✓ Positive' : '✗ Negative', status: netSavings >= 0 },
    { label: 'Top Spending', value: stats.topCategory, status: true },
    { label: 'Transactions', value: `${filteredTransactions.length} total`, status: true },
    { label: 'Avg Daily Spending', value: formatCurrency(stats.avgDailySpending), status: true },
    { label: 'Active Subscriptions', value: `${activeSubscriptions.length} (${formatCurrency(subscriptionsCost)}/mo)`, status: true },
    { label: 'Budgets Tracked', value: `${budgets.length} categories`, status: true },
  ]

  insights.forEach((insight) => {
    ws[`A${row}`] = { v: insight.label, s: { font: FONTS.normal, alignment: ALIGNMENT.left } }
    ws[`B${row}`] = {
      v: insight.value,
      s: { font: FONTS.normal, fill: insight.status ? COLORS.success : COLORS.danger, alignment: ALIGNMENT.left }
    }
    row++
  })

  // Set column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 25 },
  ]

  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Period
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Generated
  ]

  ws['!ref'] = `A1:D${row}`

  return ws
}

function generateTransactionsSheet(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime())

  const ws: any = {}

  // Header
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring', 'Frequency']
  headers.forEach((header, i) => {
    const cell = String.fromCharCode(65 + i) + '1'
    ws[cell] = {
      v: header,
      s: {
        font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } },
        fill: COLORS.header,
        alignment: ALIGNMENT.center,
        border: { top: BORDERS.thin, bottom: BORDERS.thin, left: BORDERS.thin, right: BORDERS.thin }
      }
    }
  })

  // Data rows with alternating colors and type-based highlighting
  sorted.forEach((t, index) => {
    const row = index + 2
    const isIncome = t.type === 'income'
    const fillColor = isIncome ? COLORS.incomeLight : COLORS.expenseLight
    const recurringFill = t.recurring ? COLORS.purple : fillColor

    ws[`A${row}`] = { v: format(t.date, 'yyyy-MM-dd'), s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.center } }
    ws[`B${row}`] = { v: t.description, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.left } }
    ws[`C${row}`] = { v: t.category, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.left } }
    ws[`D${row}`] = {
      v: t.type.toUpperCase(),
      s: { font: { ...FONTS.normal, bold: true }, fill: fillColor, alignment: ALIGNMENT.center }
    }
    ws[`E${row}`] = {
      v: t.amount,
      t: 'n',
      z: '"$"#,##0.00',
      s: { font: { ...FONTS.normal, bold: true }, fill: fillColor, alignment: ALIGNMENT.right }
    }
    ws[`F${row}`] = {
      v: t.recurring ? '🔄 YES' : 'No',
      s: { font: FONTS.normal, fill: recurringFill, alignment: ALIGNMENT.center }
    }
    ws[`G${row}`] = { v: t.recurring ? (t.frequency || 'N/A').toUpperCase() : '-', s: { font: FONTS.small, fill: recurringFill, alignment: ALIGNMENT.center } }
  })

  // Totals row
  const totalRow = sorted.length + 2
  const totalIncome = sorted.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = sorted.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  ws[`A${totalRow}`] = { v: 'TOTALS', s: { font: FONTS.subheading, fill: COLORS.highlight, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }
  ws[`B${totalRow}`] = { v: `Income: ${formatCurrency(totalIncome)}`, s: { font: FONTS.normal, fill: COLORS.income, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }
  ws[`C${totalRow}`] = { v: `Expenses: ${formatCurrency(totalExpenses)}`, s: { font: FONTS.normal, fill: COLORS.expense, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }
  ws[`D${totalRow}`] = { v: `Net: ${formatCurrency(totalIncome - totalExpenses)}`, s: { font: FONTS.normal, fill: COLORS.savings, alignment: ALIGNMENT.left, border: { top: BORDERS.thick } } }

  ws['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ]

  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  ws['!ref'] = `A1:G${totalRow}`

  return ws
}

function generateIncomeAnalysis(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income')
  const total = income.reduce((sum, t) => sum + t.amount, 0)

  const byCategory = income.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { amount: 0, count: 0 }
    }
    acc[t.category].amount += t.amount
    acc[t.category].count += 1
    return acc
  }, {} as Record<string, { amount: number; count: number }>)

  const ws: any = {}

  // Title
  ws['A1'] = { v: '💵 INCOME ANALYSIS', s: { font: FONTS.title, fill: COLORS.income, alignment: ALIGNMENT.center } }

  let row = 3
  ws[`A${row}`] = { v: 'Category', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } } } }
  ws[`B${row}`] = { v: 'Amount', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`C${row}`] = { v: '%', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`D${row}`] = { v: 'Count', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`E${row}`] = { v: 'Avg/Transaction', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`F${row}`] = { v: 'Progress Bar', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } } } }
  row++

  Object.entries(byCategory)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .forEach(([cat, data]) => {
      const percentage = (data.amount / total) * 100
      const barLength = Math.round(percentage / 5)
      const progressBar = '█'.repeat(barLength) + '░'.repeat(20 - barLength) + ` ${percentage.toFixed(1)}%`

      ws[`A${row}`] = { v: cat, s: { font: FONTS.normal, fill: COLORS.incomeLight } }
      ws[`B${row}`] = { v: data.amount, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`C${row}`] = { v: `${percentage.toFixed(1)}%`, s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`D${row}`] = { v: data.count, s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`E${row}`] = { v: data.amount / data.count, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }
      ws[`F${row}`] = { v: progressBar, s: { font: { ...FONTS.small, name: 'Courier New' }, fill: COLORS.incomeLight } }
      row++
    })

  row++
  ws[`A${row}`] = { v: 'TOTAL INCOME', s: { font: FONTS.subheading, fill: COLORS.income, border: { top: BORDERS.thick } } }
  ws[`B${row}`] = { v: total, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`C${row}`] = { v: '100.0%', s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`D${row}`] = { v: income.length, s: { font: FONTS.subheading, fill: COLORS.income, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }

  row += 3
  ws[`A${row}`] = { v: '🔄 RECURRING vs ONE-TIME', s: { font: FONTS.heading, fill: COLORS.highlight } }
  row++
  const recurringIncome = income.filter(t => t.recurring).reduce((sum, t) => sum + t.amount, 0)
  const oneTimeIncome = total - recurringIncome

  ws[`A${row}`] = { v: 'Recurring Income', s: { font: FONTS.normal, fill: COLORS.purple } }
  ws[`B${row}`] = { v: recurringIncome, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.purple, alignment: ALIGNMENT.right } }
  row++
  ws[`A${row}`] = { v: 'One-time Income', s: { font: FONTS.normal, fill: COLORS.incomeLight } }
  ws[`B${row}`] = { v: oneTimeIncome, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.incomeLight, alignment: ALIGNMENT.right } }

  ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]
  ws['!ref'] = `A1:F${row}`

  return ws
}

function generateExpenseAnalysis(transactions: Transaction[], budgets: Budget[]) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + t.amount, 0)

  const byCategory = expenses.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { amount: 0, count: 0 }
    }
    acc[t.category].amount += t.amount
    acc[t.category].count += 1
    return acc
  }, {} as Record<string, { amount: number; count: number }>)

  const ws: any = {}

  ws['A1'] = { v: '💳 EXPENSE ANALYSIS', s: { font: FONTS.title, fill: COLORS.expense, alignment: ALIGNMENT.center } }

  let row = 3
  ws[`A${row}`] = { v: 'Category', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } } } }
  ws[`B${row}`] = { v: 'Amount', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`C${row}`] = { v: '%', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`D${row}`] = { v: 'Count', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`E${row}`] = { v: 'Budget', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, alignment: ALIGNMENT.right } }
  ws[`F${row}`] = { v: 'Status', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } } } }
  ws[`G${row}`] = { v: 'Progress Bar', s: { font: FONTS.subheading, fill: COLORS.header, font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } } } }
  row++

  Object.entries(byCategory)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .forEach(([cat, data], index) => {
      const percentage = (data.amount / total) * 100
      const budget = budgets.find(b => b.category === cat)
      const budgetLimit = budget?.limit || 0

      let status = 'No Budget'
      let statusColor = COLORS.expenseLight

      if (budget) {
        const budgetUsage = (data.amount / budgetLimit) * 100
        if (budgetUsage <= 70) {
          status = `✓ ${budgetUsage.toFixed(0)}%`
          statusColor = COLORS.success
        } else if (budgetUsage <= 90) {
          status = `⚠ ${budgetUsage.toFixed(0)}%`
          statusColor = COLORS.warning
        } else {
          status = `✗ ${budgetUsage.toFixed(0)}%`
          statusColor = COLORS.danger
        }
      }

      const barLength = Math.round(percentage / 5)
      const progressBar = '█'.repeat(barLength) + '░'.repeat(20 - barLength)

      let fillColor = COLORS.expenseLight
      if (index === 0) fillColor = COLORS.gold
      else if (index === 1) fillColor = COLORS.silver
      else if (index === 2) fillColor = COLORS.bronze

      ws[`A${row}`] = { v: cat, s: { font: FONTS.normal, fill: fillColor } }
      ws[`B${row}`] = { v: data.amount, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`C${row}`] = { v: `${percentage.toFixed(1)}%`, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`D${row}`] = { v: data.count, s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`E${row}`] = { v: budgetLimit || 'N/A', t: budgetLimit ? 'n' : 's', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: fillColor, alignment: ALIGNMENT.right } }
      ws[`F${row}`] = { v: status, s: { font: { ...FONTS.normal, bold: true }, fill: statusColor, alignment: ALIGNMENT.center } }
      ws[`G${row}`] = { v: progressBar, s: { font: { ...FONTS.small, name: 'Courier New' }, fill: fillColor } }
      row++
    })

  row++
  ws[`A${row}`] = { v: 'TOTAL EXPENSES', s: { font: FONTS.subheading, fill: COLORS.expense, border: { top: BORDERS.thick } } }
  ws[`B${row}`] = { v: total, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`C${row}`] = { v: '100.0%', s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`D${row}`] = { v: expenses.length, s: { font: FONTS.subheading, fill: COLORS.expense, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }

  ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]
  ws['!ref'] = `A1:G${row}`

  return ws
}

function generateSubscriptionsSheet(subscriptions: Subscription[]) {
  const active = subscriptions.filter(s => s.status === 'active')

  const ws: any = {}

  ws['A1'] = { v: '📱 ACTIVE SUBSCRIPTIONS', s: { font: FONTS.title, fill: COLORS.purple, alignment: ALIGNMENT.center } }

  let row = 3
  const headers = ['Name', 'Category', 'Cost', 'Billing', 'Monthly', 'Annual', 'Next Billing', 'Last Used', 'Status']
  headers.forEach((header, i) => {
    const cell = String.fromCharCode(65 + i) + row
    ws[cell] = {
      v: header,
      s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.center }
    }
  })
  row++

  active.forEach((s) => {
    const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
    const annualCost = monthlyCost * 12
    const daysSinceUsed = s.lastUsed ? Math.floor((new Date().getTime() - s.lastUsed.getTime()) / (1000 * 60 * 60 * 24)) : 999
    const daysUntilBilling = Math.floor((s.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    let status = '✓ Active'
    let statusColor = COLORS.success

    if (daysSinceUsed > 30) {
      status = '⚠ Unused 30+ days'
      statusColor = COLORS.warning
    }

    let billingColor = COLORS.expenseLight
    if (daysUntilBilling <= 7) {
      billingColor = COLORS.warning
    }

    ws[`A${row}`] = { v: s.name, s: { font: FONTS.normal, fill: COLORS.purple } }
    ws[`B${row}`] = { v: s.category, s: { font: FONTS.normal, fill: COLORS.purple } }
    ws[`C${row}`] = { v: s.cost, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.purple, alignment: ALIGNMENT.right } }
    ws[`D${row}`] = { v: s.billingCycle, s: { font: FONTS.normal, fill: COLORS.purple, alignment: ALIGNMENT.center } }
    ws[`E${row}`] = { v: monthlyCost, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: COLORS.purple, alignment: ALIGNMENT.right } }
    ws[`F${row}`] = { v: annualCost, t: 'n', z: '"$"#,##0.00', s: { font: { ...FONTS.normal, bold: true }, fill: COLORS.highlight, alignment: ALIGNMENT.right } }
    ws[`G${row}`] = { v: format(s.nextBillingDate, 'yyyy-MM-dd'), s: { font: FONTS.normal, fill: billingColor, alignment: ALIGNMENT.center } }
    ws[`H${row}`] = { v: s.lastUsed ? format(s.lastUsed, 'yyyy-MM-dd') : 'Never', s: { font: FONTS.small, fill: COLORS.purple, alignment: ALIGNMENT.center } }
    ws[`I${row}`] = { v: status, s: { font: { ...FONTS.normal, bold: true }, fill: statusColor, alignment: ALIGNMENT.center } }
    row++
  })

  row++
  const totalMonthly = active.reduce((sum, s) => {
    const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
    return sum + monthlyCost
  }, 0)
  const totalAnnual = totalMonthly * 12

  ws[`A${row}`] = { v: 'TOTALS', s: { font: FONTS.subheading, fill: COLORS.highlight, border: { top: BORDERS.thick } } }
  ws[`E${row}`] = { v: totalMonthly, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: COLORS.purple, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`F${row}`] = { v: totalAnnual, t: 'n', z: '"$"#,##0.00', s: { font: { ...FONTS.subheading, bold: true }, fill: COLORS.highlight, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }

  ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]
  ws['!ref'] = `A1:I${row}`

  return ws
}

function generateBudgetReport(budgets: Budget[], transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense')

  const ws: any = {}

  ws['A1'] = { v: '🎯 BUDGET REPORT', s: { font: FONTS.title, fill: { fgColor: { rgb: 'F57C00' } }, alignment: ALIGNMENT.center } }

  let row = 3
  ws[`A${row}`] = { v: 'Category', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header } }
  ws[`B${row}`] = { v: 'Budget', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.right } }
  ws[`C${row}`] = { v: 'Spent', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.right } }
  ws[`D${row}`] = { v: 'Remaining', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.right } }
  ws[`E${row}`] = { v: '% Used', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.right } }
  ws[`F${row}`] = { v: 'Status', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header, alignment: ALIGNMENT.center } }
  ws[`G${row}`] = { v: 'Visual Progress', s: { font: { ...FONTS.subheading, color: { rgb: 'FFFFFF' } }, fill: COLORS.header } }
  row++

  budgets.forEach((budget) => {
    const spent = expenses
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0)

    const remaining = budget.limit - spent
    const percentUsed = budget.limit > 0 ? (spent / budget.limit * 100) : 0

    let status = '✓ On Track'
    let statusColor = COLORS.success

    if (percentUsed >= 100) {
      status = '✗ OVER BUDGET'
      statusColor = COLORS.danger
    } else if (percentUsed >= 90) {
      status = '⚠ Warning'
      statusColor = COLORS.warning
    } else if (percentUsed >= 70) {
      status = '⚡ Alert'
      statusColor = { fgColor: { rgb: 'FFF3E0' } }
    }

    const barLength = Math.min(Math.round(percentUsed / 5), 20)
    const progressBar = '█'.repeat(barLength) + '░'.repeat(20 - barLength) + ` ${percentUsed.toFixed(1)}%`

    ws[`A${row}`] = { v: budget.category, s: { font: FONTS.normal } }
    ws[`B${row}`] = { v: budget.limit, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, alignment: ALIGNMENT.right } }
    ws[`C${row}`] = { v: spent, t: 'n', z: '"$"#,##0.00', s: { font: { ...FONTS.normal, bold: true }, alignment: ALIGNMENT.right } }
    ws[`D${row}`] = { v: remaining, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.normal, fill: remaining >= 0 ? COLORS.success : COLORS.danger, alignment: ALIGNMENT.right } }
    ws[`E${row}`] = { v: `${percentUsed.toFixed(1)}%`, s: { font: { ...FONTS.normal, bold: true }, alignment: ALIGNMENT.right } }
    ws[`F${row}`] = { v: status, s: { font: { ...FONTS.normal, bold: true }, fill: statusColor, alignment: ALIGNMENT.center } }
    ws[`G${row}`] = { v: progressBar, s: { font: { ...FONTS.small, name: 'Courier New' }, fill: statusColor } }
    row++
  })

  row++
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = expenses.filter(t => t.category === b.category).reduce((sum, t) => sum + t.amount, 0)
    return sum + spent
  }, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallUsage = (totalSpent / totalBudget * 100).toFixed(1)

  ws[`A${row}`] = { v: 'OVERALL', s: { font: FONTS.subheading, fill: COLORS.highlight, border: { top: BORDERS.thick } } }
  ws[`B${row}`] = { v: totalBudget, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`C${row}`] = { v: totalSpent, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`D${row}`] = { v: totalRemaining, t: 'n', z: '"$"#,##0.00', s: { font: FONTS.subheading, fill: totalRemaining >= 0 ? COLORS.success : COLORS.danger, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }
  ws[`E${row}`] = { v: `${overallUsage}%`, s: { font: FONTS.subheading, alignment: ALIGNMENT.right, border: { top: BORDERS.thick } } }

  row += 3
  ws[`A${row}`] = { v: '📊 PERFORMANCE SUMMARY', s: { font: FONTS.heading, fill: COLORS.highlight } }
  row++
  const onTrack = budgets.filter(b => {
    const spent = expenses.filter(t => t.category === b.category).reduce((sum, t) => sum + t.amount, 0)
    return (spent / b.limit) < 0.7
  }).length
  const warning = budgets.filter(b => {
    const spent = expenses.filter(t => t.category === b.category).reduce((sum, t) => sum + t.amount, 0)
    const pct = spent / b.limit
    return pct >= 0.7 && pct < 0.9
  }).length
  const overBudget = budgets.filter(b => {
    const spent = expenses.filter(t => t.category === b.category).reduce((sum, t) => sum + t.amount, 0)
    return (spent / b.limit) >= 1.0
  }).length

  ws[`A${row}`] = { v: '✓ On Track', s: { font: FONTS.normal, fill: COLORS.success } }
  ws[`B${row}`] = { v: onTrack, s: { font: { ...FONTS.normal, bold: true }, fill: COLORS.success, alignment: ALIGNMENT.center } }
  row++
  ws[`A${row}`] = { v: '⚠ Warning', s: { font: FONTS.normal, fill: COLORS.warning } }
  ws[`B${row}`] = { v: warning, s: { font: { ...FONTS.normal, bold: true }, fill: COLORS.warning, alignment: ALIGNMENT.center } }
  row++
  ws[`A${row}`] = { v: '✗ Over Budget', s: { font: FONTS.normal, fill: COLORS.danger } }
  ws[`B${row}`] = { v: overBudget, s: { font: { ...FONTS.normal, bold: true }, fill: COLORS.danger, alignment: ALIGNMENT.center } }

  ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 30 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]
  ws['!ref'] = `A1:G${row}`

  return ws
}

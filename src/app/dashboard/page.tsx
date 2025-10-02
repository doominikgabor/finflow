"use client"

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { KPICard } from '@/components/dashboard/KPICard'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { SpendingDonut } from '@/components/charts/SpendingDonut'
import { SubscriptionBar } from '@/components/charts/SubscriptionBar'
import { BudgetProgress } from '@/components/charts/BudgetProgress'
import { TransactionDialog } from '@/components/TransactionDialog'
import { ExportDialog } from '@/components/ExportDialog'
import { BudgetDialog } from '@/components/BudgetDialog'
import { MonthSelector, DateRange } from '@/components/MonthSelector'
import { MonthlySummaryCard } from '@/components/MonthlySummaryCard'
import { useFinancialData } from '@/hooks/useFinancialData'
import {
  formatCurrency,
  calculateCashFlowData,
  calculateSpendingData,
  calculateBudgetSpent,
  filterTransactionsByDateRange,
  getMonthlyStats,
  compareMonths,
} from '@/lib/utils'
import { Budget, Transaction } from '@/types'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Trash2, Plus, FileText, RefreshCw, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function DashboardPage() {
  const {
    transactions,
    subscriptions,
    budgets,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinancialData()

  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()
  const [mounted, setMounted] = useState(false)

  // Date range state with localStorage persistence
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: new Date(2020, 0, 1), // Placeholder date
    end: new Date(2020, 0, 1),
    label: 'Loading...',
  })

  // Initialize date range on client side only
  useEffect(() => {
    const now = new Date()
    let initialRange: DateRange = {
      start: startOfMonth(now),
      end: endOfMonth(now),
      label: 'This Month',
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finflow-date-range')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          initialRange = {
            start: new Date(parsed.start),
            end: new Date(parsed.end),
            label: parsed.label,
          }
        } catch (e) {
          // If parsing fails, use default
        }
      }
    }

    setSelectedRange(initialRange)
    setMounted(true)
  }, [])

  // Persist selected range to localStorage (only after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('finflow-date-range', JSON.stringify({
        start: selectedRange.start.toISOString(),
        end: selectedRange.end.toISOString(),
        label: selectedRange.label,
      }))
    }
  }, [selectedRange, mounted])

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(
    () => filterTransactionsByDateRange(transactions, selectedRange.start, selectedRange.end),
    [transactions, selectedRange]
  )

  // Get monthly stats for current and previous period
  const currentStats = useMemo(
    () => getMonthlyStats(transactions, selectedRange.start, selectedRange.end),
    [transactions, selectedRange]
  )

  const previousStats = useMemo(() => {
    const prevStart = subMonths(selectedRange.start, 1)
    const prevEnd = endOfMonth(prevStart)
    return getMonthlyStats(transactions, startOfMonth(prevStart), prevEnd)
  }, [transactions, selectedRange])

  const monthComparison = useMemo(
    () => compareMonths(currentStats, previousStats),
    [currentStats, previousStats]
  )

  // Calculate chart data
  // Cash Flow shows last 6 months regardless of selected range (for trend analysis)
  const cashFlowData = useMemo(() => calculateCashFlowData(transactions), [transactions])
  // Spending data uses filtered transactions to match selected period
  const spendingData = useMemo(() => calculateSpendingData(filteredTransactions), [filteredTransactions])

  // Calculate actual spent amounts for budgets using filtered transactions
  const budgetsWithSpent = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      spent: calculateBudgetSpent(filteredTransactions, budget.category, budget.period),
    }))
  }, [budgets, filteredTransactions])

  // Group subscriptions by category
  const subscriptionsByCategory = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = 0
    }
    acc[sub.category] += sub.cost
    return acc
  }, {} as Record<string, number>)

  const subscriptionChartData = Object.entries(subscriptionsByCategory).map(
    ([category, total]) => ({
      category,
      total,
    })
  )

  // Get recent transactions from filtered set (last 10)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)
  }, [filteredTransactions])

  // Enhanced action handlers with toast notifications
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction)
    toast.success('Transaction added successfully!', {
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(transaction.amount)}`,
    })
  }

  const handleUpdateTransaction = (id: string, transaction: Partial<Transaction>) => {
    updateTransaction(id, transaction)
    toast.success('Transaction updated!', {
      description: 'Your transaction has been updated successfully.',
    })
  }

  const handleDeleteTransaction = (id: string, description: string, amount: number) => {
    if (confirm(`Are you sure you want to delete "${description}" (${formatCurrency(amount)})?`)) {
      deleteTransaction(id)
      toast.success('Transaction deleted', {
        description: 'The transaction has been removed successfully.',
      })
    }
  }

  const handleAddBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    addBudget(budget)
    toast.success('Budget created!', {
      description: `Budget for ${budget.category} set to ${formatCurrency(budget.limit)} per ${budget.period === 'monthly' ? 'month' : 'year'}`,
    })
  }

  const handleUpdateBudget = (id: string, budget: Partial<Budget>) => {
    updateBudget(id, budget)
    toast.success('Budget updated!', {
      description: 'Your budget has been updated successfully.',
    })
    setSelectedBudget(undefined)
  }

  const handleDeleteBudget = (id: string, category: string) => {
    if (confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      deleteBudget(id)
      toast.success('Budget deleted', {
        description: `Budget for ${category} has been removed.`,
      })
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-8 space-y-8"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDialog
            transactions={transactions}
            subscriptions={subscriptions}
            budgets={budgets}
            defaultDateRange={selectedRange}
          />
          <TransactionDialog
            trigger={
              <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            }
            onSubmit={handleAddTransaction}
          />
        </div>
      </motion.div>

      {/* Month Selector */}
      <motion.div variants={fadeInUp}>
        <MonthSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
      </motion.div>

      {/* Monthly Summary Card */}
      <MonthlySummaryCard
        stats={currentStats}
        monthLabel={selectedRange.label}
        comparison={monthComparison}
      />

      {/* Quick Add Buttons */}
      <motion.div variants={fadeInUp}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <TransactionDialog
                trigger={<Button variant="outline" className="hover:border-purple-500 transition-colors">+ Groceries ($50)</Button>}
                onSubmit={handleAddTransaction}
                defaultValues={{ type: 'expense', amount: 50, category: 'Food', description: 'Groceries' }}
              />
              <TransactionDialog
                trigger={<Button variant="outline" className="hover:border-purple-500 transition-colors">+ Gas ($20)</Button>}
                onSubmit={handleAddTransaction}
                defaultValues={{ type: 'expense', amount: 20, category: 'Transport', description: 'Gas' }}
              />
              <TransactionDialog
                trigger={<Button variant="outline" className="hover:border-purple-500 transition-colors">+ Coffee ($15)</Button>}
                onSubmit={handleAddTransaction}
                defaultValues={{ type: 'expense', amount: 15, category: 'Entertainment', description: 'Coffee' }}
              />
              <TransactionDialog
                trigger={<Button variant="outline" className="hover:border-purple-500 transition-colors">+ Freelance ($500)</Button>}
                onSubmit={handleAddTransaction}
                defaultValues={{ type: 'income', amount: 500, category: 'Freelance', description: 'Side project' }}
              />
              <TransactionDialog
                trigger={<Button variant="outline" className="hover:border-purple-500 transition-colors">+ Custom</Button>}
                onSubmit={handleAddTransaction}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Total Income"
          value={formatCurrency(currentStats.totalIncome)}
          numericValue={currentStats.totalIncome}
          change={monthComparison.incomeChange}
          trend={monthComparison.incomeChange >= 0 ? 'up' : 'down'}
          tooltip={`Total income for ${selectedRange.label}`}
          gradient="from-green-500/10 to-emerald-500/10"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(currentStats.totalExpenses)}
          numericValue={currentStats.totalExpenses}
          change={Math.abs(monthComparison.expenseChange)}
          trend={monthComparison.expenseChange <= 0 ? 'up' : 'down'}
          tooltip={`Total expenses for ${selectedRange.label}`}
          gradient="from-red-500/10 to-pink-500/10"
        />
        <KPICard
          title="Cash Flow"
          value={formatCurrency(currentStats.netCashFlow)}
          numericValue={currentStats.netCashFlow}
          change={monthComparison.cashFlowChange}
          trend={monthComparison.cashFlowChange >= 0 ? 'up' : 'down'}
          tooltip={`Net cash flow for ${selectedRange.label}`}
          gradient="from-blue-500/10 to-purple-500/10"
        />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Cash Flow Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlowData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingDonut data={spendingData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Subscriptions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionBar data={subscriptionChartData} />
          </CardContent>
        </Card>

        <BudgetProgress
          budgets={budgetsWithSpent}
          onEdit={setSelectedBudget}
          onDelete={handleDeleteBudget}
          actionButton={
            <BudgetDialog
              trigger={
                <Button variant="outline" size="sm">
                  Manage Budgets
                </Button>
              }
              onSubmit={handleAddBudget}
            />
          }
        />
      </motion.div>

      {/* Edit Budget Dialog */}
      {selectedBudget && (
        <BudgetDialog
          key={selectedBudget.id}
          trigger={<div />}
          onSubmit={handleAddBudget}
          onUpdate={handleUpdateBudget}
          onDelete={handleDeleteBudget}
          editMode={true}
          existingBudget={selectedBudget}
        />
      )}

      {/* Recent Transactions */}
      <motion.div variants={fadeInUp}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Recent Transactions ({selectedRange.label})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Start tracking your finances by adding your first transaction
                        </p>
                      </div>
                      <TransactionDialog
                        trigger={<Button>Add Your First Transaction</Button>}
                        onSubmit={handleAddTransaction}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(transaction.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.description}</span>
                        {transaction.recurring && (
                          <Badge variant="outline" className="gap-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <RefreshCw className="h-3 w-3" />
                            {transaction.frequency || 'Recurring'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TransactionDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4 text-blue-500 hover:scale-110 transition-transform" />
                            </Button>
                          }
                          onSubmit={handleAddTransaction}
                          onUpdate={handleUpdateTransaction}
                          editMode={true}
                          existingTransaction={transaction}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id, transaction.description, transaction.amount)}
                          className="hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
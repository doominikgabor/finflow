"use client"

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useFinancialData } from '@/hooks/useFinancialData'
import { MonthSelector, DateRange } from '@/components/MonthSelector'
import { MonthlySummaryCard } from '@/components/MonthlySummaryCard'
import { ExportDialog } from '@/components/ExportDialog'
import { formatCurrency, getMonthlyStats, compareMonths, filterTransactionsByDateRange } from '@/lib/utils'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function AnalyticsPage() {
  const { transactions, subscriptions, budgets } = useFinancialData()
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
        } catch {
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

  // Monthly comparison data for last 6 months
  const monthlyComparisonData = useMemo(() => {
    if (!mounted) return []

    const data: { month: string; income: number; expenses: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      const monthTransactions = transactions.filter((t) =>
        isWithinInterval(t.date, { start: monthStart, end: monthEnd })
      )

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      data.push({
        month: format(date, 'MMM yyyy'),
        income,
        expenses,
      })
    }

    return data
  }, [transactions, mounted])

  // Spending trends by category
  const spendingByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {}

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions])

  // Top spending categories
  const topCategories = spendingByCategory.slice(0, 5)

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="p-8 space-y-8"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your financial data
          </p>
        </div>
        <ExportDialog
          transactions={transactions}
          subscriptions={subscriptions}
          budgets={budgets}
          defaultDateRange={selectedRange}
        />
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

      {/* Monthly Comparison Chart - Last 6 Months Trend */}
      <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle>6-Month Income vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </motion.div>

      {/* Spending Trends */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category ({selectedRange.label})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#8B5CF6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories ({selectedRange.label})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map((category, index) => {
                  const percentage = (category.amount / totalExpenses) * 100
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {index + 1}. {category.category}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(category.amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No spending data for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
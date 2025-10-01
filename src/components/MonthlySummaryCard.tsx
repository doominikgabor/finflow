"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, MonthlyStats } from '@/lib/utils'
import { TrendingUp, TrendingDown, Calendar, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface MonthlySummaryCardProps {
  stats: MonthlyStats
  monthLabel: string
  comparison?: {
    incomeChange: number
    expenseChange: number
    cashFlowChange: number
  }
}

export function MonthlySummaryCard({ stats, monthLabel, comparison }: MonthlySummaryCardProps) {
  const savingsRate = stats.totalIncome > 0
    ? ((stats.netCashFlow / stats.totalIncome) * 100).toFixed(1)
    : '0'

  const renderChangeIndicator = (change: number) => {
    if (Math.abs(change) < 0.1) return null

    return (
      <Badge
        variant={change > 0 ? 'default' : 'secondary'}
        className={`ml-2 ${change > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}
      >
        {change > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </Badge>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            {monthLabel} Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Total Income */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </p>
                {comparison && renderChangeIndicator(comparison.incomeChange)}
              </div>
            </div>

            {/* Total Expenses */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpenses)}
                </p>
                {comparison && renderChangeIndicator(comparison.expenseChange)}
              </div>
            </div>

            {/* Net Savings */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Savings</p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${stats.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(stats.netCashFlow)}
                </p>
                {comparison && renderChangeIndicator(comparison.cashFlowChange)}
              </div>
            </div>

            {/* Savings Rate */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                {savingsRate}%
                {parseFloat(savingsRate) > 20 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                )}
              </p>
            </div>

            {/* Top Category */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Top Category</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <ShoppingBag className="h-4 w-4 text-purple-500" />
                {stats.topCategory}
              </p>
            </div>

            {/* Transaction Count */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-xl font-semibold">
                {stats.transactionCount}
              </p>
            </div>
          </div>

          {/* Average Daily Spending */}
          {stats.avgDailySpending > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Average Daily Spending</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatCurrency(stats.avgDailySpending)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
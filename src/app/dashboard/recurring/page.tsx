"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { TransactionDialog } from '@/components/TransactionDialog'
import { useFinancialData } from '@/hooks/useFinancialData'
import { formatCurrency } from '@/lib/utils'
import { format, add, formatDistanceToNow } from 'date-fns'
import { RefreshCw, Pencil, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Transaction } from '@/types'

export default function RecurringPage() {
  const { transactions, updateTransaction } = useFinancialData()

  // Filter only recurring transactions
  const recurringTransactions = useMemo(() => {
    return transactions.filter(t => t.recurring === true)
  }, [transactions])

  // Calculate next occurrence date
  const calculateNextOccurrence = (transaction: Transaction): Date => {
    if (!transaction.frequency) return transaction.date

    const frequencyMap = {
      daily: { days: 1 },
      weekly: { weeks: 1 },
      monthly: { months: 1 },
      yearly: { years: 1 },
    }

    return add(transaction.date, frequencyMap[transaction.frequency])
  }

  // Handler functions
  const handleUpdateTransaction = (id: string, transaction: Partial<Transaction>) => {
    updateTransaction(id, transaction)
    toast.success('Recurring transaction updated!', {
      description: 'Your changes have been saved.',
    })
  }

  const handleTogglePause = (transaction: Transaction) => {
    updateTransaction(transaction.id, { recurring: !transaction.recurring })
    toast.success(
      transaction.recurring ? 'Recurring transaction paused' : 'Recurring transaction resumed',
      {
        description: transaction.recurring
          ? 'This transaction will no longer repeat.'
          : 'This transaction will continue to repeat.',
      }
    )
  }

  // Separate income and expenses
  const recurringIncome = recurringTransactions.filter(t => t.type === 'income')
  const recurringExpenses = recurringTransactions.filter(t => t.type === 'expense')

  const totalMonthlyIncome = recurringIncome
    .filter(t => t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalMonthlyExpenses = recurringExpenses
    .filter(t => t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="p-8 space-y-8"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RefreshCw className="h-8 w-8" />
            Recurring Transactions
          </h1>
          <p className="text-muted-foreground">
            Manage your recurring income and expenses
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Active recurring transactions</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">From recurring sources</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-gradient-to-br from-red-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">From recurring payments</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recurring Transactions Table */}
      <motion.div variants={fadeInUp}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recurringTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <AlertCircle className="h-16 w-16 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">No recurring transactions</h3>
                  <p className="text-muted-foreground text-sm">
                    Add a transaction and mark it as recurring to get started
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Occurrence</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringTransactions.map((transaction) => {
                    const nextDate = calculateNextOccurrence(transaction)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-purple-500" />
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={transaction.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.frequency || 'Monthly'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{format(nextDate, 'MMM dd, yyyy')}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(nextDate, { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={transaction.recurring}
                            onCheckedChange={() => handleTogglePause(transaction)}
                          />
                        </TableCell>
                        <TableCell>
                          <TransactionDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                            }
                            onSubmit={() => {}}
                            onUpdate={handleUpdateTransaction}
                            editMode={true}
                            existingTransaction={transaction}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
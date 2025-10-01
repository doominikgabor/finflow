"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Budget } from '@/types'
import { motion } from 'framer-motion'

interface BudgetDialogProps {
  trigger?: React.ReactNode
  onSubmit: (budget: Omit<Budget, 'id' | 'spent'>) => void
  onUpdate?: (id: string, budget: Partial<Budget>) => void
  onDelete?: (id: string) => void
  editMode?: boolean
  existingBudget?: Budget
  defaultCategory?: string
}

export function BudgetDialog({
  trigger,
  onSubmit,
  onUpdate,
  onDelete,
  editMode = false,
  existingBudget,
  defaultCategory,
}: BudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    if (editMode && existingBudget) {
      setCategory(existingBudget.category)
      setLimit(existingBudget.limit.toString())
      setPeriod(existingBudget.period)
    } else if (defaultCategory) {
      setCategory(defaultCategory)
    }
  }, [editMode, existingBudget, defaultCategory, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const budgetData = {
      category,
      limit: parseFloat(limit),
      period,
    }

    if (editMode && existingBudget && onUpdate) {
      onUpdate(existingBudget.id, budgetData)
    } else {
      onSubmit(budgetData)
    }

    // Reset form
    setCategory('')
    setLimit('')
    setPeriod('monthly')
    setOpen(false)
  }

  const handleDelete = () => {
    if (existingBudget && onDelete) {
      if (confirm(`Are you sure you want to delete the budget for ${existingBudget.category}?`)) {
        onDelete(existingBudget.id)
        setOpen(false)
      }
    }
  }

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Other',
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Budget</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          <DialogDescription>
            {editMode
              ? 'Update your budget limit and period.'
              : 'Set a spending limit for a category to track your expenses.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="limit">Budget Limit ($)</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="1000.00"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="period">Period</Label>
            <Select value={period} onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Track your spending limit on a monthly or yearly basis
            </p>
          </motion.div>

          <div className="flex gap-2 pt-4">
            {editMode && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                Delete Budget
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="ml-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              {editMode ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
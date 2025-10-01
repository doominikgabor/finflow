"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Home, ShoppingCart, Car, Film, Heart, Briefcase } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Transaction } from '@/types'

interface TransactionDialogProps {
  trigger?: React.ReactNode
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onUpdate?: (id: string, transaction: Partial<Transaction>) => void
  editMode?: boolean
  existingTransaction?: Transaction
  defaultValues?: {
    type?: 'income' | 'expense'
    amount?: number
    category?: string
    description?: string
  }
}

const categories = [
  { value: 'Salary', label: 'Salary', icon: Briefcase, type: 'income' },
  { value: 'Freelance', label: 'Freelance', icon: Briefcase, type: 'income' },
  { value: 'Investment', label: 'Investment', icon: Briefcase, type: 'income' },
  { value: 'Housing', label: 'Housing', icon: Home, type: 'expense' },
  { value: 'Food', label: 'Food', icon: ShoppingCart, type: 'expense' },
  { value: 'Transport', label: 'Transport', icon: Car, type: 'expense' },
  { value: 'Entertainment', label: 'Entertainment', icon: Film, type: 'expense' },
  { value: 'Healthcare', label: 'Healthcare', icon: Heart, type: 'expense' },
]

export function TransactionDialog({ trigger, onSubmit, onUpdate, editMode = false, existingTransaction, defaultValues }: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when dialog opens with default values or existing transaction
  useEffect(() => {
    if (open) {
      if (editMode && existingTransaction) {
        setType(existingTransaction.type)
        setAmount(existingTransaction.amount.toString())
        setCategory(existingTransaction.category)
        setDescription(existingTransaction.description)
        setDate(existingTransaction.date)
        setRecurring(existingTransaction.recurring || false)
        setFrequency(existingTransaction.frequency || 'monthly')
      } else {
        setType(defaultValues?.type || 'expense')
        setAmount(defaultValues?.amount?.toString() || '')
        setCategory(defaultValues?.category || '')
        setDescription(defaultValues?.description || '')
        setDate(new Date())
        setRecurring(false)
        setFrequency('monthly')
      }
      setErrors({})
    }
  }, [open, editMode, existingTransaction, defaultValues])

  const filteredCategories = categories.filter((cat) => cat.type === type)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!category) {
      newErrors.category = 'Please select a category'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (editMode && existingTransaction && onUpdate) {
      onUpdate(existingTransaction.id, {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
        recurring,
        frequency: recurring ? frequency : undefined,
      })
    } else {
      onSubmit({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
        recurring,
        frequency: recurring ? frequency : undefined,
      })
    }

    // Reset form
    setAmount('')
    setCategory('')
    setDescription('')
    setDate(new Date())
    setRecurring(false)
    setFrequency('monthly')
    setErrors({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Transaction</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => {
              setType(value)
              setCategory('')
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recurring Transaction Section */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-5 w-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <div className="flex-1">
                <Label htmlFor="recurring" className="cursor-pointer font-semibold text-base">
                  Recurring transaction
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically track this transaction regularly
                </p>
              </div>
            </div>

            {/* Frequency Selector - Only shown when recurring is checked */}
            <motion.div
              initial={false}
              animate={{
                height: recurring ? 'auto' : 0,
                opacity: recurring ? 1 : 0,
                marginTop: recurring ? 16 : 0
              }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {recurring && (
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm font-medium">
                    Frequency
                  </Label>
                  <Select value={frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setFrequency(value)}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>Daily</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <span>📆</span>
                          <span>Weekly</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="monthly">
                        <div className="flex items-center gap-2">
                          <span>🗓️</span>
                          <span>Monthly</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="yearly">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>Yearly</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This transaction will repeat {frequency}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editMode ? 'Update Transaction' : 'Add Transaction'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
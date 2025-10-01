"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Subscription } from '@/types'

interface SubscriptionDialogProps {
  trigger?: React.ReactNode
  onSubmit: (subscription: Omit<Subscription, 'id'>) => void
}

const categories = [
  'Entertainment',
  'Professional',
  'Health',
  'Education',
  'Utilities',
  'Other',
]

export function SubscriptionDialog({ trigger, onSubmit }: SubscriptionDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [cost, setCost] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [nextBillingDate, setNextBillingDate] = useState<Date>(new Date())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Subscription name is required'
    }
    if (!category) {
      newErrors.category = 'Please select a category'
    }
    if (!cost || parseFloat(cost) <= 0) {
      newErrors.cost = 'Cost must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      name,
      category,
      cost: parseFloat(cost),
      billingCycle,
      nextBillingDate,
      status: 'active',
    })

    // Reset form
    setName('')
    setCategory('')
    setCost('')
    setBillingCycle('monthly')
    setNextBillingDate(new Date())
    setErrors({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Subscription</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              placeholder="Netflix, Spotify, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={errors.cost ? 'border-red-500' : ''}
            />
            {errors.cost && (
              <p className="text-sm text-red-500">{errors.cost}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('monthly')}
                className="flex-1"
              >
                Monthly
              </Button>
              <Button
                type="button"
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('yearly')}
                className="flex-1"
              >
                Yearly
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Next Billing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !nextBillingDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextBillingDate ? format(nextBillingDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nextBillingDate}
                  onSelect={(date) => date && setNextBillingDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Subscription</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, addMonths } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DateRange = {
  start: Date
  end: Date
  label: string
}

interface MonthSelectorProps {
  selectedRange: DateRange
  onRangeChange: (range: DateRange) => void
}

const QUICK_FILTERS = [
  {
    label: 'This Month',
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
      label: 'This Month',
    }),
  },
  {
    label: 'Last Month',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1)),
      label: 'Last Month',
    }),
  },
  {
    label: 'Last 3 Months',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 2)),
      end: endOfMonth(new Date()),
      label: 'Last 3 Months',
    }),
  },
  {
    label: 'Last 6 Months',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: endOfMonth(new Date()),
      label: 'Last 6 Months',
    }),
  },
  {
    label: 'This Year',
    getValue: () => ({
      start: startOfYear(new Date()),
      end: endOfMonth(new Date()),
      label: 'This Year',
    }),
  },
  {
    label: 'All Time',
    getValue: () => ({
      start: new Date(2020, 0, 1),
      end: endOfMonth(new Date()),
      label: 'All Time',
    }),
  },
]

export function MonthSelector({ selectedRange, onRangeChange }: MonthSelectorProps) {
  const [open, setOpen] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowLeft') {
        handlePreviousMonth()
      } else if (e.key === 'ArrowRight') {
        handleNextMonth()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedRange])

  const handlePreviousMonth = () => {
    const prevMonth = subMonths(selectedRange.start, 1)
    onRangeChange({
      start: startOfMonth(prevMonth),
      end: endOfMonth(prevMonth),
      label: format(prevMonth, 'MMMM yyyy'),
    })
  }

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedRange.start, 1)
    const now = new Date()

    // Don't go beyond current month
    if (nextMonth <= now) {
      onRangeChange({
        start: startOfMonth(nextMonth),
        end: endOfMonth(nextMonth),
        label: format(nextMonth, 'MMMM yyyy'),
      })
    }
  }

  const handleMonthSelect = (date: Date | undefined) => {
    if (!date) return

    onRangeChange({
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, 'MMMM yyyy'),
    })
    setOpen(false)
  }

  const isCurrentMonth = format(selectedRange.start, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[200px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <p className="text-sm font-medium mb-2">Quick Filters</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_FILTERS.map((filter) => (
                <Button
                  key={filter.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    onRangeChange(filter.getValue())
                    setOpen(false)
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedRange.start}
            onSelect={handleMonthSelect}
            initialFocus
            className="p-3"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        disabled={isCurrentMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="text-xs text-muted-foreground ml-2">
        Use ← → keys to navigate
      </div>
    </div>
  )
}
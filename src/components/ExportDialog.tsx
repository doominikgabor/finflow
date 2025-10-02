"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import { cn } from '@/lib/utils'
import { exportToExcel } from '@/lib/exportToExcel'
import { Transaction, Subscription, Budget } from '@/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ExportDialogProps {
  trigger?: React.ReactNode
  transactions: Transaction[]
  subscriptions: Subscription[]
  budgets: Budget[]
  defaultDateRange?: {
    start: Date
    end: Date
    label: string
  }
}

export function ExportDialog({ trigger, transactions, subscriptions, budgets, defaultDateRange }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [dateRangePreset, setDateRangePreset] = useState('this-month')
  const [startDate, setStartDate] = useState<Date>(defaultDateRange?.start || startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(defaultDateRange?.end || endOfMonth(new Date()))
  const [isExporting, setIsExporting] = useState(false)
  const [filename, setFilename] = useState(`FinFlow_Report_${format(new Date(), 'MMM_yyyy')}.xlsx`)

  // Options for what to include
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeIncomeBreakdown, setIncludeIncomeBreakdown] = useState(true)
  const [includeExpenseBreakdown, setIncludeExpenseBreakdown] = useState(true)
  const [includeSubscriptions, setIncludeSubscriptions] = useState(true)
  const [includeBudgets, setIncludeBudgets] = useState(true)

  const handlePresetChange = (preset: string) => {
    setDateRangePreset(preset)
    const now = new Date()

    switch (preset) {
      case 'this-month':
        setStartDate(startOfMonth(now))
        setEndDate(endOfMonth(now))
        break
      case 'last-3-months':
        setStartDate(startOfMonth(subMonths(now, 2)))
        setEndDate(endOfMonth(now))
        break
      case 'last-6-months':
        setStartDate(startOfMonth(subMonths(now, 5)))
        setEndDate(endOfMonth(now))
        break
      case 'this-year':
        setStartDate(startOfYear(now))
        setEndDate(endOfMonth(now))
        break
      case 'custom':
        // Keep current dates
        break
    }
  }

  const filteredTransactions = transactions.filter(
    t => t.date >= startDate && t.date <= endDate
  )

  const handleExport = async () => {
    setIsExporting(true)
    toast.loading('Generating Excel report...')

    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX

      exportToExcel({
        transactions,
        subscriptions,
        budgets,
        dateRange: {
          start: startDate,
          end: endDate,
          label: dateRangePreset === 'custom' ? `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}` : dateRangePreset.replace('-', ' ').toUpperCase(),
        },
        includeSummary,
        includeTransactions,
        includeIncomeBreakdown,
        includeExpenseBreakdown,
        includeSubscriptions,
        includeBudgets,
        filename,
      })

      toast.success('Export successful!', {
        description: 'Your financial data has been exported to Excel.',
      })

      setOpen(false)
    } catch (error) {
      toast.error('Export failed', {
        description: 'There was an error exporting your data. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Export to Excel
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive Excel report with your financial data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <Select value={dateRangePreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRangePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-2',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : <span>Pick start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-2',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : <span>Pick end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="FinFlow_Report.xlsx"
            />
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'summary', label: 'Executive Summary', state: includeSummary, setState: setIncludeSummary },
                { id: 'transactions', label: 'All Transactions', state: includeTransactions, setState: setIncludeTransactions },
                { id: 'income', label: 'Income Analysis', state: includeIncomeBreakdown, setState: setIncludeIncomeBreakdown },
                { id: 'expense', label: 'Expense Analysis', state: includeExpenseBreakdown, setState: setIncludeExpenseBreakdown },
                { id: 'subscriptions', label: 'Subscriptions', state: includeSubscriptions, setState: setIncludeSubscriptions },
                { id: 'budgets', label: 'Budget Report', state: includeBudgets, setState: setIncludeBudgets },
              ].map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={option.state}
                    onCheckedChange={(checked) => option.setState(checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer font-normal text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Export Preview
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Date Range: {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}</p>
              <p>• Transactions: {filteredTransactions.length}</p>
              <p>• Active Subscriptions: {subscriptions.filter(s => s.status === 'active').length}</p>
              <p>• Budgets: {budgets.length}</p>
              <p>• Sheets to Export: {[includeSummary, includeTransactions, includeIncomeBreakdown, includeExpenseBreakdown, includeSubscriptions, includeBudgets].filter(Boolean).length}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isExporting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
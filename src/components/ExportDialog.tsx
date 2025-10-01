"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import { cn } from '@/lib/utils'
import { exportToExcel } from '@/lib/exportToExcel'
import { Transaction, Subscription } from '@/types'
import { toast } from 'sonner'

interface ExportDialogProps {
  trigger?: React.ReactNode
  transactions: Transaction[]
  subscriptions: Subscription[]
}

export function ExportDialog({ trigger, transactions, subscriptions }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [dateRangePreset, setDateRangePreset] = useState('this-month')
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()))
  const [isExporting, setIsExporting] = useState(false)

  // Options for what to include
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeIncomeBreakdown, setIncludeIncomeBreakdown] = useState(true)
  const [includeExpenseBreakdown, setIncludeExpenseBreakdown] = useState(true)
  const [includeSubscriptions, setIncludeSubscriptions] = useState(true)

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

  const handleExport = async () => {
    setIsExporting(true)

    try {
      exportToExcel({
        transactions,
        subscriptions,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        includeSummary,
        includeTransactions,
        includeIncomeBreakdown,
        includeExpenseBreakdown,
        includeSubscriptions,
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

  // Calculate preview stats
  const filteredTransactions = transactions.filter(
    t => t.date >= startDate && t.date <= endDate
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export to Excel
          </DialogTitle>
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

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              {[
                { id: 'summary', label: 'Summary Sheet', state: includeSummary, setState: setIncludeSummary },
                { id: 'transactions', label: 'All Transactions', state: includeTransactions, setState: setIncludeTransactions },
                { id: 'income', label: 'Income Breakdown', state: includeIncomeBreakdown, setState: setIncludeIncomeBreakdown },
                { id: 'expense', label: 'Expense Breakdown', state: includeExpenseBreakdown, setState: setIncludeExpenseBreakdown },
                { id: 'subscriptions', label: 'Subscriptions', state: includeSubscriptions, setState: setIncludeSubscriptions },
              ].map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={option.state}
                    onChange={(e) => option.setState(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor={option.id} className="cursor-pointer font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h4 className="font-semibold text-sm">Preview</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Date Range: {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}</p>
              <p>• Transactions: {filteredTransactions.length}</p>
              <p>• Subscriptions: {subscriptions.filter(s => s.status === 'active').length}</p>
              <p>• Sheets: {[includeSummary, includeTransactions, includeIncomeBreakdown, includeExpenseBreakdown, includeSubscriptions].filter(Boolean).length}</p>
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
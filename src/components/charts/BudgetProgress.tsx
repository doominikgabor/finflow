"use client"

import { Budget } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

interface BudgetProgressProps {
  budgets: Budget[]
  onEdit?: (budget: Budget) => void
  onDelete?: (id: string, category: string) => void
  actionButton?: React.ReactNode
}

export function BudgetProgress({ budgets, onEdit, onDelete, actionButton }: BudgetProgressProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Progress</CardTitle>
        {actionButton}
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No budgets set yet.</p>
            <p className="text-xs mt-1">Create a budget to start tracking your spending!</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100
            const progressColor = getProgressColor(percentage)

            return (
              <div key={budget.id} className="space-y-2 group">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(budget)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(budget.id, budget.category)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-2" />
                  <div
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${progressColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{budget.period}</span>
                  <span className={`font-medium ${percentage > 90 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {percentage.toFixed(0)}% used
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
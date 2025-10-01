"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SubscriptionDialog } from '@/components/SubscriptionDialog'
import { useFinancialData } from '@/hooks/useFinancialData'
import { formatCurrency } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { Trash2, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function SubscriptionsPage() {
  const { subscriptions, addSubscription, deleteSubscription, updateSubscription } = useFinancialData()

  const totalMonthlyCost = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost
      return sum + monthlyCost
    }, 0)

  const totalYearlyCost = totalMonthlyCost * 12

  // Handler functions with toast notifications
  const handleAddSubscription = (subscription: Omit<any, 'id'>) => {
    addSubscription(subscription)
    toast.success('Subscription added!', {
      description: `${subscription.name} - ${formatCurrency(subscription.cost)}/${subscription.billingCycle}`,
    })
  }

  const handleDeleteSubscription = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteSubscription(id)
      toast.success('Subscription deleted', {
        description: `${name} has been removed from your subscriptions.`,
      })
    }
  }

  const handleMarkAsUsed = (id: string, name: string) => {
    updateSubscription(id, { lastUsed: new Date() })
    toast.success('Marked as used!', {
      description: `${name} was used today.`,
    })
  }

  // Check if subscription hasn't been used in 30+ days
  const isUnused = (lastUsed?: Date) => {
    if (!lastUsed) return true
    const daysSinceUsed = differenceInDays(new Date(), lastUsed)
    return daysSinceUsed >= 30
  }

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
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your recurring subscriptions
          </p>
        </div>
        <SubscriptionDialog
          trigger={<Button className="shadow-lg hover:shadow-xl transition-all duration-300">Add Subscription</Button>}
          onSubmit={handleAddSubscription}
        />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalYearlyCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <CreditCard className="h-16 w-16 text-muted-foreground opacity-50" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">No subscriptions yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Add your first subscription to start tracking your recurring payments
                        </p>
                      </div>
                      <SubscriptionDialog
                        trigger={<Button>Add Your First Subscription</Button>}
                        onSubmit={handleAddSubscription}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>{subscription.category}</TableCell>
                    <TableCell>{formatCurrency(subscription.cost)}</TableCell>
                    <TableCell className="capitalize">{subscription.billingCycle}</TableCell>
                    <TableCell>{format(subscription.nextBillingDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {subscription.lastUsed ? (
                          <>
                            <span className="text-sm">
                              {formatDistanceToNow(subscription.lastUsed, { addSuffix: true })}
                            </span>
                            {isUnused(subscription.lastUsed) && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Unused 30+ days
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="secondary">Never</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscription.status === 'active'
                            ? 'default'
                            : subscription.status === 'inactive'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsUsed(subscription.id, subscription.name)}
                          className="hover:bg-green-50 hover:border-green-500 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubscription(subscription.id, subscription.name)}
                          className="hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
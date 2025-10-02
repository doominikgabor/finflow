'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Transaction, Subscription, Budget } from '@/types'
import type { DbTransaction, DbSubscription, DbBudget, DbTransactionAmount } from '@/types/database'

export function useFinancialData() {
  const { user } = useAuth()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data when user logs in
  const fetchAllData = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setSubscriptions([])
      setBudgets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [transactionsData, subscriptionsData, budgetsData] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false })
      ])

      if (transactionsData.error) throw transactionsData.error
      if (subscriptionsData.error) throw subscriptionsData.error
      if (budgetsData.error) throw budgetsData.error

      // Transform database data to match TypeScript types
      setTransactions(
        transactionsData.data.map((t: DbTransaction) => ({
          id: t.id,
          type: t.type,
          amount: parseFloat(t.amount),
          category: t.category,
          description: t.description,
          date: new Date(t.date),
          recurring: t.recurring || false,
          frequency: t.frequency || undefined,
        }))
      )

      setSubscriptions(
        subscriptionsData.data.map((s: DbSubscription) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          cost: parseFloat(s.cost),
          billingCycle: s.billing_cycle,
          nextBillingDate: new Date(s.next_billing_date),
          lastUsed: s.last_used ? new Date(s.last_used) : undefined,
          status: s.status,
        }))
      )

      // Calculate spent for each budget from transactions
      const budgetsWithSpent = await Promise.all(
        budgetsData.data.map(async (b: DbBudget) => {
          // Get transactions for this budget's category
          const { data: categoryTransactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category', b.category)
            .eq('type', 'expense')

          const spent = categoryTransactions?.reduce(
            (sum: number, t: DbTransactionAmount) => sum + parseFloat(String(t.amount)),
            0
          ) || 0

          return {
            id: b.id,
            category: b.category,
            limit: parseFloat(b.limit_amount),
            spent,
            period: b.period,
          }
        })
      )

      setBudgets(budgetsWithSpent)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // ========== TRANSACTION FUNCTIONS ==========

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date.toISOString(),
          recurring: transaction.recurring || false,
          frequency: transaction.frequency || null,
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      const newTransaction: Transaction = {
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description,
        date: new Date(data.date),
        recurring: data.recurring,
        frequency: data.frequency || undefined,
      }

      setTransactions(prev => [newTransaction, ...prev])

      // Refresh budgets to update spent amounts
      await fetchAllData()

      return data
    } catch (err) {
      console.error('Error adding transaction:', err)
      throw err
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const dbUpdates: Record<string, string | number | boolean | Date> = {}
      if (updates.type) dbUpdates.type = updates.type
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount
      if (updates.category) dbUpdates.category = updates.category
      if (updates.description) dbUpdates.description = updates.description
      if (updates.date) dbUpdates.date = updates.date.toISOString()
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency

      const { data, error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setTransactions(prev => prev.map(t =>
        t.id === id ? {
          ...t,
          ...updates,
          amount: updates.amount !== undefined ? updates.amount : t.amount,
        } : t
      ))

      // Refresh budgets
      await fetchAllData()

      return data
    } catch (err) {
      console.error('Error updating transaction:', err)
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id))

      // Refresh budgets
      await fetchAllData()
    } catch (err) {
      console.error('Error deleting transaction:', err)
      throw err
    }
  }

  // ========== BUDGET FUNCTIONS ==========

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: budget.category,
          limit_amount: budget.limit,
          period: budget.period,
        })
        .select()
        .single()

      if (error) throw error

      // Calculate spent
      const { data: categoryTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category', budget.category)
        .eq('type', 'expense')

      const spent = categoryTransactions?.reduce(
        (sum: number, t: DbTransactionAmount) => sum + parseFloat(String(t.amount)),
        0
      ) || 0

      const newBudget: Budget = {
        id: data.id,
        category: data.category,
        limit: parseFloat(data.limit_amount),
        spent,
        period: data.period,
      }

      setBudgets(prev => [...prev, newBudget])

      return data
    } catch (err) {
      console.error('Error adding budget:', err)
      throw err
    }
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const dbUpdates: Record<string, string | number | boolean | Date> = {}
      if (updates.limit !== undefined) dbUpdates.limit_amount = updates.limit
      if (updates.category) dbUpdates.category = updates.category
      if (updates.period) dbUpdates.period = updates.period

      const { data, error } = await supabase
        .from('budgets')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setBudgets(prev => prev.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ))

      return data
    } catch (err) {
      console.error('Error updating budget:', err)
      throw err
    }
  }

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error('Error deleting budget:', err)
      throw err
    }
  }

  // ========== SUBSCRIPTION FUNCTIONS ==========

  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: subscription.name,
          category: subscription.category,
          cost: subscription.cost,
          billing_cycle: subscription.billingCycle,
          next_billing_date: subscription.nextBillingDate.toISOString(),
          last_used: subscription.lastUsed?.toISOString() || null,
          status: subscription.status,
        })
        .select()
        .single()

      if (error) throw error

      const newSubscription: Subscription = {
        id: data.id,
        name: data.name,
        category: data.category,
        cost: parseFloat(data.cost),
        billingCycle: data.billing_cycle,
        nextBillingDate: new Date(data.next_billing_date),
        lastUsed: data.last_used ? new Date(data.last_used) : undefined,
        status: data.status,
      }

      setSubscriptions(prev => [newSubscription, ...prev])

      return data
    } catch (err) {
      console.error('Error adding subscription:', err)
      throw err
    }
  }

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const dbUpdates: Record<string, string | number | boolean | Date> = {}
      if (updates.name) dbUpdates.name = updates.name
      if (updates.category) dbUpdates.category = updates.category
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost
      if (updates.billingCycle) dbUpdates.billing_cycle = updates.billingCycle
      if (updates.nextBillingDate) dbUpdates.next_billing_date = updates.nextBillingDate.toISOString()
      if (updates.lastUsed !== undefined) dbUpdates.last_used = updates.lastUsed?.toISOString() || null
      if (updates.status) dbUpdates.status = updates.status

      const { data, error } = await supabase
        .from('subscriptions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setSubscriptions(prev => prev.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ))

      return data
    } catch (err) {
      console.error('Error updating subscription:', err)
      throw err
    }
  }

  const deleteSubscription = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setSubscriptions(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting subscription:', err)
      throw err
    }
  }

  return {
    transactions,
    subscriptions,
    budgets,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshData: fetchAllData,
  }
}

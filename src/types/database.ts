// Database types for Supabase responses
export interface DbTransaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: string | number
  category: string
  description: string
  date: string
  recurring: boolean
  frequency?: 'weekly' | 'monthly' | 'yearly'
  created_at?: string
}

export interface DbSubscription {
  id: string
  user_id: string
  name: string
  category: string
  cost: string | number
  billing_cycle: 'monthly' | 'yearly'
  next_billing_date: string
  last_used?: string
  status: 'active' | 'cancelled'
  created_at?: string
}

export interface DbBudget {
  id: string
  user_id: string
  category: string
  limit_amount: string | number
  period: 'monthly' | 'yearly'
  created_at?: string
}

export interface DbTransactionAmount {
  amount: string | number
}

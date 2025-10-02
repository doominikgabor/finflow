import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user data
    const [transactionsData, budgetsData, subscriptionsData, preferencesData] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('subscriptions').select('*').eq('user_id', user.id),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
    ])

    if (transactionsData.error) throw transactionsData.error
    if (budgetsData.error) throw budgetsData.error
    if (subscriptionsData.error) throw subscriptionsData.error

    // Prepare export data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      preferences: preferencesData.data || {},
      transactions: transactionsData.data || [],
      budgets: budgetsData.data || [],
      subscriptions: subscriptionsData.data || [],
      exported_at: new Date().toISOString(),
      export_format_version: '1.0',
    }

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="finflow-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

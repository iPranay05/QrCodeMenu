import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'menuqr-admin-2025'

export async function GET(req: Request) {
  // Simple key-based auth
  const key = req.headers.get('x-admin-key')
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all ambassadors
    const { data: ambassadors, error } = await supabaseAdmin
      .from('ambassadors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each ambassador, count how many restaurants used their code
    const ambassadorsWithCounts = await Promise.all(
      (ambassadors || []).map(async (amb) => {
        const { count } = await supabaseAdmin
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('referral_code', amb.referral_code)

        return { ...amb, referral_count: count || 0 }
      })
    )

    return NextResponse.json({ ambassadors: ambassadorsWithCounts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

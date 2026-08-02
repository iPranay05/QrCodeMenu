import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'menuqr-admin-2025'

export async function GET(req: Request) {
  const key = req.headers.get('x-admin-key')
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: ambassadors, error } = await supabaseAdmin
      .from('ambassadors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each ambassador, fetch the full restaurant records they referred
    const ambassadorsWithRestaurants = await Promise.all(
      (ambassadors || []).map(async (amb) => {
        const { data: restaurants } = await supabaseAdmin
          .from('restaurants')
          .select('id, name, slug, phone, address, created_at, primary_color, logo_url')
          .eq('referral_code', amb.referral_code)
          .order('created_at', { ascending: false })

        return {
          ...amb,
          referral_count: restaurants?.length || 0,
          restaurants: restaurants || [],
        }
      })
    )

    return NextResponse.json({ ambassadors: ambassadorsWithRestaurants })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

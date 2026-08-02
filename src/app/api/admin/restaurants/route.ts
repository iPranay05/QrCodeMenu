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

    // Get all restaurants with their referral code info
    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, phone, address, created_at, primary_color, logo_url, referral_code, theme, tagline')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each restaurant with a referral code, get the ambassador name
    const restaurantsWithAmbassador = await Promise.all(
      (restaurants || []).map(async (r) => {
        if (!r.referral_code) return { ...r, ambassador: null }

        const { data: ambassador } = await supabaseAdmin
          .from('ambassadors')
          .select('name, email, city, college')
          .eq('referral_code', r.referral_code)
          .single()

        return { ...r, ambassador: ambassador || null }
      })
    )

    return NextResponse.json({ restaurants: restaurantsWithAmbassador })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

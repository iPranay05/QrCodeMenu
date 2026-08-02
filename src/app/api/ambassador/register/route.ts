import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function generateReferralCode(name: string): string {
  const prefix = name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X')
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${suffix}`
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { name, email, phone, college, city } = await req.json()

    if (!name || !email || !phone || !college || !city) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('ambassadors')
      .select('referral_code')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This email is already registered as an ambassador.', referral_code: existing.referral_code }, { status: 409 })
    }

    // Generate a unique referral code (retry up to 5 times on collision)
    let referral_code = ''
    for (let i = 0; i < 5; i++) {
      referral_code = generateReferralCode(name)
      const { data: conflict } = await supabaseAdmin
        .from('ambassadors')
        .select('id')
        .eq('referral_code', referral_code)
        .single()
      if (!conflict) break
    }

    const { data, error } = await supabaseAdmin.from('ambassadors').insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      college: college.trim(),
      city: city.trim(),
      referral_code,
      status: 'active',
    }).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, referral_code: data.referral_code })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

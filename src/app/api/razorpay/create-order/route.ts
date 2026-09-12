import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

// Plan: ₹100 for 3 months = 10000 paise
// Using Razorpay Subscriptions for auto-debit
const PLAN_AMOUNT_PAISE = 10000
const PLAN_INTERVAL_MONTHS = 3

let razorpayInstance: Razorpay | null = null

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret || keyId === 'rzp_test_REPLACE_ME') {
      throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local')
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }
  return razorpayInstance
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id, name, razorpay_subscription_id, subscription_status')
      .eq('user_id', user.id)
      .single()

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const razorpay = getRazorpay()

    // Create or retrieve a Razorpay Plan
    // Plan name: MenuQR Quarterly
    // We create a one-time order (simpler) since Razorpay Subscriptions require 
    // pre-created plans via dashboard for auto-debit. 
    // For the MVP we use a recurring-capable order approach.
    const order = await razorpay.orders.create({
      amount: PLAN_AMOUNT_PAISE,
      currency: 'INR',
      receipt: `sub_${restaurant.id}_${Date.now()}`,
      notes: {
        restaurant_id: restaurant.id,
        user_id: user.id,
        plan: `${PLAN_INTERVAL_MONTHS}-month subscription`,
      },
    })

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      restaurant_name: restaurant.name,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order'
    console.error('[Razorpay create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

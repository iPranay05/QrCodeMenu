import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUBSCRIPTION_MONTHS = 3

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) throw new Error('RAZORPAY_KEY_SECRET not set')
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex')
  return expectedSignature === signature
}

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Get the authenticated user (server-side)
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to update subscription (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate expiry: now + 3 months
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + SUBSCRIPTION_MONTHS)

    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
        razorpay_subscription_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[verify-payment] DB update failed:', updateError)
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated! Enjoy 3 months of MenuQR.',
      expires_at: expiresAt.toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment verification failed'
    console.error('[verify-payment]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

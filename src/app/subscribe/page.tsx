'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  QrCode, CheckCircle, Zap, Shield, Headphones, TrendingUp,
  Star, ArrowRight, Clock, CreditCard, RefreshCw, Sparkles
} from 'lucide-react'
import type { Restaurant } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: RazorpayPaymentResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return }
    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function getSubscriptionInfo(restaurant: Restaurant) {
  const now = new Date()

  if (restaurant.subscription_status === 'trial' && restaurant.trial_ends_at) {
    const trialEnd = new Date(restaurant.trial_ends_at)
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { type: 'trial', daysLeft: Math.max(0, daysLeft), expired: trialEnd < now }
  }

  if (restaurant.subscription_status === 'active' && restaurant.subscription_expires_at) {
    const expiry = new Date(restaurant.subscription_expires_at)
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    // Grace period check (3 days)
    const gracePeriodEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000)
    return {
      type: daysLeft > 0 ? 'active' : 'grace',
      daysLeft: Math.max(0, daysLeft),
      expired: gracePeriodEnd < now,
    }
  }

  return { type: 'expired', daysLeft: 0, expired: true }
}

const features = [
  { icon: QrCode, label: 'Instant QR Code generation', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: TrendingUp, label: 'Real-time order management', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Zap, label: 'AI menu extraction from photos', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Star, label: 'Custom branding & themes', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Shield, label: 'Secure, hosted menu pages', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Headphones, label: 'Priority support', color: 'text-rose-600', bg: 'bg-rose-50' },
]

export default function SubscribePage() {
  const router = useRouter()
  const supabase = createClient()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      setUserEmail(user.email || '')

      const { data: rest } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (rest) {
        setRestaurant(rest as Restaurant)
        // If subscription is still fully valid, redirect to dashboard
        const info = getSubscriptionInfo(rest as Restaurant)
        if (!info.expired && info.daysLeft > 3) {
          router.replace('/dashboard')
          return
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handlePay = async () => {
    setPaying(true)
    try {
      const sdkLoaded = await loadRazorpayScript()
      if (!sdkLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.')
        setPaying(false)
        return
      }

      // Create order on server
      const res = await fetch('/api/razorpay/create-order', { method: 'POST' })
      const orderData = await res.json()

      if (!res.ok) {
        toast.error(orderData.error || 'Could not initiate payment')
        setPaying(false)
        return
      }

      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MenuQR',
        description: '3-Month Subscription — ₹100',
        order_id: orderData.order_id,
        prefill: {
          email: userEmail,
          name: restaurant?.name || '',
        },
        theme: { color: '#4F46E5' },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // Verify payment on server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            const verifyData = await verifyRes.json()

            if (!verifyRes.ok) {
              toast.error(verifyData.error || 'Payment verification failed')
              return
            }

            toast.success('🎉 Subscription activated! Enjoy 3 months of MenuQR.')
            router.push('/dashboard')
          } catch {
            toast.error('Payment verification error. Please contact support.')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      toast.error(msg)
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const subInfo = restaurant ? getSubscriptionInfo(restaurant) : null
  const isExpired = subInfo?.expired
  const isTrialAlmostOver = subInfo?.type === 'trial' && (subInfo.daysLeft ?? 0) <= 2
  const isGrace = subInfo?.type === 'grace'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 font-extrabold text-base">MenuQR</span>
          </Link>
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
        {/* Status Banner */}
        {(isExpired || isTrialAlmostOver || isGrace) && (
          <div className={`mb-8 rounded-2xl p-4 text-center text-sm font-semibold border ${
            isExpired ? 'bg-red-50 border-red-200 text-red-700' :
            isGrace ? 'bg-orange-50 border-orange-200 text-orange-700' :
            'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {isExpired && '⚠️ Your subscription has expired. Renew now to restore full access.'}
            {isGrace && `⏰ You have ${subInfo?.daysLeft ?? 0} days of grace period left before your dashboard is locked.`}
            {!isExpired && !isGrace && isTrialAlmostOver && `⏰ Your free trial ends in ${subInfo?.daysLeft ?? 0} day(s). Subscribe to keep access.`}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left — Value prop */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Sparkles size={12} />
              Simple, Honest Pricing
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
              Everything your restaurant needs,{' '}
              <span className="gradient-text">for ₹100</span>
            </h1>

            <p className="text-slate-500 text-base font-medium mb-8 leading-relaxed">
              One payment. 3 months of full access to MenuQR — digital menus, QR codes, live orders, and more. No hidden fees.
            </p>

            {/* Feature list */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {features.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm">
                  <div className={`w-8 h-8 ${bg} ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-slate-700 text-sm font-semibold">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle size={15} className="text-emerald-500" /> 3-day free trial included</span>
              <span className="flex items-center gap-1.5"><RefreshCw size={15} className="text-indigo-500" /> Auto-renews every 3 months</span>
              <span className="flex items-center gap-1.5"><Shield size={15} className="text-blue-500" /> Secure payment via Razorpay</span>
            </div>
          </div>

          {/* Right — Payment card */}
          <div>
            <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.06)] border border-slate-200/80 overflow-hidden">
              {/* Card header */}
              <div className="bg-slate-900 px-8 pt-8 pb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">MenuQR Subscription</div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-white">₹100</span>
                    <span className="text-slate-400 text-sm font-semibold mb-2">/ 3 months</span>
                  </div>
                  <div className="text-slate-400 text-xs font-medium">≈ ₹33/month. That&apos;s less than a cup of chai ☕</div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-8">
                {/* What's included */}
                <div className="space-y-3 mb-8">
                  {[
                    'Unlimited menu items & categories',
                    'Custom QR code with your branding',
                    'Live order management dashboard',
                    'AI-powered menu extraction',
                    'Customer-facing mobile menu page',
                    'Real-time order notifications',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Trial info */}
                {subInfo?.type === 'trial' && (subInfo.daysLeft ?? 0) > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center gap-2">
                    <Clock size={15} className="text-amber-600 flex-shrink-0" />
                    <span className="text-amber-700 text-xs font-semibold">
                      Your free trial ends in <strong>{subInfo.daysLeft} day(s)</strong>. Payment won&apos;t be charged until trial ends.
                    </span>
                  </div>
                )}

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Pay ₹100 &amp; Activate</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-center text-slate-400 text-xs font-medium mt-4">
                  🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1"><Shield size={13} /> Bank-grade security</span>
              <span className="flex items-center gap-1"><RefreshCw size={13} /> Easy cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import Aurora from '@/components/ui/Aurora'
import type { Restaurant } from '@/lib/types'

function isSubscriptionValid(restaurant: Restaurant | null): boolean {
  if (!restaurant) return true // No restaurant yet → let them through to profile setup

  const now = new Date()

  // Trial period
  if (restaurant.subscription_status === 'trial' && restaurant.trial_ends_at) {
    return new Date(restaurant.trial_ends_at) > now
  }

  // Active subscription
  if (restaurant.subscription_status === 'active' && restaurant.subscription_expires_at) {
    const expiry = new Date(restaurant.subscription_expires_at)
    // 3-day grace period
    const gracePeriodEnd = new Date(expiry.getTime() + 3 * 24 * 60 * 60 * 1000)
    return gracePeriodEnd > now
  }

  // If no subscription info at all (legacy accounts) — treat as trial needing setup
  if (!restaurant.subscription_status && !restaurant.subscription_expires_at && !restaurant.trial_ends_at) {
    return true
  }

  return false
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check subscription status
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, subscription_status, subscription_expires_at, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  if (!isSubscriptionValid(restaurant as Restaurant | null)) {
    redirect('/subscribe')
  }

  return (
    <Aurora showGrid={true}>
      <div className="flex flex-1 min-h-screen w-full relative z-10">
        <DashboardSidebar />
        <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen relative z-10 w-full">
          {children}
        </main>
      </div>
    </Aurora>
  )
}

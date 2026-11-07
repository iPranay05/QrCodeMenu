'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QrDesigner } from '@/components/qr/QrDesigner'
import type { Restaurant } from '@/lib/types'

export default function QrCodePage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: rests } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRestaurant(rests && rests.length > 0 ? rests[0] : null)
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">No Restaurant Profile Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          Please create or set up your restaurant profile first in the Settings/Profile page.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
          QR Code Designer 🎨
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm font-semibold">
          Design, brand, and export high-resolution QR codes and table stands for{' '}
          <strong className="text-slate-700">{restaurant.name}</strong>.
        </p>
      </div>

      {/* Main Designer Studio */}
      <QrDesigner
        restaurant={restaurant}
        onRestaurantUpdated={updated => setRestaurant(updated)}
      />
    </div>
  )
}

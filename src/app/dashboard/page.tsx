import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Utensils, Settings, ExternalLink, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const restaurant = restaurants && restaurants.length > 0 ? restaurants[0] : null

  const { count: categoryCount } = await supabase
    .from('menu_categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id || '')

  const { count: itemCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id || '')

  const menuUrl = restaurant ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/menu/${restaurant.slug}` : ''

  const quickActions = [
    { href: '/dashboard/menu', icon: Utensils, label: 'Add Menu Items', desc: 'Build your menu', color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-200' },
    { href: '/dashboard/profile', icon: Settings, label: 'Edit Profile', desc: 'Update your info', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-200' },
    { href: '/dashboard/qrcode', icon: QrCode, label: 'Get QR Code', desc: 'Download & print', color: 'from-teal-500 to-cyan-500', shadow: 'shadow-teal-200' },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {restaurant?.name ? `Managing ${restaurant.name}` : 'Your restaurant dashboard'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Menu Categories', value: categoryCount ?? 0, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Menu Items', value: itemCount ?? 0, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Menu Status', value: restaurant ? '🟢 Live' : '⚪ Setup', color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-white shadow-sm`}>
            <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-600 text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Your Menu Link */}
      {restaurant && (
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-6 border border-orange-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-1">Your Public Menu</div>
            <div className="text-gray-700 font-medium break-all">{menuUrl}</div>
          </div>
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap shadow-lg shadow-orange-200"
          >
            <span>View Menu</span>
            <ExternalLink size={15} />
          </a>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {quickActions.map(({ href, icon: Icon, label, desc, color, shadow }) => (
          <Link
            key={href}
            href={href}
            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-6 card-hover shadow-lg ${shadow} block`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Icon size={24} />
            </div>
            <div className="font-bold text-lg">{label}</div>
            <div className="text-white/75 text-sm mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Getting Started */}
      {(!categoryCount || categoryCount === 0) && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-amber-800 text-lg mb-2">🚀 Getting Started</h3>
          <ol className="space-y-2 text-amber-700 text-sm">
            <li className="flex items-start gap-2"><span className="font-bold">1.</span> <Link href="/dashboard/profile" className="underline underline-offset-2">Complete your restaurant profile</Link> — add logo, tagline, and contact info.</li>
            <li className="flex items-start gap-2"><span className="font-bold">2.</span> <Link href="/dashboard/menu" className="underline underline-offset-2">Build your menu</Link> — create categories and add menu items.</li>
            <li className="flex items-start gap-2"><span className="font-bold">3.</span> <Link href="/dashboard/qrcode" className="underline underline-offset-2">Download your QR code</Link> — print it and place on your tables!</li>
          </ol>
        </div>
      )}
    </div>
  )
}

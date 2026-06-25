import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Utensils, Settings, ArrowRight, Layers, Eye, ShieldCheck, Sparkles, Plus } from 'lucide-react'
import DashboardAnalytics from '@/components/DashboardAnalytics'

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

  // Fetch counts
  const { count: categoryCount } = await supabase
    .from('menu_categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id || '')

  const { count: itemCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id || '')

  // Fetch popular items for previewing in the analytics widget
  let popularItems: any[] = []
  if (restaurant) {
    const { data } = await supabase
      .from('menu_items')
      .select('id, name, price, is_veg')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })
      .limit(3)
    popularItems = data || []
  }

  const menuUrl = restaurant 
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/menu/${restaurant.slug}` 
    : ''

  const quickActions = [
    { href: '/dashboard/menu', icon: Utensils, label: 'Manage Menu', desc: 'Add categories, dishes, and customize prices.', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50 border border-indigo-100/60' },
    { href: '/dashboard/profile', icon: Settings, label: 'Edit Profile', desc: 'Update details, banner, and styling.', iconColor: 'text-slate-600', iconBg: 'bg-slate-50 border border-slate-200/60' },
    { href: '/dashboard/qrcode', icon: QrCode, label: 'Print QR Code', desc: 'Download custom signs for customer tables.', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 border border-emerald-100/60' },
  ]

  const stats = [
    { label: 'Total Scans', value: restaurant ? '2,380' : '0', change: '+14%', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-100/50' },
    { label: 'Categories', value: categoryCount ?? 0, change: null, icon: Layers, color: 'text-slate-600', bg: 'bg-slate-50 border border-slate-200/50' },
    { label: 'Menu Items', value: itemCount ?? 0, change: null, icon: Utensils, color: 'text-indigo-500', bg: 'bg-indigo-50 border border-indigo-100/30' },
    { label: 'Menu Status', value: restaurant ? 'Live' : 'Setup Needed', change: null, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-100/50' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full w-max">
            <Sparkles size={11} className="text-indigo-500" />
            <span>Restaurant Console</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mt-2">
            Welcome back!
          </h1>
          <p className="text-gray-400 mt-0.5 text-xs font-semibold">
            {restaurant?.name ? `Managing ${restaurant.name}` : 'Setup your digital menu builder to get started'}
          </p>
        </div>

        {restaurant && (
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-800 hover:-translate-y-0.5 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <span>Preview Live Menu</span>
            <ArrowRight size={13} />
          </a>
        )}
      </div>

      {/* Onboarding Empty State if No Restaurant Profile */}
      {!restaurant ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 lg:p-12 text-center max-w-3xl mx-auto shadow-sm space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Utensils size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your digital menu profile</h2>
            <p className="text-gray-500 font-semibold text-sm max-w-md mx-auto">
              You are just one step away from launching your QR code menu. Build your profile and upload your dishes today.
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Plus size={16} />
              <span>Initialize Profile Now</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.01)] flex items-center justify-between hover:border-slate-300 transition-all duration-200"
                >
                  <div className="min-w-0">
                    <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{stat.label}</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <div className="text-lg lg:text-xl font-extrabold text-slate-800 truncate">{stat.value}</div>
                      {stat.change && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-xl shrink-0 ${stat.bg} ${stat.color} flex items-center justify-center ml-1`}>
                    <Icon size={15} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Premium Analytics & QR Preview Widget */}
          <DashboardAnalytics 
            restaurant={restaurant} 
            menuUrl={menuUrl} 
            popularItems={popularItems} 
          />
        </>
      )}

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight">Management shortcuts</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {quickActions.map(({ href, icon: Icon, label, desc, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="group block relative"
            >
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(15,23,42,0.01)] transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
                <div className={`w-9 h-9 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={18} />
                </div>
                <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                  <span>{label}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5 text-slate-400" />
                </div>
                <div className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Progress indicator */}
      {restaurant && (!categoryCount || categoryCount === 0) && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <h3 className="font-bold text-slate-800 text-sm">Setup Checklist</h3>
          </div>
          <ol className="space-y-3.5 text-slate-600 text-xs font-semibold">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span className="mt-0.5">
                <Link href="/dashboard/profile" className="underline underline-offset-4 hover:text-slate-900 transition-colors">
                  Complete your profile
                </Link>
                {' '}— Check logo, banner image, and currency settings.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span className="mt-0.5">
                <Link href="/dashboard/menu" className="underline underline-offset-4 hover:text-slate-900 transition-colors">
                  Build your digital menu
                </Link>
                {' '}— Add your categories and first few dishes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <span className="mt-0.5">
                <Link href="/dashboard/qrcode" className="underline underline-offset-4 hover:text-slate-900 transition-colors">
                  Get your table QR signs
                </Link>
                {' '}— Download and print them to put on customer tables!
              </span>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  QrCode, LayoutDashboard, Utensils, Settings, LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/menu', label: 'Menu Builder', icon: Utensils },
  { href: '/dashboard/profile', label: 'Profile', icon: Settings },
  { href: '/dashboard/qrcode', label: 'QR Code', icon: QrCode },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shadow-[1px_0_4px_rgba(15,23,42,0.01)] fixed h-full z-30">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
              <QrCode className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-800 tracking-tight">MenuQR</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 font-semibold text-sm w-full transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200/80 shadow-sm z-30 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base text-slate-800 tracking-tight">MenuQR</span>
        </Link>
        <button 
          onClick={handleSignOut} 
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Mobile Bottom Floating Nav */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl z-40 px-2 py-2 flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-1.5 px-3 gap-1 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                active 
                  ? 'text-slate-900 bg-slate-100 font-bold' 
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              <span>{label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

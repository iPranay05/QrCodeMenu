'use client'
import { useState, useEffect } from 'react'
import {
  QrCode, Users, Copy, CheckCircle, TrendingUp, Search, Lock, Eye, EyeOff,
  RefreshCw, MapPin, GraduationCap, Phone, Mail, Calendar, Store,
  ChevronDown, ChevronUp, ExternalLink, Gift, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ADMIN_KEY = 'menuqr-admin-2025'

interface ReferredRestaurant {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  created_at: string
  primary_color: string
  logo_url: string | null
}

interface Ambassador {
  id: string
  name: string
  email: string
  phone: string
  college: string
  city: string
  referral_code: string
  status: string
  created_at: string
  referral_count: number
  restaurants: ReferredRestaurant[]
}

interface RestaurantRow {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  created_at: string
  primary_color: string
  logo_url: string | null
  referral_code: string | null
  theme: string | null
  tagline: string | null
  ambassador: {
    name: string
    email: string
    city: string
    college: string
  } | null
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

// ─── Ambassador Card ──────────────────────────────────────────────────────────

function AmbassadorCard({ amb }: { amb: Ambassador }) {
  const [expanded, setExpanded] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(amb.referral_code)
    setCopiedCode(true)
    toast.success('Code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
              {amb.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-black text-slate-800 text-base">{amb.name}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${amb.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {amb.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Mail size={11} />{amb.email}</span>
                <span className="flex items-center gap-1"><Phone size={11} />{amb.phone}</span>
                <span className="flex items-center gap-1"><GraduationCap size={11} />{amb.college}</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{amb.city}</span>
                <span className="flex items-center gap-1"><Calendar size={11} />Joined {new Date(amb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
            <button onClick={copyCode} className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-2 transition-colors group">
              <span className="font-mono font-black text-slate-800 text-sm tracking-wider group-hover:text-indigo-700 transition-colors">{amb.referral_code}</span>
              {copiedCode ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400 group-hover:text-indigo-500" />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors border ${expanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
            >
              <Store size={14} />
              <span>{amb.referral_count} restaurant{amb.referral_count !== 1 ? 's' : ''}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-5">
          {amb.restaurants.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Store size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No restaurants referred yet</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Restaurants Referred by {amb.name.split(' ')[0]}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {amb.restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ backgroundColor: restaurant.primary_color || '#4F46E5' }}>
                          {restaurant.name[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{restaurant.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">/{restaurant.slug}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 font-medium">
                      {restaurant.phone && <div className="flex items-center gap-1.5"><Phone size={11} className="text-slate-400 flex-shrink-0" />{restaurant.phone}</div>}
                      {restaurant.address && <div className="flex items-center gap-1.5"><MapPin size={11} className="text-slate-400 flex-shrink-0" /><span className="truncate">{restaurant.address}</span></div>}
                      <div className="flex items-center gap-1.5"><Calendar size={11} className="text-slate-400 flex-shrink-0" />Joined {new Date(restaurant.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      <ExternalLink size={11} /> View Menu
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Restaurant Card ──────────────────────────────────────────────────────────

function RestaurantCard({ r }: { r: RestaurantRow }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Logo + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {r.logo_url ? (
            <img src={r.logo_url} alt={r.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0 shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm" style={{ backgroundColor: r.primary_color || '#4F46E5' }}>
              {r.name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-black text-slate-800 text-base">{r.name}</span>
              {r.theme && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{r.theme}</span>
              )}
            </div>
            {r.tagline && <p className="text-slate-500 text-xs font-medium italic mb-1.5">"{r.tagline}"</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Globe size={11} />/{r.slug}</span>
              {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
              {r.address && <span className="flex items-center gap-1"><MapPin size={11} /><span className="truncate max-w-[180px]">{r.address}</span></span>}
              <span className="flex items-center gap-1"><Calendar size={11} />Joined {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right side — referral info + menu link */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
          <a
            href={`/menu/${r.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 transition-colors"
          >
            <ExternalLink size={13} /> View Menu
          </a>

          {r.ambassador ? (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
              <Gift size={13} className="text-indigo-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-black text-indigo-700">{r.ambassador.name}</span>
                <span className="text-indigo-400 font-medium"> · {r.referral_code}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400 font-medium">No referral</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState(false)

  const [tab, setTab] = useState<'ambassadors' | 'restaurants'>('ambassadors')

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([])
  const [loadingAmb, setLoadingAmb] = useState(false)
  const [loadingRest, setLoadingRest] = useState(false)

  const [ambSearch, setAmbSearch] = useState('')
  const [restSearch, setRestSearch] = useState('')
  const [ambSort, setAmbSort] = useState<'date' | 'referrals'>('date')
  const [restSort, setRestSort] = useState<'date' | 'name'>('date')

  const login = () => {
    if (password === ADMIN_KEY) { setAuthed(true); setPwError(false) }
    else { setPwError(true); toast.error('Incorrect admin password') }
  }

  const fetchAmbassadors = async () => {
    setLoadingAmb(true)
    try {
      const res = await fetch('/api/admin/ambassadors', { headers: { 'x-admin-key': ADMIN_KEY } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAmbassadors(data.ambassadors || [])
    } catch (err: any) { toast.error(err.message || 'Failed to load ambassadors') }
    finally { setLoadingAmb(false) }
  }

  const fetchRestaurants = async () => {
    setLoadingRest(true)
    try {
      const res = await fetch('/api/admin/restaurants', { headers: { 'x-admin-key': ADMIN_KEY } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRestaurants(data.restaurants || [])
    } catch (err: any) { toast.error(err.message || 'Failed to load restaurants') }
    finally { setLoadingRest(false) }
  }

  useEffect(() => {
    if (authed) { fetchAmbassadors(); fetchRestaurants() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const filteredAmb = ambassadors
    .filter(a =>
      [a.name, a.email, a.college, a.city, a.referral_code, ...a.restaurants.map(r => r.name)]
        .join(' ').toLowerCase().includes(ambSearch.toLowerCase())
    )
    .sort((a, b) => ambSort === 'referrals' ? b.referral_count - a.referral_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredRest = restaurants
    .filter(r =>
      [r.name, r.slug, r.phone || '', r.address || '', r.referral_code || '', r.ambassador?.name || '']
        .join(' ').toLowerCase().includes(restSearch.toLowerCase())
    )
    .sort((a, b) => restSort === 'name' ? a.name.localeCompare(b.name) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalReferrals = ambassadors.reduce((s, a) => s + a.referral_count, 0)
  const topAmbassador = ambassadors.reduce((best, a) => (!best || a.referral_count > best.referral_count) ? a : best, null as Ambassador | null)
  const referredCount = restaurants.filter(r => r.referral_code).length

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><QrCode className="w-5 h-5 text-white" /></div>
              <span className="text-white font-black text-xl">MenuQR</span>
            </Link>
            <div className="w-16 h-16 bg-indigo-500/15 border border-indigo-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-indigo-400" />
            </div>
            <h1 className="text-white text-2xl font-black">Admin Access</h1>
            <p className="text-white/50 text-sm mt-1">Enter your admin password to continue</p>
          </div>
          <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="relative mb-4">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError(false) }}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Admin password"
                className={`w-full bg-white/8 border rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-white/25 outline-none transition-all ${pwError ? 'border-rose-400/60' : 'border-white/10 focus:border-indigo-400/60'}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwError && <p className="text-rose-400 text-xs mb-3 font-semibold">Incorrect password</p>}
            <button onClick={login} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors">Enter Admin Panel</button>
          </div>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  const isLoading = loadingAmb || loadingRest

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center"><QrCode className="w-4 h-4 text-white" /></div>
              <span className="font-black text-slate-800 text-base">MenuQR</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={() => { fetchAmbassadors(); fetchRestaurants() }} disabled={isLoading} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Restaurants" value={restaurants.length} icon={<Store size={20} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Total Ambassadors" value={ambassadors.length} icon={<Users size={20} className="text-indigo-600" />} color="bg-indigo-50" />
          <StatCard label="Referred Restaurants" value={referredCount} icon={<Gift size={20} className="text-violet-600" />} color="bg-violet-50" />
          <StatCard label="Top Ambassador" value={topAmbassador ? `${topAmbassador.referral_count} refs` : '—'} icon={<TrendingUp size={20} className="text-amber-600" />} color="bg-amber-50" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mb-5 w-fit">
          <button
            onClick={() => setTab('ambassadors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'ambassadors' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={15} /> Ambassadors
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${tab === 'ambassadors' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{ambassadors.length}</span>
          </button>
          <button
            onClick={() => setTab('restaurants')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'restaurants' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Store size={15} /> Restaurants
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${tab === 'restaurants' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{restaurants.length}</span>
          </button>
        </div>

        {/* ── AMBASSADORS TAB ── */}
        {tab === 'ambassadors' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 shadow-sm">
              <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input type="text" value={ambSearch} onChange={e => setAmbSearch(e.target.value)} placeholder="Search by name, email, college, city, code or restaurant..." className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setAmbSort('date')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ambSort === 'date' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Newest First</button>
                <button onClick={() => setAmbSort('referrals')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ambSort === 'referrals' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Most Referrals</button>
              </div>
            </div>

            {loadingAmb ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-sm">Loading ambassadors...</p>
              </div>
            ) : filteredAmb.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">{ambSearch ? 'No results found' : 'No ambassadors yet'}</p>
                <p className="text-slate-400 text-sm mt-1">{ambSearch ? 'Try a different search term' : 'Share /ambassador to get started'}</p>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-xs font-semibold mb-3">{filteredAmb.length} ambassador{filteredAmb.length !== 1 ? 's' : ''} · Click "N restaurants" to expand</p>
                <div className="space-y-3">
                  {filteredAmb.map(amb => <AmbassadorCard key={amb.id} amb={amb} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* ── RESTAURANTS TAB ── */}
        {tab === 'restaurants' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 shadow-sm">
              <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input type="text" value={restSearch} onChange={e => setRestSearch(e.target.value)} placeholder="Search by name, slug, phone, address, or ambassador..." className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setRestSort('date')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${restSort === 'date' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Newest First</button>
                <button onClick={() => setRestSort('name')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${restSort === 'name' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>A–Z</button>
              </div>
            </div>

            {loadingRest ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-sm">Loading restaurants...</p>
              </div>
            ) : filteredRest.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <Store size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">{restSearch ? 'No results found' : 'No restaurants yet'}</p>
                <p className="text-slate-400 text-sm mt-1">{restSearch ? 'Try a different search term' : 'Restaurants will appear here once they sign up'}</p>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-xs font-semibold mb-3">
                  {filteredRest.length} restaurant{filteredRest.length !== 1 ? 's' : ''} · {referredCount} referred via ambassador
                </p>
                <div className="space-y-3">
                  {filteredRest.map(r => <RestaurantCard key={r.id} r={r} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

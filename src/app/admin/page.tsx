'use client'
import { useState, useEffect } from 'react'
import { QrCode, Users, Copy, CheckCircle, TrendingUp, Search, Lock, Eye, EyeOff, RefreshCw, MapPin, GraduationCap, Phone, Mail, Calendar, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ADMIN_KEY = 'menuqr-admin-2025'

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
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm`}>
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState(false)

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'referrals'>('date')

  const login = () => {
    if (password === ADMIN_KEY) {
      setAuthed(true)
      setPwError(false)
      fetchData()
    } else {
      setPwError(true)
      toast.error('Incorrect admin password')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ambassadors', {
        headers: { 'x-admin-key': ADMIN_KEY },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAmbassadors(data.ambassadors || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Code copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filtered = ambassadors
    .filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.college.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.referral_code.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === 'referrals'
        ? b.referral_count - a.referral_count
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const totalReferrals = ambassadors.reduce((s, a) => s + a.referral_count, 0)
  const topAmbassador = ambassadors.reduce((best, a) => (!best || a.referral_count > best.referral_count) ? a : best, null as Ambassador | null)

  // ─── LOGIN SCREEN ───
  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
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
            <button
              onClick={login}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Enter Admin Panel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── ADMIN DASHBOARD ───
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-800 text-base">MenuQR</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-bold text-sm">Ambassador Admin</span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Ambassadors" value={ambassadors.length} icon={<Users size={20} className="text-indigo-600" />} color="bg-indigo-50" />
          <StatCard label="Total Referrals" value={totalReferrals} icon={<Store size={20} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Active Ambassadors" value={ambassadors.filter(a => a.status === 'active').length} icon={<TrendingUp size={20} className="text-violet-600" />} color="bg-violet-50" />
          <StatCard label="Top Performer" value={topAmbassador ? `${topAmbassador.referral_count} refs` : '—'} icon={<CheckCircle size={20} className="text-amber-600" />} color="bg-amber-50" />
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 shadow-sm">
          <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, college, city or code..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === 'date' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortBy('referrals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === 'referrals' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Most Referrals
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Loading ambassador data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">{search ? 'No results found' : 'No ambassadors yet'}</p>
            <p className="text-slate-400 text-sm mt-1">{search ? 'Try a different search term' : 'Share the /ambassador page to get started'}</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-xs font-semibold mb-3">{filtered.length} ambassador{filtered.length !== 1 ? 's' : ''} shown</p>
            <div className="space-y-3">
              {filtered.map((amb) => (
                <div key={amb.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar + name */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
                        {amb.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
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
                          <span className="flex items-center gap-1"><Calendar size={11} />{new Date(amb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Code + referral count */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => copyCode(amb.referral_code)}
                        className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-2 transition-colors group"
                      >
                        <span className="font-mono font-black text-slate-800 text-sm tracking-wider group-hover:text-indigo-700 transition-colors">
                          {amb.referral_code}
                        </span>
                        {copiedCode === amb.referral_code
                          ? <CheckCircle size={14} className="text-emerald-500" />
                          : <Copy size={14} className="text-slate-400 group-hover:text-indigo-500" />
                        }
                      </button>

                      <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                        <Store size={14} className="text-indigo-500" />
                        <span className="text-indigo-700 font-black text-sm">{amb.referral_count}</span>
                        <span className="text-indigo-400 text-xs font-semibold">referred</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

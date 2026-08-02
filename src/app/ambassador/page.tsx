'use client'
import { useState } from 'react'
import Link from 'next/link'
import { QrCode, User, Mail, Phone, GraduationCap, MapPin, ArrowRight, Copy, CheckCircle2, Star, Users, TrendingUp, Gift } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormState {
  name: string
  email: string
  phone: string
  college: string
  city: string
}

export default function AmbassadorPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', college: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  const validate = (): boolean => {
    const errs: Partial<FormState> = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim() || form.phone.trim().length < 10) errs.phone = 'Enter a valid phone number'
    if (!form.college.trim()) errs.college = 'College / Institution is required'
    if (!form.city.trim()) errs.city = 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ambassador/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data.referral_code) {
          // Already registered — show their code
          setReferralCode(data.referral_code)
          toast.success('You\'re already registered! Here\'s your code.')
        } else {
          toast.error(data.error || 'Registration failed')
        }
        return
      }
      setReferralCode(data.referral_code)
      toast.success('Welcome aboard! 🎉')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const perks = [
    { icon: <Gift size={20} className="text-violet-500" />, title: 'Earn per Referral', desc: 'Get rewarded every time a restaurant signs up with your code' },
    { icon: <TrendingUp size={20} className="text-indigo-500" />, title: 'Track Your Growth', desc: 'See how many restaurants you\'ve brought on board in real-time' },
    { icon: <Users size={20} className="text-emerald-500" />, title: 'Join the Network', desc: 'Be part of an exclusive community of campus ambassadors' },
    { icon: <Star size={20} className="text-amber-500" />, title: 'Build Your Portfolio', desc: 'Gain real sales & marketing experience with a growing startup' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/30 rounded-full blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">MenuQR</span>
          </Link>
          <Link href="/login" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
            Restaurant Login →
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left — Info */}
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-400/20 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              Campus Ambassador Program
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Turn your campus into a
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> revenue stream</span>
            </h1>

            <p className="text-white/60 text-base sm:text-lg font-medium leading-relaxed mb-10">
              Refer restaurants to MenuQR, earn rewards, and build real-world startup experience — all while studying.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {perks.map((perk, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors backdrop-blur-sm">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    {perk.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{perk.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-400/20 rounded-2xl p-5 text-white/70 text-sm font-medium leading-relaxed">
              💡 <strong className="text-white">How it works:</strong> Register below → get your personal referral code → share it with restaurant owners → they enter it when signing up → you earn!
            </div>
          </div>

          {/* Right — Form or Success */}
          <div>
            {referralCode ? (
              /* SUCCESS CARD */
              <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-8 sm:p-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <h2 className="text-white text-2xl sm:text-3xl font-black mb-2">You're in! 🎉</h2>
                <p className="text-white/60 text-sm font-medium mb-8">
                  Share this code with restaurant owners when they sign up on MenuQR.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Your Referral Code</p>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-widest font-mono mb-4">
                    {referralCode}
                  </div>
                  <button
                    onClick={copyCode}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <p className="text-white/40 text-xs font-medium">
                  Restaurant owners enter this code in the "Ambassador Referral Code" field when creating their MenuQR account.
                </p>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link
                    href="/"
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors"
                  >
                    ← Back to MenuQR Home
                  </Link>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-8 sm:p-10">
                <h2 className="text-white text-2xl font-black mb-1">Register as Ambassador</h2>
                <p className="text-white/50 text-sm font-medium mb-8">Fill in your details to get your unique referral code instantly.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Rahul Sharma"
                        className="w-full bg-white/8 border border-white/10 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                      />
                    </div>
                    {errors.name && <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="rahul@college.edu"
                        className="w-full bg-white/8 border border-white/10 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                      />
                    </div>
                    {errors.email && <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/8 border border-white/10 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                      />
                    </div>
                    {errors.phone && <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.phone}</p>}
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">College / Institution</label>
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={form.college}
                        onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                        placeholder="IIT Bombay / Delhi University..."
                        className="w-full bg-white/8 border border-white/10 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                      />
                    </div>
                    {errors.college && <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.college}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">City</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="Mumbai, Delhi, Bangalore..."
                        className="w-full bg-white/8 border border-white/10 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                      />
                    </div>
                    {errors.city && <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.city}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/25 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Get My Referral Code</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-white/30 text-xs text-center mt-6 font-medium">
                  By registering, you agree to represent MenuQR professionally.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

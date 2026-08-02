'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QrCode, User, Mail, Phone, GraduationCap, MapPin, ArrowRight, Copy, CheckCircle2, Star, Users, TrendingUp, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import Aurora from '@/components/ui/Aurora'

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
          setReferralCode(data.referral_code)
          toast.success("You're already registered! Here's your code.")
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
    { icon: <Gift size={18} className="text-indigo-600" />, title: 'Earn per Referral', desc: 'Get rewarded every time a restaurant signs up with your code' },
    { icon: <TrendingUp size={18} className="text-violet-600" />, title: 'Track Your Growth', desc: 'See how many restaurants you\'ve brought on board in real-time' },
    { icon: <Users size={18} className="text-emerald-600" />, title: 'Join the Network', desc: 'Be part of an exclusive community of campus ambassadors' },
    { icon: <Star size={18} className="text-amber-500" />, title: 'Build Your Portfolio', desc: 'Gain real sales & marketing experience with a growing startup' },
  ]

  return (
    <Aurora showGrid={true} className="px-4 py-12">
      <div className="w-full max-w-5xl mx-auto relative z-10 my-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
              <QrCode className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">MenuQR</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
            Campus Ambassador Program
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-3">
            Turn referrals into <span className="gradient-text">rewards</span> ✨
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-xl mx-auto">
            Register, get your unique referral code, share it with restaurant owners, and earn every time they sign up.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left — Perks */}
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {perks.map((perk, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3 border border-slate-100">
                    {perk.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-1">{perk.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-slate-700 text-sm font-medium leading-relaxed">
              💡 <strong className="text-slate-800">How it works:</strong> Register below → get your personal referral code → share it with restaurant owners → they enter it when signing up → you earn!
            </div>
          </div>

          {/* Right — Form or Success */}
          <div>
            {referralCode ? (
              /* SUCCESS CARD */
              <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.06)] p-8 sm:p-10 border border-slate-200/80 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-slate-800 text-2xl font-black mb-2">You're in! 🎉</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Share this code with restaurant owners when they sign up on MenuQR.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Your Referral Code</p>
                  <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-widest font-mono mb-5">
                    {referralCode}
                  </div>
                  <button
                    onClick={copyCode}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <p className="text-slate-400 text-xs font-medium">
                  Restaurant owners enter this code in the "Ambassador Referral Code" field when creating their MenuQR account.
                </p>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors">
                    ← Back to MenuQR Home
                  </Link>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.06)] p-8 sm:p-10 border border-slate-200/80">
                <h2 className="text-slate-800 text-xl font-black mb-1">Register as Ambassador</h2>
                <p className="text-slate-500 text-sm font-medium mb-7">Fill in your details to get your unique referral code instantly.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                      />
                    </div>
                    {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="rahul@college.edu"
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                      />
                    </div>
                    {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                      />
                    </div>
                    {errors.phone && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.phone}</p>}
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">College / Institution</label>
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.college}
                        onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                        placeholder="IIT Bombay / Delhi University..."
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                      />
                    </div>
                    {errors.college && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.college}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">City</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="Mumbai, Delhi, Bangalore..."
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                      />
                    </div>
                    {errors.city && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.city}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors duration-200 mt-2 cursor-pointer shadow-sm"
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

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                  <p className="text-slate-500 text-sm font-semibold">
                    Already a restaurant owner?{' '}
                    <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                      Create restaurant account →
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Aurora>
  )
}

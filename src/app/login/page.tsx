'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import Aurora from '@/components/ui/Aurora'
import { QrCode, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back! 🎉')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <Aurora showGrid={true} className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
              <QrCode className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">MenuQR</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome back! 👋</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Sign in to manage your restaurant menu</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.04)] p-8 sm:p-10 border border-slate-200/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="chef@restaurant.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors duration-200 mt-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm font-semibold">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Aurora>
  )
}

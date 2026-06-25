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
import { QrCode, Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react'

const schema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError || !authData.user) {
      toast.error(authError?.message || 'Sign up failed')
      setLoading(false)
      return
    }

    // 2. Create the restaurant record
    const baseSlug = slugify(data.restaurantName)
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

    const { error: restaurantError } = await supabase.from('restaurants').insert({
      user_id: authData.user.id,
      name: data.restaurantName,
      slug,
      primary_color: '#4F46E5',
    })

    if (restaurantError) {
      toast.error('Could not create restaurant profile: ' + restaurantError.message)
      setLoading(false)
      return
    }

    toast.success('Account created! Let\'s set up your menu 🎉')
    router.push('/dashboard')
    router.refresh()
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create your menu 🚀</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Free forever. No credit card needed.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.04)] p-8 sm:p-10 border border-slate-200/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Restaurant Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('restaurantName')}
                  id="restaurantName"
                  type="text"
                  placeholder="Spice Garden"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                />
              </div>
              {errors.restaurantName && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.restaurantName.message}</p>}
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 placeholder-slate-400 bg-white"
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1.5 font-semibold pl-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors duration-200 mt-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={18} className="transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm font-semibold">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Aurora>
  )
}

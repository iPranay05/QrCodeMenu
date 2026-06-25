'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Upload, Globe, Phone, MapPin, Palette, Save, Building2, Database, AlertTriangle, Sparkles } from 'lucide-react'
import type { Restaurant } from '@/lib/types'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  tagline: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  primary_color: z.string(),
})
type FormData = z.infer<typeof schema>

const COLOR_PRESETS = [
  '#6366F1', '#4F46E5', '#A855F7', '#EC4899',
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
]

export default function ProfilePage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [dbError, setDbError] = useState<'tables_missing' | 'restaurant_missing' | null>(null)
  const [initName, setInitName] = useState('')
  const [creatingRest, setCreatingRest] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { primary_color: '#6366F1' },
  })
  const primaryColor = watch('primary_color')

  useEffect(() => {
    loadRestaurant()
  }, [])

  const loadRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: rests, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching restaurant profile:', error)
        if (error.code === 'PGRST205' || error.message?.includes('relation "public.restaurants" does not exist') || error.message?.includes('relation "restaurants" does not exist')) {
          setDbError('tables_missing')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      if (!rests || rests.length === 0) {
        setDbError('restaurant_missing')
        setLoading(false)
        return
      }

      const data = rests[0]
      if (data) {
        setRestaurant(data)
        setDbError(null)
        reset({
          name: data.name,
          tagline: data.tagline || '',
          address: data.address || '',
          phone: data.phone || '',
          website: data.website || '',
          primary_color: data.primary_color || '#6366F1',
        })
      }
    } catch (err: any) {
      console.error('Unexpected loadRestaurant error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInitialRestaurant = async () => {
    if (!initName.trim()) {
      toast.error('Please enter a restaurant name')
      return
    }
    setCreatingRest(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        setCreatingRest(false)
        return
      }

      const slug = `${initName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`
      const { data, error } = await supabase.from('restaurants').insert({
        user_id: user.id,
        name: initName.trim(),
        slug,
        primary_color: '#6366F1'
      }).select().single()

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('relation "public.restaurants" does not exist')) {
          setDbError('tables_missing')
        } else {
          toast.error(error.message)
        }
      } else {
        setRestaurant(data)
        setDbError(null)
        toast.success('Restaurant profile created! 🎉')
        loadRestaurant()
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setCreatingRest(false)
    }
  }

  const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const { error, data } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); return null }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !restaurant) return
    setLogoUploading(true)
    const url = await uploadImage(file, 'logos')
    if (url) {
      await supabase.from('restaurants').update({ logo_url: url }).eq('id', restaurant.id)
      setRestaurant(prev => prev ? { ...prev, logo_url: url } : prev)
      toast.success('Logo updated!')
    }
    setLogoUploading(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !restaurant) return
    setCoverUploading(true)
    const url = await uploadImage(file, 'covers')
    if (url) {
      await supabase.from('restaurants').update({ cover_url: url }).eq('id', restaurant.id)
      setRestaurant(prev => prev ? { ...prev, cover_url: url } : prev)
      toast.success('Cover photo updated!')
    }
    setCoverUploading(false)
  }

  const onSubmit = async (data: FormData) => {
    if (!restaurant) return
    setSaving(true)
    const { error } = await supabase.from('restaurants').update({
      name: data.name,
      tagline: data.tagline,
      address: data.address,
      phone: data.phone,
      website: data.website,
      primary_color: data.primary_color,
    }).eq('id', restaurant.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Profile saved! ✅')
      setRestaurant(prev => prev ? { ...prev, ...data } : prev)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (dbError === 'tables_missing') {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-xl shadow-red-50">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Database Setup Required ⚠️</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            The application database tables do not exist in your Supabase project. To configure your database, please open the 
            <a 
              href="https://supabase.com/dashboard/project/zzxksexzlsoalzcvfjes/sql/new" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 font-bold hover:underline mx-1"
            >
              Supabase SQL Editor
            </a> 
            and run the code inside <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono text-xs">supabase-setup.sql</code>.
          </p>
          <div className="bg-white rounded-2xl border border-red-100 p-5 text-left text-xs text-gray-500 space-y-2">
            <div className="font-bold text-gray-700 uppercase tracking-wider mb-1">Steps:</div>
            <p>1. Open your Supabase project dashboard.</p>
            <p>2. Go to the <strong>SQL Editor</strong> in the left sidebar.</p>
            <p>3. Copy the entire contents of the <code>supabase-setup.sql</code> file in this codebase.</p>
            <p>4. Paste and click <strong>Run</strong>.</p>
            <p>5. Once successful, refresh this page to get started!</p>
          </div>
          <button
            onClick={() => { setLoading(true); loadRestaurant(); }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm hover:scale-105 transition-transform"
          >
            Check Again / Refresh
          </button>
        </div>
      </div>
    )
  }

  if (dbError === 'restaurant_missing' || !restaurant) {
    return (
      <div className="p-6 lg:p-10 max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Create Restaurant Profile</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Enter your restaurant's name to initialize your digital QR code menu builder.
          </p>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Restaurant Name</label>
              <input
                id="init-restaurant-name"
                type="text"
                value={initName}
                onChange={e => setInitName(e.target.value)}
                placeholder="e.g. Gourmet Bistro"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800"
              />
            </div>
            <button
              onClick={createInitialRestaurant}
              disabled={creatingRest || !initName.trim()}
              className="bg-slate-900 hover:bg-slate-800 w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
            >
              {creatingRest ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Initialize Builder ✨</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto fade-in-up">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Restaurant Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">This info appears on your public menu page.</p>
        </div>
        {restaurant && (
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-3.5 py-2 rounded-2xl self-start sm:self-center">
            Slug: {restaurant.slug}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Cover Photo */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-44 shadow-inner group">
          {restaurant?.cover_url ? (
            <img src={restaurant.cover_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Camera size={32} className="mx-auto mb-2 text-slate-400" />
                <span className="text-sm font-semibold">No cover photo selected</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white backdrop-blur text-gray-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 active:scale-95 shadow transition-all"
          >
            {coverUploading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload size={14} className="text-slate-600" />
            )}
            <span>Change Cover</span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        {/* Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100/80">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center relative group">
              {restaurant?.logo_url ? (
                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={36} className="text-slate-300" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 hover:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md text-white hover:scale-105 active:scale-95 transition-all"
            >
              {logoUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={16} />
              )}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="font-extrabold text-gray-950 text-xl tracking-tight">{restaurant?.name || "Initialize Restaurant"}</h2>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="font-bold text-slate-600">Menu URL:</span>
              <a href={`/menu/${restaurant?.slug}`} target="_blank" className="underline hover:text-indigo-600 font-medium text-indigo-600">
                /menu/{restaurant?.slug}
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Restaurant Name *</label>
              <input
                {...register('name')}
                id="profile-name"
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
                placeholder="Spice Garden"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Tagline</label>
              <input
                {...register('tagline')}
                id="profile-tagline"
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
                placeholder="Authentic Indian cuisine since 2010"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Phone</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400"><Phone size={16} /></span>
                <input
                  {...register('phone')}
                  id="profile-phone"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Website</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400"><Globe size={16} /></span>
                <input
                  {...register('website')}
                  id="profile-website"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
                  placeholder="https://yourrestaurant.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Address</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400"><MapPin size={16} /></span>
              <input
                {...register('address')}
                id="profile-address"
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
                placeholder="123 Food Street, Mumbai, India"
              />
            </div>
          </div>

          {/* Brand Color */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-600 mb-3">Brand Color</label>
            <div className="flex items-center gap-3.5 flex-wrap">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('primary_color', color)}
                  className="w-10 h-10 rounded-2xl shadow-md transition-all hover:scale-110 active:scale-95 duration-200"
                  style={{
                    backgroundColor: color,
                    border: primaryColor === color ? '3px solid #ffffff' : 'none',
                    boxShadow: primaryColor === color ? `0 0 0 2px ${color}` : 'none',
                  }}
                />
              ))}
              <div className="relative w-10 h-10 rounded-2xl border-2 border-gray-200 p-0.5 flex items-center justify-center bg-white shadow-md overflow-hidden hover:scale-105 active:scale-95 transition-all">
                <input
                  type="color"
                  id="custom-color"
                  value={primaryColor}
                  onChange={e => setValue('primary_color', e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  title="Custom color"
                />
                <Palette size={16} className="text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2.5 text-sm text-gray-500">
              <span className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Preview:</span>
              <span
                className="px-4 py-1.5 rounded-2xl text-white font-bold text-xs shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Your Menu Accent
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm transition-all hover:scale-[1.02]"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Profile Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

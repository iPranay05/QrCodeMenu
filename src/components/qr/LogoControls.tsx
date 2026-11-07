'use client'

import { useRef, useState } from 'react'
import type { QrDesign } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Image as ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react'

interface Props {
  design: QrDesign
  defaultLogoUrl: string | null
  onChange: (updates: Partial<QrDesign>) => void
}

const PRESET_ICONS = [
  { id: 'fork-knife', name: 'Cutlery', path: '/qr-icons/fork-knife.svg' },
  { id: 'coffee', name: 'Coffee', path: '/qr-icons/coffee.svg' },
  { id: 'pizza', name: 'Pizza', path: '/qr-icons/pizza.svg' },
  { id: 'burger', name: 'Burger', path: '/qr-icons/burger.svg' },
  { id: 'chef-hat', name: 'Chef Hat', path: '/qr-icons/chef-hat.svg' },
]

export function LogoControls({ design, defaultLogoUrl, onChange }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 1 MB)
    if (file.size > 1024 * 1024) {
      toast.error('Logo file size must be under 1 MB')
      return
    }

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, or SVG images are supported')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const filename = `qr-logo-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('logos').upload(filename, file, {
        upsert: true,
      })

      if (error) {
        toast.error('Upload failed: ' + error.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filename)
      onChange({ logoUrl: publicUrl })
      toast.success('Custom QR logo uploaded! 🎨')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Logo Status & Actions */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} className="text-indigo-600" />
          <span>Center Logo / Icon</span>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
            {design.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={design.logoUrl}
                alt="QR Center Logo"
                className="w-full h-full object-contain p-1"
                onError={() => {
                  toast.error('Could not load logo image (CORS or network error). Reverting.')
                  onChange({ logoUrl: null })
                }}
              />
            ) : (
              <span className="text-[10px] font-bold text-slate-400 text-center px-1">
                No Logo
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              {defaultLogoUrl && design.logoUrl !== defaultLogoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ logoUrl: defaultLogoUrl })}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Use Restaurant Logo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload Image</span>
                  </>
                )}
              </button>

              {design.logoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ logoUrl: null })}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Remove Logo"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              PNG, JPG, or SVG up to 1 MB. Clean square transparent PNGs look best.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Icons */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-600 block">
          Or Choose a Food &amp; Drink Preset:
        </label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_ICONS.map(icon => (
            <button
              key={icon.id}
              type="button"
              onClick={() => onChange({ logoUrl: icon.path })}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                design.logoUrl === icon.path
                  ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.path} alt={icon.name} className="w-5 h-5 object-contain" />
              <span className="text-[10px] font-bold text-slate-700">{icon.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Sizing & Margins */}
      {design.logoUrl && (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-600">Logo Scale</label>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {Math.round(design.logoSize * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.4}
              step={0.02}
              value={design.logoSize}
              onChange={e => onChange({ logoSize: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Keep under 35% to guarantee fast scanning on older phone cameras.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-600">Logo Margin (Padding)</label>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {design.logoMargin}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={2}
              value={design.logoMargin}
              onChange={e => onChange({ logoMargin: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={design.hideBackgroundDots}
              onChange={e => onChange({ hideBackgroundDots: e.target.checked })}
              className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
            />
            <span>Clear dots behind logo for maximum contrast</span>
          </label>
        </div>
      )}
    </div>
  )
}


'use client'

import { useState } from 'react'
import type { Restaurant, QrDesign } from '@/lib/types'
import { DEFAULT_QR_DESIGN } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { PresetPicker } from './PresetPicker'
import { ColorControls } from './ColorControls'
import { ShapeControls } from './ShapeControls'
import { LogoControls } from './LogoControls'
import { FrameControls } from './FrameControls'
import { QrPreview } from './QrPreview'
import { ExportMenu } from './ExportMenu'
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  Layout,
  Save,
  RotateCcw,
  Sparkles,
  Share2,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react'

interface Props {
  restaurant: Restaurant
  onRestaurantUpdated?: (updated: Restaurant) => void
}

type TabType = 'presets' | 'colors' | 'shapes' | 'logo' | 'frame'

export function QrDesigner({ restaurant, onRestaurantUpdated }: Props) {
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const menuUrl = `${origin}/menu/${restaurant.slug}`

  // Initial design from saved restaurant or default
  const [design, setDesign] = useState<QrDesign>(() => {
    return restaurant.qr_design ? { ...DEFAULT_QR_DESIGN, ...restaurant.qr_design } : DEFAULT_QR_DESIGN
  })

  const [activeTab, setActiveTab] = useState<TabType>('presets')
  const [saving, setSaving] = useState(false)

  const updateDesign = (updates: Partial<QrDesign>) => {
    setDesign(prev => ({ ...prev, ...updates }))
  }

  // Save design to Supabase
  const handleSaveDesign = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ qr_design: design })
        .eq('id', restaurant.id)

      if (error) throw error

      toast.success('QR Code design saved! 💾')
      onRestaurantUpdated?.({ ...restaurant, qr_design: design })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save design'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // Reset to default
  const handleReset = () => {
    if (confirm('Reset QR design to default settings?')) {
      setDesign(DEFAULT_QR_DESIGN)
      toast('Reset to default design', { icon: '🔄' })
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
    toast.success('Menu URL copied! 📋')
  }

  const shareUrl = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${restaurant.name} Menu`, url: menuUrl })
    } else {
      copyUrl()
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Sticky Live Preview & Download Panel */}
      <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_24px_64px_rgba(15,23,42,0.04)] p-6 sm:p-8 flex flex-col items-center">
          {/* Restaurant identity header */}
          <div
            className="w-full rounded-2xl py-4 px-4 mb-6 text-white text-center shadow-md relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${restaurant.primary_color || '#6366f1'}, ${
                restaurant.primary_color || '#6366f1'
              }dd)`,
            }}
          >
            {restaurant.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logo_url}
                alt="logo"
                className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-white/30"
              />
            )}
            <div className="font-extrabold text-lg">{restaurant.name}</div>
            {restaurant.tagline && (
              <div className="text-white/80 text-xs mt-0.5 font-medium">{restaurant.tagline}</div>
            )}
          </div>

          {/* Live QR Preview */}
          <QrPreview design={design} menuUrl={menuUrl} />

          {/* Download & Export Section */}
          <div className="w-full mt-6 pt-6 border-t border-slate-100">
            <ExportMenu
              design={design}
              restaurantSlug={restaurant.slug}
              restaurantName={restaurant.name}
              menuUrl={menuUrl}
            />
          </div>

          {/* Share & Link shortcuts */}
          <div className="w-full flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={shareUrl}
              className="flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share Link</span>
            </button>
            <button
              type="button"
              onClick={copyUrl}
              className="flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>Copy URL</span>
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Open Public Menu"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Customization Tabs & Control Panels */}
      <div className="lg:col-span-7 space-y-6">
        {/* Top Control Bar with Save & Reset */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Designer Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveDesign}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : 'Save Design'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-sm flex flex-wrap gap-1.5">
          {[
            { id: 'presets', label: 'Presets', icon: Sparkles },
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'shapes', label: 'Shapes', icon: Shapes },
            { id: 'logo', label: 'Logo', icon: ImageIcon },
            { id: 'frame', label: 'Frame', icon: Layout },
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 min-w-[70px] py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_32px_rgba(15,23,42,0.02)] min-h-[420px]">
          {activeTab === 'presets' && (
            <PresetPicker
              brandColor={restaurant.primary_color}
              onApplyPreset={preset => {
                updateDesign(preset)
                toast.success('Preset applied! Customize colors or shapes anytime.')
              }}
            />
          )}

          {activeTab === 'colors' && (
            <ColorControls
              design={design}
              brandColor={restaurant.primary_color}
              onChange={updateDesign}
            />
          )}

          {activeTab === 'shapes' && (
            <ShapeControls design={design} onChange={updateDesign} />
          )}

          {activeTab === 'logo' && (
            <LogoControls
              design={design}
              defaultLogoUrl={restaurant.logo_url}
              onChange={updateDesign}
            />
          )}

          {activeTab === 'frame' && (
            <FrameControls design={design} onChange={updateDesign} />
          )}
        </div>
      </div>
    </div>
  )
}


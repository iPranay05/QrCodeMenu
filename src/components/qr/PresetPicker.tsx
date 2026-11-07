'use client'

import type { QrDesign } from '@/lib/types'
import { Sparkles } from 'lucide-react'

export interface PresetItem {
  id: string
  name: string
  description: string
  previewColors: [string, string]
  design: Partial<QrDesign>
}

interface Props {
  brandColor: string
  onApplyPreset: (presetDesign: Partial<QrDesign>) => void
}

export function PresetPicker({ brandColor, onApplyPreset }: Props) {
  const PRESETS: PresetItem[] = [
    {
      id: 'classic',
      name: 'Classic Black',
      description: 'Standard, universally compatible high-contrast style',
      previewColors: ['#0f172a', '#ffffff'],
      design: {
        foregroundColorType: 'solid',
        foregroundColor: '#0f172a',
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: false,
        dotType: 'square',
        eyeFrameType: 'square',
        eyeBallType: 'square',
        frameStyle: 'none',
      },
    },
    {
      id: 'brand',
      name: 'Brand Focused',
      description: 'Matches your restaurant brand accent colors with smooth rounded edges',
      previewColors: [brandColor || '#6366f1', '#ffffff'],
      design: {
        foregroundColorType: 'solid',
        foregroundColor: brandColor || '#6366f1',
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: true,
        customEyeColor: true,
        eyeFrameColor: brandColor || '#6366f1',
        eyeBallColor: '#0f172a',
        dotType: 'rounded',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'bottom-label',
        frameColor: brandColor || '#6366f1',
        frameText: 'SCAN FOR MENU',
        frameTextColor: '#ffffff',
      },
    },
    {
      id: 'sunset',
      name: 'Sunset Gradient',
      description: 'Vibrant modern gradient from coral orange to royal purple',
      previewColors: ['#f97316', '#7c3aed'],
      design: {
        foregroundColorType: 'gradient',
        foregroundColor: '#f97316',
        gradientColor2: '#7c3aed',
        gradientType: 'linear',
        gradientRotation: 45,
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: true,
        eyeFrameColor: '#7c3aed',
        eyeBallColor: '#f97316',
        dotType: 'classy-rounded',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'bottom-label',
        frameColor: '#7c3aed',
        frameText: 'VIEW OUR MENU',
        frameTextColor: '#ffffff',
      },
    },
    {
      id: 'gold',
      name: 'Fine Dining Gold',
      description: 'Sophisticated warm golden dots with dark luxurious framing',
      previewColors: ['#b45309', '#1e293b'],
      design: {
        foregroundColorType: 'gradient',
        foregroundColor: '#d97706',
        gradientColor2: '#78350f',
        gradientType: 'linear',
        gradientRotation: 90,
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: true,
        eyeFrameColor: '#78350f',
        eyeBallColor: '#b45309',
        dotType: 'classy',
        eyeFrameType: 'square',
        eyeBallType: 'dot',
        frameStyle: 'table-tent',
        frameColor: '#78350f',
        frameText: 'RESTAURANT MENU',
        frameTextColor: '#fef3c7',
      },
    },
    {
      id: 'fresh-green',
      name: 'Fresh Garden',
      description: 'Earthy natural greens ideal for vegetarian, salads and organic cafes',
      previewColors: ['#059669', '#10b981'],
      design: {
        foregroundColorType: 'solid',
        foregroundColor: '#047857',
        backgroundColor: '#f0fdf4',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: true,
        eyeFrameColor: '#065f46',
        eyeBallColor: '#10b981',
        dotType: 'dots',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'bottom-label',
        frameColor: '#065f46',
        frameText: 'FRESH MENU',
        frameTextColor: '#ffffff',
      },
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Cyan to deep marine blue gradient with smooth bubble dots',
      previewColors: ['#06b6d4', '#1e40af'],
      design: {
        foregroundColorType: 'gradient',
        foregroundColor: '#0284c7',
        gradientColor2: '#1e40af',
        gradientType: 'linear',
        gradientRotation: 60,
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: true,
        eyeFrameColor: '#1e40af',
        eyeBallColor: '#0284c7',
        dotType: 'extra-rounded',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'bottom-label',
        frameColor: '#1e40af',
        frameText: 'SCAN & ORDER',
        frameTextColor: '#ffffff',
      },
    },
    {
      id: 'table-tent',
      name: 'Table Stand Classic',
      description: 'Optimized stand layout ready for table acrylic display blocks',
      previewColors: ['#0f172a', '#475569'],
      design: {
        foregroundColorType: 'solid',
        foregroundColor: '#0f172a',
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: false,
        dotType: 'rounded',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'table-tent',
        frameColor: '#0f172a',
        frameText: 'TABLE SERVICE',
        frameTextColor: '#ffffff',
      },
    },
    {
      id: 'neon-dark',
      name: 'Neon Dark (Bar/Club)',
      description: 'Luminous cyan highlights with dark frame (use with caution: scan check active)',
      previewColors: ['#06b6d4', '#0f172a'],
      design: {
        foregroundColorType: 'solid',
        foregroundColor: '#0f172a',
        backgroundColor: '#ffffff',
        isTransparentBg: false,
        useBrandColor: false,
        customEyeColor: true,
        eyeFrameColor: '#06b6d4',
        eyeBallColor: '#0891b2',
        dotType: 'dots',
        eyeFrameType: 'extra-rounded',
        eyeBallType: 'dot',
        frameStyle: 'bottom-label',
        frameColor: '#0f172a',
        frameText: 'BAR & DRINKS',
        frameTextColor: '#38bdf8',
      },
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <Sparkles size={14} className="text-indigo-600" />
        <span>One-Click Design Templates</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset.design)}
            className="group relative flex flex-col items-start p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: preset.previewColors[0] }}
              />
              <span
                className="w-4 h-4 rounded-full border border-black/10 shrink-0 -ml-2"
                style={{ backgroundColor: preset.previewColors[1] }}
              />
            </div>
            <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
              {preset.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}


'use client'

import type { QrDesign, QrFrameStyle } from '@/lib/types'
import { ColorInput } from './ColorInput'
import { Layout } from 'lucide-react'

interface Props {
  design: QrDesign
  onChange: (updates: Partial<QrDesign>) => void
}

export function FrameControls({ design, onChange }: Props) {
  const FRAME_STYLES: { id: QrFrameStyle; label: string; desc: string }[] = [
    { id: 'none', label: 'None', desc: 'Raw QR code with no decorative border' },
    { id: 'bottom-label', label: 'Badge Bottom', desc: 'Rounded container with bottom CTA badge' },
    { id: 'top-label', label: 'Badge Top', desc: 'Rounded container with top header badge' },
    { id: 'table-tent', label: 'Table Tent', desc: 'Dual-banner tent card ready for acrylic stands' },
    { id: 'simple', label: 'Solid Border', desc: 'Simple solid colored outer frame' },
  ]

  const PRESET_TEXTS = [
    'SCAN TO VIEW OUR MENU',
    'SCAN ME',
    'SCAN FOR DIGITAL MENU',
    'ORDER AT TABLE',
    'TOUCHLESS MENU',
  ]

  return (
    <div className="space-y-6">
      {/* Frame Style Selector */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Layout size={14} className="text-indigo-600" />
          <span>Frame / Printable Stand Layout</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FRAME_STYLES.map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange({ frameStyle: style.id })}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                design.frameStyle === style.id
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-extrabold text-slate-800">{style.label}</span>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Text & Colors (if a frame is active) */}
      {design.frameStyle !== 'none' && (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">
              Call-To-Action Text
            </label>
            <input
              type="text"
              value={design.frameText}
              maxLength={36}
              onChange={e => onChange({ frameText: e.target.value.toUpperCase() })}
              placeholder="SCAN ME"
              className="w-full text-xs font-bold tracking-wide uppercase px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_TEXTS.map(txt => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => onChange({ frameText: txt })}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <ColorInput
              label="Frame Background"
              color={design.frameColor}
              onChange={hex => onChange({ frameColor: hex })}
            />
            <ColorInput
              label="CTA Text Color"
              color={design.frameTextColor}
              onChange={hex => onChange({ frameTextColor: hex })}
            />
          </div>
        </div>
      )}
    </div>
  )
}


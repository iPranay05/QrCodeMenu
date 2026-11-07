'use client'

import type { QrDesign } from '@/lib/types'
import { ColorInput } from './ColorInput'
import { Palette } from 'lucide-react'

interface Props {
  design: QrDesign
  brandColor: string
  onChange: (updates: Partial<QrDesign>) => void
}

export function ColorControls({ design, brandColor, onChange }: Props) {
  const handleBrandToggle = () => {
    const nextVal = !design.useBrandColor
    if (nextVal) {
      onChange({
        useBrandColor: true,
        foregroundColorType: 'solid',
        foregroundColor: brandColor || '#6366f1',
      })
    } else {
      onChange({ useBrandColor: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand Color Shortcut */}
      <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-lg border border-black/10 shrink-0 shadow-sm"
            style={{ backgroundColor: brandColor || '#6366f1' }}
          />
          <div>
            <div className="text-xs font-bold text-slate-800">Use Restaurant Brand Color</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Synchronize QR foreground with {brandColor || '#6366f1'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleBrandToggle}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            design.useBrandColor ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
        </button>
      </div>

      {/* Foreground Color Mode */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={14} className="text-indigo-600" />
          <span>Foreground Color / Style</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ foregroundColorType: 'solid', useBrandColor: false })}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              design.foregroundColorType === 'solid'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Solid Color
          </button>
          <button
            type="button"
            onClick={() => onChange({ foregroundColorType: 'gradient', useBrandColor: false })}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              design.foregroundColorType === 'gradient'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Gradient Effect
          </button>
        </div>

        {design.foregroundColorType === 'solid' ? (
          <div className="pt-2">
            <ColorInput
              label="Foreground Color"
              color={design.foregroundColor}
              onChange={hex => onChange({ foregroundColor: hex, useBrandColor: false })}
            />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Gradient Start"
                color={design.foregroundColor}
                onChange={hex => onChange({ foregroundColor: hex, useBrandColor: false })}
              />
              <ColorInput
                label="Gradient End"
                color={design.gradientColor2}
                onChange={hex => onChange({ gradientColor2: hex })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Gradient Type</label>
                <select
                  value={design.gradientType}
                  onChange={e => onChange({ gradientType: e.target.value as 'linear' | 'radial' })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-600">Angle</label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {design.gradientRotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={design.gradientRotation}
                  onChange={e => onChange({ gradientRotation: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Background</div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={design.isTransparentBg}
              onChange={e => onChange({ isTransparentBg: e.target.checked })}
              className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
            />
            <span>Transparent Background</span>
          </label>
        </div>

        {!design.isTransparentBg && (
          <div className="pt-2">
            <ColorInput
              label="Background Color"
              color={design.backgroundColor}
              onChange={hex => onChange({ backgroundColor: hex })}
            />
          </div>
        )}
      </div>

      {/* Eye Colors */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Custom Eye / Corner Colors
          </div>
          <button
            type="button"
            onClick={() => onChange({ customEyeColor: !design.customEyeColor })}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              design.customEyeColor ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
        </div>

        {design.customEyeColor && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <ColorInput
              label="Eye Frame (Outer)"
              color={design.eyeFrameColor}
              onChange={hex => onChange({ eyeFrameColor: hex })}
            />
            <ColorInput
              label="Eye Ball (Inner)"
              color={design.eyeBallColor}
              onChange={hex => onChange({ eyeBallColor: hex })}
            />
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import type { QrDesign, QrDotType, QrEyeFrameType, QrEyeBallType } from '@/lib/types'
import { Shapes } from 'lucide-react'

interface Props {
  design: QrDesign
  onChange: (updates: Partial<QrDesign>) => void
}

export function ShapeControls({ design, onChange }: Props) {
  const DOT_TYPES: { id: QrDotType; label: string; preview: string }[] = [
    { id: 'square', label: 'Square', preview: '■■' },
    { id: 'rounded', label: 'Rounded', preview: '▢▢' },
    { id: 'dots', label: 'Dots', preview: '●●' },
    { id: 'classy', label: 'Classy', preview: '◆◆' },
    { id: 'classy-rounded', label: 'Classy Round', preview: '✦✦' },
    { id: 'extra-rounded', label: 'Smooth Bubble', preview: '◉◉' },
  ]

  const EYE_FRAMES: { id: QrEyeFrameType; label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'extra-rounded', label: 'Rounded' },
    { id: 'dot', label: 'Circle' },
  ]

  const EYE_BALLS: { id: QrEyeBallType; label: string }[] = [
    { id: 'square', label: 'Square' },
    { id: 'dot', label: 'Circle' },
  ]

  return (
    <div className="space-y-6">
      {/* Dot / Body Pattern */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Shapes size={14} className="text-indigo-600" />
          <span>Body Dot Pattern</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DOT_TYPES.map(dot => (
            <button
              key={dot.id}
              type="button"
              onClick={() => onChange({ dotType: dot.id })}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                design.dotType === dot.id
                  ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg leading-none">{dot.preview}</span>
              <span className="text-[11px] font-bold mt-1">{dot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eye Corner Styles */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Corner Eyes (Alignment Markers)
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Eye Frame Shape (Outer Box)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EYE_FRAMES.map(frame => (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => onChange({ eyeFrameType: frame.id })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    design.eyeFrameType === frame.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {frame.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Eye Ball Shape (Inner Pupil)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EYE_BALLS.map(ball => (
                <button
                  key={ball.id}
                  type="button"
                  onClick={() => onChange({ eyeBallType: ball.id })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    design.eyeBallType === ball.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ball.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiet Zone & Error Correction */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Margin & Error Tolerance
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-600">Quiet Zone (Margin)</label>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {design.quietZone}px
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={36}
            step={2}
            value={design.quietZone}
            onChange={e => onChange({ quietZone: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Standard quiet zone guarantees high detection speed in low light.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">
            Error Correction Level
          </label>
          <select
            value={design.logoUrl ? 'H' : design.errorCorrectionLevel}
            disabled={Boolean(design.logoUrl)}
            onChange={e =>
              onChange({
                errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H',
              })
            }
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-60 disabled:bg-slate-50"
          >
            <option value="L">L — 7% recovery (Smallest dots)</option>
            <option value="M">M — 15% recovery (Standard)</option>
            <option value="Q">Q — 25% recovery (High damage resistance)</option>
            <option value="H">H — 30% recovery (Recommended / Logo mode)</option>
          </select>
          {design.logoUrl && (
            <p className="text-[10px] text-indigo-600 font-semibold mt-1">
              * Locked to Level &apos;H&apos; because a central logo is active.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


'use client'

import type { QrDesign, QrDotType, QrEyeFrameType, QrEyeBallType } from '@/lib/types'
import { Shapes, Disc, Square } from 'lucide-react'

interface Props {
  design: QrDesign
  onChange: (updates: Partial<QrDesign>) => void
}

export function ShapeControls({ design, onChange }: Props) {
  // Body dot patterns previewed with actual 3x3 QR module clusters matching qr-code-styling's exact SVG geometry
  const DOT_TYPES: { id: QrDotType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'square',
      label: 'Square',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* 3x3 connected square modules */}
          <rect x="2" y="2" width="7" height="7" />
          <rect x="10.5" y="2" width="7" height="7" />
          <rect x="19" y="2" width="7" height="7" />
          <rect x="2" y="10.5" width="7" height="7" />
          <rect x="10.5" y="10.5" width="7" height="7" />
          <rect x="19" y="19" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'dots',
      label: 'Dots',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Individual circle dots */}
          <circle cx="5.5" cy="5.5" r="3.5" />
          <circle cx="14" cy="5.5" r="3.5" />
          <circle cx="22.5" cy="5.5" r="3.5" />
          <circle cx="5.5" cy="14" r="3.5" />
          <circle cx="14" cy="14" r="3.5" />
          <circle cx="22.5" cy="22.5" r="3.5" />
        </svg>
      ),
    },
    {
      id: 'rounded',
      label: 'Rounded',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Rounded connected block + endcap */}
          <rect x="2" y="2" width="15.5" height="7" rx="3.5" />
          <circle cx="22.5" cy="5.5" r="3.5" />
          <rect x="2" y="10.5" width="7" height="7" rx="3.5" />
          <circle cx="14" cy="14" r="3.5" />
          <circle cx="22.5" cy="22.5" r="3.5" />
        </svg>
      ),
    },
    {
      id: 'extra-rounded',
      label: 'Extra Rounded',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Connected bubble blobs with pill shapes */}
          <rect x="2" y="2" width="15.5" height="7" rx="3.5" />
          <rect x="2" y="2" width="7" height="15.5" rx="3.5" />
          <circle cx="22.5" cy="5.5" r="3.5" />
          <circle cx="22.5" cy="22.5" r="3.5" />
        </svg>
      ),
    },
    {
      id: 'classy',
      label: 'Classy',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Elegant diagonal teardrop / classy corner geometry */}
          <path d="M 2 2 v 3.5 a 3.5 3.5 0 0 0 3.5 3.5 h 3.5 v -3.5 a 3.5 3.5 0 0 0 -3.5 -3.5 Z" />
          <path d="M 10.5 2 v 3.5 a 3.5 3.5 0 0 0 3.5 3.5 h 3.5 v -3.5 a 3.5 3.5 0 0 0 -3.5 -3.5 Z" />
          <path d="M 19 2 v 3.5 a 3.5 3.5 0 0 0 3.5 3.5 h 3.5 v -3.5 a 3.5 3.5 0 0 0 -3.5 -3.5 Z" />
          <path d="M 2 10.5 v 3.5 a 3.5 3.5 0 0 0 3.5 3.5 h 3.5 v -3.5 a 3.5 3.5 0 0 0 -3.5 -3.5 Z" />
          <path d="M 19 19 v 3.5 a 3.5 3.5 0 0 0 3.5 3.5 h 3.5 v -3.5 a 3.5 3.5 0 0 0 -3.5 -3.5 Z" />
        </svg>
      ),
    },
    {
      id: 'classy-rounded',
      label: 'Classy Round',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Smooth leaf curves */}
          <path d="M 2 2 v 7 h 7 a 7 7 0 0 0 -7 -7 Z" />
          <path d="M 10.5 2 v 7 h 7 a 7 7 0 0 0 -7 -7 Z" />
          <path d="M 19 2 v 7 h 7 a 7 7 0 0 0 -7 -7 Z" />
          <path d="M 2 10.5 v 7 h 7 a 7 7 0 0 0 -7 -7 Z" />
          <path d="M 19 19 v 7 h 7 a 7 7 0 0 0 -7 -7 Z" />
        </svg>
      ),
    },
  ]

  // Outer Eye Frames - exactly rendering the 7x7 outer marker shapes supported by the renderer
  const EYE_FRAMES: { id: QrEyeFrameType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'square',
      label: 'Square',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current" fillRule="evenodd">
          {/* Solid 7x7 box with hollow 5x5 center (thick square border) */}
          <path d="M 2 2 h 24 v 24 h -24 Z M 6 6 v 16 h 16 v -16 Z" />
        </svg>
      ),
    },
    {
      id: 'extra-rounded',
      label: 'Rounded',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current" fillRule="evenodd">
          {/* Continuous smooth curved outer border matching qr-code-styling _basicExtraRounded */}
          <path d="M 2 9.5 v 9 a 7.5 7.5 0 0 0 7.5 7.5 h 9 a 7.5 7.5 0 0 0 7.5 -7.5 v -9 a 7.5 7.5 0 0 0 -7.5 -7.5 h -9 a 7.5 7.5 0 0 0 -7.5 7.5 Z M 9.5 6 h 9 a 3.5 3.5 0 0 1 3.5 3.5 v 9 a 3.5 3.5 0 0 1 -3.5 3.5 h -9 a 3.5 3.5 0 0 1 -3.5 -3.5 v -9 a 3.5 3.5 0 0 1 3.5 -3.5 Z" />
        </svg>
      ),
    },
    {
      id: 'dot',
      label: 'Circle',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current" fillRule="evenodd">
          {/* Donut ring matching qr-code-styling _basicDot frame */}
          <path d="M 14 2 a 12 12 0 1 0 0.01 0 Z M 14 6 a 8 8 0 1 1 -0.01 0 Z" />
        </svg>
      ),
    },
    {
      id: 'classy-rounded',
      label: 'Leaf',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Leaf eye with two opposite sharp and two rounded corners */}
          <path d="M 2 2 h 14 a 12 12 0 0 1 12 12 v 12 h -14 a 12 12 0 0 1 -12 -12 Z" fill="none" stroke="currentColor" strokeWidth="3.8" />
        </svg>
      ),
    },
    {
      id: 'dots',
      label: 'Dotted',
      icon: (
        <svg viewBox="0 0 28 28" className="w-7 h-7 fill-current">
          {/* Dotted border with individual circular modules */}
          <circle cx="4" cy="4" r="2.2" />
          <circle cx="10.6" cy="4" r="2.2" />
          <circle cx="17.3" cy="4" r="2.2" />
          <circle cx="24" cy="4" r="2.2" />
          <circle cx="24" cy="10.6" r="2.2" />
          <circle cx="24" cy="17.3" r="2.2" />
          <circle cx="24" cy="24" r="2.2" />
          <circle cx="17.3" cy="24" r="2.2" />
          <circle cx="10.6" cy="24" r="2.2" />
          <circle cx="4" cy="24" r="2.2" />
          <circle cx="4" cy="17.3" r="2.2" />
          <circle cx="4" cy="10.6" r="2.2" />
        </svg>
      ),
    },
  ]

  // Inner Eye Pupils - exactly matching the 3x3 center pupil rendering in qr-code-styling
  const EYE_BALLS: { id: QrEyeBallType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'square',
      label: 'Square',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* Solid 3x3 square pupil */}
          <rect x="4" y="4" width="16" height="16" />
        </svg>
      ),
    },
    {
      id: 'dot',
      label: 'Circle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* Solid circular center pupil */}
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
    },
    {
      id: 'rounded',
      label: 'Rounded',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* Soft rounded pupil */}
          <rect x="4" y="4" width="16" height="16" rx="4.5" />
        </svg>
      ),
    },
    {
      id: 'classy-rounded',
      label: 'Leaf',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* Leaf / teardrop pupil with opposite curves */}
          <path d="M 4 4 h 8 a 8 8 0 0 1 8 8 v 8 h -8 a 8 8 0 0 1 -8 -8 Z" />
        </svg>
      ),
    },
    {
      id: 'dots',
      label: 'Matrix',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          {/* 3x3 dot matrix cluster pupil */}
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="12" cy="6" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <circle cx="6" cy="12" r="2.2" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="18" cy="12" r="2.2" />
          <circle cx="6" cy="18" r="2.2" />
          <circle cx="12" cy="18" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
        </svg>
      ),
    },
  ]

  const currentShape = design.shape || 'square'

  return (
    <div className="space-y-6">
      {/* Overall Matrix Shape */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Shapes size={14} className="text-indigo-600" />
          <span>Overall Matrix Shape</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChange({ shape: 'square' })}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              currentShape === 'square'
                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Square size={18} className={currentShape === 'square' ? 'text-indigo-600' : 'text-slate-500'} />
            <span className="text-xs font-bold">Square Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ shape: 'circle' })}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              currentShape === 'circle'
                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Disc size={18} className={currentShape === 'circle' ? 'text-indigo-600' : 'text-slate-500'} />
            <span className="text-xs font-bold">Circular Matrix</span>
          </button>
        </div>
      </div>

      {/* Body Dot Shape */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Body Shape
          </div>
          <span className="text-[11px] font-semibold text-slate-400 capitalize">
            {design.dotType.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DOT_TYPES.map(dot => {
            const isSelected = design.dotType === dot.id
            return (
              <button
                key={dot.id}
                type="button"
                title={dot.label}
                onClick={() => onChange({ dotType: dot.id })}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center">{dot.icon}</div>
                <span className="text-[10px] font-bold truncate max-w-full">{dot.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Corner Eye Frames (Outer Marker) */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Eye Frame Shape (Outer Marker)
          </div>
          <span className="text-[11px] font-semibold text-slate-400 capitalize">
            {design.eyeFrameType.replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {EYE_FRAMES.map(frame => {
            const isSelected = design.eyeFrameType === frame.id
            return (
              <button
                key={frame.id}
                type="button"
                title={frame.label}
                onClick={() => onChange({ eyeFrameType: frame.id })}
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center">{frame.icon}</div>
                <span className="text-[9px] font-bold truncate max-w-full">{frame.label}</span>
              </button>
            )
          })}
        </div>

        {/* Corner Eye Balls (Inner Pupil) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Eye Ball Shape (Inner Pupil)
            </div>
            <span className="text-[11px] font-semibold text-slate-400 capitalize">
              {design.eyeBallType.replace('-', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {EYE_BALLS.map(ball => {
              const isSelected = design.eyeBallType === ball.id
              return (
                <button
                  key={ball.id}
                  type="button"
                  title={ball.label}
                  onClick={() => onChange({ eyeBallType: ball.id })}
                  className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">{ball.icon}</div>
                  <span className="text-[9px] font-bold truncate max-w-full">{ball.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Margin & Error Correction */}
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

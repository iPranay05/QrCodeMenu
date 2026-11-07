'use client'

import { useState, useRef, useEffect } from 'react'
import { ChromePicker, ColorResult } from 'react-color'

interface Props {
  label: string
  color: string
  onChange: (hex: string) => void
  disabled?: boolean
}

export function ColorInput({ label, color, onChange, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm cursor-pointer shrink-0 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: color || '#ffffff' }}
          title={`Pick color (${color})`}
        />
        <input
          type="text"
          value={color}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="w-28 text-xs font-mono font-semibold px-2.5 py-2 rounded-xl border border-slate-200 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          placeholder="#000000"
        />

        {isOpen && (
          <div ref={popoverRef} className="absolute z-50 top-12 left-0 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
            <ChromePicker
              color={color}
              disableAlpha={true}
              onChange={(c: ColorResult) => onChange(c.hex)}
            />
          </div>
        )}
      </div>
    </div>
  )
}


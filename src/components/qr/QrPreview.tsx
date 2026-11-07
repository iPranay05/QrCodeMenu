'use client'

import { useEffect, useRef } from 'react'
import type { QrDesign } from '@/lib/types'
import { buildQrCodeOptions, checkScanSafety } from './qrRenderer'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Props {
  design: QrDesign
  menuUrl: string
  onRawCanvasReady?: (canvas: HTMLCanvasElement | null) => void
}

export function QrPreview({ design, menuUrl, onRawCanvasReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const safety = checkScanSafety(design)
  const qrCodeInstanceRef = useRef<unknown>(null)

  // Debounced QR generation
  useEffect(() => {
    let isCancelled = false
    const timeout = setTimeout(async () => {
      if (typeof window === 'undefined' || !containerRef.current) return

      try {
        // Dynamic client-only import
        const QRCodeStyling = (await import('qr-code-styling')).default
        const PREVIEW_SIZE = 320

        const options = buildQrCodeOptions(design, menuUrl, PREVIEW_SIZE)
        
        // Create a fresh instance for every render to ensure previous options (like gradients or background colors)
        // are completely reset and never leaked through internal deep merges
        const qr = new QRCodeStyling(options)
        qrCodeInstanceRef.current = qr

        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          await qr.append(containerRef.current)

          const rawCanvas = containerRef.current.querySelector('canvas')
          if (rawCanvas && !isCancelled) {
            onRawCanvasReady?.(rawCanvas)
          }
        }
      } catch (err) {
        console.error('Failed to render QR Code preview:', err)
      }
    }, 150)

    return () => {
      isCancelled = true
      clearTimeout(timeout)
    }
  }, [design, menuUrl, onRawCanvasReady])

  // Frame preview style simulation
  const frameStyle = design.frameStyle

  return (
    <div className="flex flex-col items-center w-full">
      {/* Outer frame styling wrapper matching the exported canvas */}
      <div
        className="transition-all duration-300 rounded-3xl p-4 flex flex-col items-center justify-center max-w-[360px] w-full shadow-lg"
        style={{
          backgroundColor:
            frameStyle === 'table-tent'
              ? '#ffffff'
              : frameStyle !== 'none'
              ? design.frameColor
              : 'transparent',
          border:
            frameStyle === 'simple'
              ? `8px solid ${design.frameColor}`
              : frameStyle === 'table-tent'
              ? '1px solid #e2e8f0'
              : undefined,
        }}
      >
        {/* Top Label for top-label or table-tent */}
        {frameStyle === 'top-label' && (
          <div
            className="w-full text-center py-2 px-3 text-xs font-black tracking-wider uppercase mb-3"
            style={{ color: design.frameTextColor }}
          >
            {design.frameText || 'SCAN ME'}
          </div>
        )}

        {frameStyle === 'table-tent' && (
          <div
            className="w-full rounded-2xl py-2 px-4 text-center text-xs font-black tracking-wider uppercase mb-3 shadow-sm"
            style={{
              backgroundColor: design.frameColor,
              color: design.frameTextColor,
            }}
          >
            {design.frameText || 'TABLE MENU'}
          </div>
        )}

        {/* Inner QR Canvas Container */}
        <div
          className="rounded-2xl overflow-hidden p-2 flex items-center justify-center shadow-inner"
          style={{
            backgroundColor: design.isTransparentBg ? 'transparent' : design.backgroundColor,
          }}
        >
          <div ref={containerRef} className="flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto" />
        </div>

        {/* Bottom Label for bottom-label */}
        {frameStyle === 'bottom-label' && (
          <div
            className="w-full text-center py-2.5 px-3 text-xs font-black tracking-wider uppercase mt-2.5"
            style={{ color: design.frameTextColor }}
          >
            {design.frameText || 'SCAN ME'}
          </div>
        )}

        {frameStyle === 'table-tent' && (
          <div className="text-[11px] font-semibold text-slate-400 mt-2 text-center">
            Point your camera to order
          </div>
        )}
      </div>

      {/* Safety & Contrast Diagnostics */}
      <div className="w-full max-w-[360px] mt-4">
        {safety.warning ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Scanner Warning</span>
              <p className="text-[11px] text-amber-700 mt-0.5">{safety.warning}</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between px-3.5 text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Optimal Contrast for Scanning</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-lg">
              {safety.ratio.toFixed(1)}:1
            </span>
          </div>
        )}
      </div>
    </div>
  )
}


'use client'
import React from 'react'

interface AuroraProps {
  children?: React.ReactNode
  showGrid?: boolean
  className?: string
}

export default function Aurora({ children, showGrid = true, className = '' }: AuroraProps) {
  return (
    <div className={`relative min-h-screen w-full bg-slate-50 ${className}`}>
      {/* Contained background layer: cannot spill or expand document height */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Soft Radial Ambient Lights: GPU friendly, zero scroll lag, zero blur repaints */}
        <div
          className="absolute -top-40 -left-40 size-[550px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0) 70%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-40 size-[600px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(14,165,233,0) 70%)',
          }}
        />
        <div
          className="absolute bottom-10 left-1/4 size-[650px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0) 70%)',
          }}
        />

        {/* Crisp Dot Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}

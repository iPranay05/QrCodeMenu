'use client'
import React from 'react'

interface AuroraProps {
  children?: React.ReactNode
  showGrid?: boolean
  className?: string
}

export default function Aurora({ children, showGrid = true, className = '' }: AuroraProps) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80 ${className}`}>
      {/* Self-contained keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(60px, -80px) scale(1.15); }
          66% { transform: translate(-40px, 50px) scale(0.9); }
        }
        @keyframes float-blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.02); }
          50% { transform: translate(-80px, 60px) scale(1.18); }
        }
        @keyframes float-blob-3 {
          0%, 100% { transform: translate(0px, 0px) scale(0.97); }
          40% { transform: translate(90px, 30px) scale(1.1); }
        }
        .animate-blob-1 {
          animation: float-blob-1 25s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: float-blob-2 30s infinite ease-in-out;
        }
        .animate-blob-3 {
          animation: float-blob-3 20s infinite ease-in-out;
        }
      `}} />

      {/* Blob 1: Soft Indigo */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-100/40 blur-[120px] animate-blob-1 pointer-events-none" />
      
      {/* Blob 2: Soft Sky Blue */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] rounded-full bg-sky-100/30 blur-[130px] animate-blob-2 pointer-events-none" />

      {/* Blob 3: Soft Slate/Lavender */}
      <div className="absolute top-[30%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-slate-100/40 blur-[100px] animate-blob-3 pointer-events-none" />

      {/* Dot Grid overlay */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}

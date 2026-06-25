'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, QrCode } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] rounded-2xl px-6 py-2 transition-all duration-300">
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 duration-300">
            <QrCode className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">MenuQR</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors">How It Works</Link>
          <Link href="/login" className="text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors">Login</Link>
          <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden pb-4 border-t border-slate-100 mt-2 pt-4 space-y-3">
          <Link href="#features" onClick={() => setOpen(false)} className="block text-slate-600 hover:text-indigo-600 font-bold text-sm py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">Features</Link>
          <Link href="#how-it-works" onClick={() => setOpen(false)} className="block text-slate-600 hover:text-indigo-600 font-bold text-sm py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">How It Works</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="block text-slate-600 hover:text-indigo-600 font-bold text-sm py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">Login</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm text-center block shadow-sm mt-2">
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  )
}


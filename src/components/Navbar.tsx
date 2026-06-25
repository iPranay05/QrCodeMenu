'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, QrCode } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">MenuQR</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">How It Works</Link>
            <Link href="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Login</Link>
            <Link href="/register" className="btn-gradient text-white px-5 py-2 rounded-full font-semibold text-sm shadow-lg shadow-orange-200">
              <span>Get Started Free</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-orange-50"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-orange-100 mt-2 pt-4 space-y-3">
            <Link href="#features" className="block text-gray-600 hover:text-orange-500 font-medium py-1">Features</Link>
            <Link href="#how-it-works" className="block text-gray-600 hover:text-orange-500 font-medium py-1">How It Works</Link>
            <Link href="/login" className="block text-gray-600 hover:text-orange-500 font-medium py-1">Login</Link>
            <Link href="/register" className="btn-gradient text-white px-5 py-2 rounded-full font-semibold text-sm inline-block shadow-lg shadow-orange-200">
              <span>Get Started Free</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

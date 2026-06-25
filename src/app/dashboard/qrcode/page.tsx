'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, ExternalLink, Share2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Restaurant } from '@/lib/types'

export default function QrCodePage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: rests } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setRestaurant(rests && rests.length > 0 ? rests[0] : null)
      setLoading(false)
    }
    load()
  }, [])

  const menuUrl = restaurant
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${restaurant.slug}`
    : ''

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
    toast.success('Menu URL copied! 📋')
  }

  const downloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const SIZE = 512
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!
    
    const data = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      const link = document.createElement('a')
      link.download = `${restaurant?.slug}-qr-menu.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('QR Code downloaded! 🖼️')
    }
    img.src = `data:image/svg+xml;base64,${btoa(data)}`
  }, [restaurant])

  const shareUrl = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${restaurant?.name} Menu`, url: menuUrl })
    } else {
      copyUrl()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">Your Menu QR Code 📲</h1>
        <p className="text-slate-500 mt-1.5 text-sm font-semibold">Download and display this on your tables, menus, or windows so customers can scan and order.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* QR Code Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_24px_64px_rgba(15,23,42,0.04)] p-8 flex flex-col items-center">
          {/* Header Strip */}
          <div
            className="w-full rounded-2xl py-5 px-5 mb-6 text-white text-center shadow-md relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.primary_color}ee)` }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="logo" className="w-14 h-14 rounded-full mx-auto mb-2.5 object-cover border-2 border-white/30" />
            ) : (
              <div className="w-14 h-14 rounded-full mx-auto mb-2.5 bg-white/20 flex items-center justify-center">
                <QrCode size={26} />
              </div>
            )}
            <div className="font-extrabold text-xl">{restaurant.name}</div>
            {restaurant.tagline && <div className="text-white/80 text-xs mt-0.5 font-medium">{restaurant.tagline}</div>}
          </div>

          {/* QR Container */}
          <div ref={qrRef} className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            <QRCodeSVG
              value={menuUrl}
              size={240}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4 text-center">Scan to view our menu</p>

          {/* Download/Share Buttons */}
          <div className="flex flex-col w-full gap-3 mt-6">
            <button
              id="download-qr-btn"
              onClick={downloadQR}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:scale-[1.01] transition-all"
            >
              <Download size={18} />
              <span>Download PNG</span>
            </button>
            <button
              id="share-qr-btn"
              onClick={shareUrl}
              className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Share2 size={18} />
              <span>Share Menu Link</span>
            </button>
          </div>
        </div>

        {/* Info & Settings Panel */}
        <div className="space-y-6">
          {/* Menu Link Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.02)]">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Menu Link</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-3 py-2.5 rounded-xl break-all font-mono font-semibold">{menuUrl}</code>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                id="copy-url-btn"
                onClick={copyUrl}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-bold px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 transition-all cursor-pointer"
              >
                <Copy size={14} />
                Copy Link
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-bold px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
                Open Link
              </a>
            </div>
          </div>

          {/* Guidelines/Tips */}
          <div className="bg-gradient-to-br from-indigo-50/40 to-violet-50/40 border border-indigo-100/60 rounded-3xl p-6 shadow-sm">
            <div className="text-sm font-black text-indigo-900 mb-3.5">💡 Tips for Using Your QR Code</div>
            <ul className="space-y-2.5 text-xs font-semibold text-indigo-800">
              {[
                'Print and place it at every customer table',
                'Stick it on your main window or entry door',
                'Incorporate it into flyers or business cards',
                'Share on social platforms like Instagram, WhatsApp, or Google Maps',
                'Update your digital menu anytime without changing the printed QR code!',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-indigo-500 mt-0.5 shrink-0">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restaurant Quick Stats */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.02)]">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Metadata Details</div>
            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Restaurant Name</span>
                <span className="font-extrabold text-slate-800">{restaurant.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Menu Slug</span>
                <span className="font-extrabold text-slate-800">{restaurant.slug}</span>
              </div>
              {restaurant.phone && (
                <div className="flex justify-between">
                  <span>Phone Number</span>
                  <span className="font-extrabold text-slate-800">{restaurant.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

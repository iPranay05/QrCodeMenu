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
    toast.success('Menu URL copied!')
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
      toast.success('QR Code downloaded!')
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
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Your QR Code</h1>
        <p className="text-gray-500 mt-1">Download and display this on your tables, menus, or windows.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 flex flex-col items-center">
          {/* Header Strip */}
          <div
            className="w-full rounded-xl py-4 px-5 mb-6 text-white text-center"
            style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.primary_color}cc)` }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="logo" className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-white/30" />
            ) : (
              <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-white/20 flex items-center justify-center">
                <QrCode size={24} />
              </div>
            )}
            <div className="font-extrabold text-xl">{restaurant.name}</div>
            {restaurant.tagline && <div className="text-white/75 text-xs mt-0.5">{restaurant.tagline}</div>}
          </div>

          {/* QR */}
          <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
            <QRCodeSVG
              value={menuUrl}
              size={220}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-gray-500 text-sm mt-4 text-center">Scan to view our menu</p>

          {/* Download Buttons */}
          <div className="flex flex-col w-full gap-3 mt-6">
            <button
              id="download-qr-btn"
              onClick={downloadQR}
              className="btn-gradient text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              <Download size={18} />
              <span>Download PNG</span>
            </button>
            <button
              id="share-qr-btn"
              onClick={shareUrl}
              className="border-2 border-orange-200 text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
            >
              <Share2 size={18} />
              Share Menu Link
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-5">
          {/* URL */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu URL</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg break-all">{menuUrl}</code>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                id="copy-url-btn"
                onClick={copyUrl}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all border border-gray-200"
              >
                <Copy size={14} />
                Copy
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all border border-gray-200"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100 p-5">
            <div className="text-sm font-bold text-orange-700 mb-3">💡 Tips for Using Your QR Code</div>
            <ul className="space-y-2 text-sm text-orange-700">
              {[
                'Print and laminate it for each table',
                'Add it to your door or window display',
                'Include it on your business cards',
                'Share the link on WhatsApp, Instagram, or Google Maps',
                'Use it in your social media bio',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Menu Details</div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Restaurant</span>
                <span className="font-semibold text-gray-900">{restaurant.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Slug</span>
                <span className="font-semibold text-gray-900">{restaurant.slug}</span>
              </div>
              {restaurant.phone && (
                <div className="flex justify-between">
                  <span>Phone</span>
                  <span className="font-semibold text-gray-900">{restaurant.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, ExternalLink, Share2, QrCode, BarChart2, Check, Utensils, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Restaurant } from '@/lib/types'

interface PopularItem {
  id: string
  name: string
  price: number
  is_veg: boolean
}

interface DashboardAnalyticsProps {
  restaurant: Restaurant
  menuUrl: string
  popularItems: PopularItem[]
}

const RANK_COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: '🥇' },
  { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', label: '🥈' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: '🥉' },
]

export default function DashboardAnalytics({ restaurant, menuUrl, popularItems }: DashboardAnalyticsProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    toast.success('Menu URL copied! 📋')
    setTimeout(() => setCopied(false), 2000)
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
      link.download = `${restaurant.slug}-qr-menu.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('QR Code downloaded! 🖼️')
    }
    img.src = `data:image/svg+xml;base64,${btoa(data)}`
  }, [restaurant])

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${restaurant.name} Menu`, url: menuUrl })
      } catch {
        copyUrl()
      }
    } else {
      copyUrl()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Side — Analytics & Popular Items */}
      <div className="lg:col-span-8 space-y-6">

        {/* Analytics Coming Soon Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Menu Analytics</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 border border-indigo-100/50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200/60 flex items-center justify-center mb-4 shadow-sm">
              <BarChart2 className="text-indigo-600" size={26} />
            </div>
            <p className="text-slate-800 font-extrabold text-base tracking-tight">Scan Analytics — Coming Soon</p>
            <p className="text-slate-400 text-xs font-semibold mt-1.5 max-w-xs leading-relaxed">
              Once customers start scanning your QR code, you&apos;ll see daily scan counts, peak hours, and top-viewed dishes here.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {['Daily Scans', 'Peak Hours', 'Top Items', 'Table Heatmap'].map(label => (
                <span key={label} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items — Real Data Only */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Utensils size={14} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Performing Items</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Your most recently added dishes</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {popularItems.length > 0 ? (
              popularItems.map((item, idx) => {
                const rank = RANK_COLORS[idx] || RANK_COLORS[2]
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${rank.bg} ${rank.border} transition-all duration-200`}
                  >
                    {/* Rank badge */}
                    <span className="text-lg leading-none select-none">{rank.label}</span>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-extrabold text-xs text-slate-800 truncate">{item.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold mt-0.5 ${rank.text}`}>
                        {item.is_veg ? 'Vegetarian' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-800 text-sm">₹{item.price}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <Trophy size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-[11px] font-bold text-slate-400">No menu items yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Add dishes to your menu to see them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side — QR Code */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.01)] p-5 flex flex-col items-center">
          {/* Restaurant header strip */}
          <div
            className="w-full rounded-xl py-2.5 px-3 mb-4 text-white text-center shadow-sm relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.primary_color}ee)` }}
          >
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt="logo"
                className="w-9 h-9 rounded-full mx-auto mb-1.5 object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full mx-auto mb-1.5 bg-white/20 flex items-center justify-center">
                <QrCode size={18} />
              </div>
            )}
            <div className="font-extrabold text-sm truncate">{restaurant.name}</div>
            {restaurant.tagline && <div className="text-white/80 text-[9px] mt-0.5 font-medium truncate">{restaurant.tagline}</div>}
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="p-3 bg-white rounded-xl border border-slate-100 shadow-[inset_0_1.5px_8px_rgba(0,0,0,0.02)]">
            <QRCodeSVG
              value={menuUrl}
              size={135}
              fgColor="#1e293b"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-3 text-center">Scan to preview menu</p>

          {/* Menu URL row */}
          <div className="w-full mt-4 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-between gap-1.5">
            <code className="text-[9px] text-indigo-600 bg-indigo-50/50 border border-indigo-100/30 px-2 py-1 rounded-lg font-mono font-bold truncate flex-1">{menuUrl}</code>
            <button
              onClick={copyUrl}
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-sm text-slate-500 hover:text-indigo-600 shrink-0"
              title="Copy menu URL"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Download / Share / Open */}
          <div className="flex flex-col w-full gap-2 mt-3.5">
            <button
              onClick={downloadQR}
              className="bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors duration-200"
            >
              <Download size={13} />
              <span>Download QR Image</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={shareUrl}
                className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
              >
                <ExternalLink size={13} />
                <span>Open</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

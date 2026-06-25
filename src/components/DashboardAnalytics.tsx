'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, ExternalLink, Share2, QrCode, TrendingUp, Calendar, Eye, Utensils, Check } from 'lucide-react'
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

export default function DashboardAnalytics({ restaurant, menuUrl, popularItems }: DashboardAnalyticsProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  // Chart data representing weekly scan activity
  const chartData = [
    { day: 'Mon', scans: 140 },
    { day: 'Tue', scans: 210 },
    { day: 'Wed', scans: 185 },
    { day: 'Thu', scans: 310 },
    { day: 'Fri', scans: 430 },
    { day: 'Sat', scans: 590 },
    { day: 'Sun', scans: 520 },
  ]

  const maxScans = 600
  const width = 500
  const height = 130
  const paddingX = 35
  const paddingY = 20

  // Calculate coordinates for points
  const points = chartData.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (chartData.length - 1)
    const y = height - paddingY - (d.scans / maxScans) * (height - 2 * paddingY)
    return { x, y, ...d }
  })

  // Generate SVG path for line
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`
  }, '')

  // Generate SVG path for area fill under the line
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : ''

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
      } catch (err) {
        copyUrl()
      }
    } else {
      copyUrl()
    }
  }

  // Predefined popular items scan simulation counts
  const mockPopularStats = [
    { scans: 245, percentage: 88 },
    { scans: 198, percentage: 72 },
    { scans: 142, percentage: 51 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Analytics Chart & Popular Items (Left Side) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Weekly Scan Activity Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Menu Scans</h3>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-slate-800">2,380</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                  <TrendingUp size={10} />
                  +14.2%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl">
              <Calendar size={11} />
              <span>Last 7 Days</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                {/* Line Gradient */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((val) => {
                const y = paddingY + (val * (height - 2 * paddingY)) / 3
                return (
                  <line 
                    key={val} 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="0.75"
                    strokeDasharray="3 3" 
                  />
                )
              })}

              {/* Area Path */}
              {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

              {/* Line Path */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Invisible larger hover target circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                  {/* Visual dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === idx ? 4.5 : 3}
                    fill={hoveredIdx === idx ? '#4f46e5' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth={hoveredIdx === idx ? 2 : 1.5}
                    className="transition-all duration-200 pointer-events-none shadow-sm"
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 4}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-400 font-sans"
                >
                  {p.day}
                </text>
              ))}

              {/* Hover Dotted Vertical Line */}
              {hoveredIdx !== null && (
                <g className="pointer-events-none">
                  {/* Vertical line */}
                  <line
                    x1={points[hoveredIdx].x}
                    y1={paddingY}
                    x2={points[hoveredIdx].x}
                    y2={height - paddingY}
                    stroke="#6366f1"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                  />
                </g>
              )}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIdx !== null && (
              <div 
                className="absolute z-10 bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-md text-[10px] font-bold flex flex-col items-center pointer-events-none transition-all duration-150 border border-slate-800"
                style={{
                  left: `${(points[hoveredIdx].x / width) * 100}%`,
                  top: `${(points[hoveredIdx].y / height) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <span className="text-[8px] text-slate-400 uppercase tracking-wider">{chartData[hoveredIdx].day}</span>
                <span className="text-indigo-400 text-xs font-extrabold">{chartData[hoveredIdx].scans}</span>
              </div>
            )}
          </div>
        </div>

        {/* Popular Items Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Utensils size={14} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Performing Items</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Most viewed menu items</p>
            </div>
          </div>

          <div className="space-y-3">
            {popularItems.length > 0 ? (
              popularItems.map((item, idx) => {
                const stat = mockPopularStats[idx] || { scans: 45, percentage: 20 }
                return (
                  <div key={item.id} className="group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-extrabold text-xs text-slate-700 truncate">{item.name}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold justify-end">
                        <Eye size={10} className="text-slate-400" />
                        <span>{stat.scans}</span>
                      </div>
                      <div className="text-[11px] font-black text-slate-800 mt-0.5">₹{item.price}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-[10px] font-bold text-slate-400">No menu items found. Add dishes to see insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Container & Actions (Right Side) */}
      <div className="lg:col-span-4 space-y-4">
        {/* QR Code Scannable Card */}
        {/* QR Code Scannable Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.01)] p-5 flex flex-col items-center">
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

          {/* QR Container */}
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

          {/* Quick actions for URL */}
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

          {/* Download/Share Buttons */}
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


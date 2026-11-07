'use client'

import { useState } from 'react'
import type { QrDesign } from '@/lib/types'
import { buildQrCodeOptions, renderFramedQrCanvas } from './qrRenderer'
import toast from 'react-hot-toast'
import { Download, Copy, FileText, Check, Layers, Loader2 } from 'lucide-react'

interface Props {
  design: QrDesign
  restaurantSlug: string
  restaurantName: string
  menuUrl: string
}

export function ExportMenu({
  design,
  restaurantSlug,
  restaurantName,
  menuUrl,
}: Props) {
  const [exportSize, setExportSize] = useState<number>(1024)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Batch tables state
  const [showTableModal, setShowTableModal] = useState(false)
  const [tableCount, setTableCount] = useState<number>(10)
  const [generatingZip, setGeneratingZip] = useState(false)

  // Helper to generate a full framed canvas at specific resolution.
  // Uses getRawData('png') which fully awaits the internal SVG→Image→Canvas
  // pipeline, then draws the result into a fresh canvas for framing.
  const generateCanvas = async (dataUrl: string, size: number): Promise<HTMLCanvasElement> => {
    const QRCodeStyling = (await import('qr-code-styling')).default
    const qrOptions = buildQrCodeOptions(design, dataUrl, size)
    const qr = new QRCodeStyling(qrOptions)

    // getRawData awaits _getElement internally, which awaits _canvasDrawingPromise
    const blob = await qr.getRawData('png')
    if (!blob) throw new Error('QR render returned empty blob')

    // Convert blob → object URL → load into Image → draw onto a fresh canvas
    const objectUrl = URL.createObjectURL(blob as Blob)
    const rawCanvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = size
        c.height = size
        const ctx = c.getContext('2d')!
        // Fill background if not transparent
        if (!design.isTransparentBg) {
          ctx.fillStyle = design.backgroundColor
          ctx.fillRect(0, 0, size, size)
        }
        ctx.drawImage(img, 0, 0, size, size)
        URL.revokeObjectURL(objectUrl)
        resolve(c)
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load QR image from blob'))
      }
      img.src = objectUrl
    })

    return renderFramedQrCanvas(rawCanvas, design, size)
  }

  // PNG Export
  const handleDownloadPng = async () => {
    setDownloading('png')
    try {
      const canvas = await generateCanvas(menuUrl, exportSize)
      const link = document.createElement('a')
      link.download = `${restaurantSlug}-qr-menu-${exportSize}px.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success(`PNG (${exportSize}px) downloaded! 🖼️`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PNG')
    } finally {
      setDownloading(null)
    }
  }

  // JPEG Export
  const handleDownloadJpeg = async () => {
    setDownloading('jpeg')
    try {
      const canvas = await generateCanvas(menuUrl, exportSize)
      const link = document.createElement('a')
      link.download = `${restaurantSlug}-qr-menu-${exportSize}px.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.92)
      link.click()
      toast.success(`JPEG (${exportSize}px) downloaded! 📸`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to export JPEG')
    } finally {
      setDownloading(null)
    }
  }

  // SVG Export
  const handleDownloadSvg = async () => {
    setDownloading('svg')
    try {
      const QRCodeStyling = (await import('qr-code-styling')).default
      const qrOptions = {
        ...buildQrCodeOptions(design, menuUrl, exportSize),
        type: 'svg' as const,
      }
      const qr = new QRCodeStyling(qrOptions)
      const blob = await qr.getRawData('svg')
      if (!blob) throw new Error('SVG blob failed')

      const link = document.createElement('a')
      link.download = `${restaurantSlug}-qr-menu.svg`
      link.href = URL.createObjectURL(blob as Blob)
      link.click()
      toast.success('Vector SVG downloaded! 📐')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export SVG')
    } finally {
      setDownloading(null)
    }
  }

  // PDF Export (Print Ready)
  const handleDownloadPdf = async () => {
    setDownloading('pdf')
    try {
      const { jsPDF } = await import('jspdf')
      const canvas = await generateCanvas(menuUrl, 1024)
      const imgData = canvas.toDataURL('image/png')

      // A4 portrait
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header Banner
      doc.setFillColor(15, 23, 42) // Slate 900
      doc.rect(0, 0, pageWidth, 28, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text(restaurantName || 'Digital Menu', pageWidth / 2, 14, { align: 'center' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Scan with your smartphone camera to view menu & order', pageWidth / 2, 22, { align: 'center' })

      // Center the QR canvas
      const imgWidth = 140
      const imgHeight = (canvas.height / canvas.width) * imgWidth
      const imgX = (pageWidth - imgWidth) / 2
      const imgY = 40

      doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight)

      // Footer
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(menuUrl, pageWidth / 2, imgY + imgHeight + 14, { align: 'center' })

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Powered by QrCodeMenu — Print & place on tables, counters, or acrylic stands', pageWidth / 2, pageHeight - 12, { align: 'center' })

      doc.save(`${restaurantSlug}-menu-stand.pdf`)
      toast.success('Print-ready PDF downloaded! 📄')
    } catch (err) {
      console.error(err)
      toast.error('Failed to export PDF')
    } finally {
      setDownloading(null)
    }
  }

  // Copy Image to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      const canvas = await generateCanvas(menuUrl, 1024)
      canvas.toBlob(async blob => {
        if (!blob) {
          toast.error('Could not generate image blob')
          return
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        toast.success('QR image copied to clipboard! 📋')
        setTimeout(() => setCopied(false), 2500)
      }, 'image/png')
    } catch (err) {
      console.error(err)
      toast.error('Clipboard copy failed. Try downloading PNG instead.')
    }
  }

  // Batch Table QR Codes Export (ZIP)
  const handleBatchDownloadZip = async () => {
    if (tableCount < 1 || tableCount > 100) {
      toast.error('Please enter a table count between 1 and 100')
      return
    }

    setGeneratingZip(true)
    try {
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')
      const zip = new JSZip()
      const folder = zip.folder(`tables-${restaurantSlug}`)

      toast('Generating table QR codes...', { icon: '⏳' })

      for (let i = 1; i <= tableCount; i++) {
        const tableUrl = `${menuUrl}?table=${i}`
        const tableDesign: QrDesign = {
          ...design,
          frameText: design.frameStyle !== 'none' ? `TABLE ${i}` : design.frameText,
        }
        
        // Render canvas via getRawData which fully awaits the internal pipeline
        const QRCodeStyling = (await import('qr-code-styling')).default
        const qr = new QRCodeStyling(buildQrCodeOptions(tableDesign, tableUrl, 1024))
        const blob = await qr.getRawData('png')
        if (!blob) throw new Error('QR render returned empty blob for table ' + i)
        const objectUrl = URL.createObjectURL(blob as Blob)
        const tableRawCanvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            const c = document.createElement('canvas')
            c.width = 1024
            c.height = 1024
            const cx = c.getContext('2d')!
            if (!tableDesign.isTransparentBg) {
              cx.fillStyle = tableDesign.backgroundColor
              cx.fillRect(0, 0, 1024, 1024)
            }
            cx.drawImage(img, 0, 0, 1024, 1024)
            URL.revokeObjectURL(objectUrl)
            resolve(c)
          }
          img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('img load failed')) }
          img.src = objectUrl
        })
        const framed = await renderFramedQrCanvas(tableRawCanvas, tableDesign, 1024)

        const dataUrl = framed.toDataURL('image/png')
        const base64 = dataUrl.split(',')[1]
        folder?.file(`table-${i}.png`, base64, { base64: true })
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${restaurantSlug}-tables-1-to-${tableCount}.zip`)
      toast.success(`ZIP with ${tableCount} table QR codes downloaded! 📦`)
      setShowTableModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate table ZIP')
    } finally {
      setGeneratingZip(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Resolution Selector */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <span className="text-xs font-bold text-slate-700">Export Resolution</span>
        <div className="flex gap-1">
          {[512, 1024, 2048, 4096].map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => setExportSize(sz)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                exportSize === sz
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {sz}px
            </button>
          ))}
        </div>
      </div>

      {/* Main Download Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={Boolean(downloading)}
          onClick={handleDownloadPng}
          className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {downloading === 'png' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>Download PNG</span>
        </button>

        <button
          type="button"
          disabled={Boolean(downloading)}
          onClick={handleDownloadJpeg}
          className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {downloading === 'jpeg' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>Download JPEG</span>
        </button>

        <button
          type="button"
          disabled={Boolean(downloading)}
          onClick={handleDownloadSvg}
          className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {downloading === 'svg' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>Vector SVG</span>
        </button>

        <button
          type="button"
          disabled={Boolean(downloading)}
          onClick={handleDownloadPdf}
          className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {downloading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          <span>Print PDF (A4)</span>
        </button>
      </div>

      {/* Auxiliary actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopyToClipboard}
          className="flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          className="flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Layers size={14} />
          <span>Batch Tables (ZIP)</span>
        </button>
      </div>

      {/* Table Batch Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Download Table QR Codes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Generate numbered QR codes encoded with <code className="text-indigo-600 font-semibold font-mono">?table=N</code> that auto-fill the customer&apos;s table number upon ordering.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Number of Tables (1 to 100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={tableCount}
                onChange={e => setTableCount(parseInt(e.target.value) || 1)}
                className="w-full text-sm font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generatingZip}
                onClick={handleBatchDownloadZip}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {generatingZip ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span>Generate ZIP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


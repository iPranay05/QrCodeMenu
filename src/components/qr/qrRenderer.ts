'use client'

import type { QrDesign } from '@/lib/types'
import type { Options, TypeNumber } from 'qr-code-styling'

// Check contrast ratio between two hex colors or transparent
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('')
  }
  if (clean.length !== 6) return null
  const num = parseInt(clean, 16)
  if (isNaN(num)) return null
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex)
  const bg = hexToRgb(bgHex)
  if (!fg || !bg) return 21 // fallback
  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b)
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function checkScanSafety(design: QrDesign): {
  isSafe: boolean
  ratio: number
  isInverted: boolean
  warning: string | null
} {
  const fg = design.foregroundColorType === 'gradient' ? design.foregroundColor : design.foregroundColor
  const bg = design.isTransparentBg ? '#ffffff' : design.backgroundColor

  const fgRgb = hexToRgb(fg) || { r: 15, g: 23, b: 42 }
  const bgRgb = hexToRgb(bg) || { r: 255, g: 255, b: 255 }

  const fgLum = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

  const isInverted = fgLum > bgLum
  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)

  if (isInverted) {
    return {
      isSafe: false,
      ratio,
      isInverted: true,
      warning: 'Inverted colors detected (light foreground on dark background). Many mobile cameras cannot scan inverted QR codes.',
    }
  }

  if (ratio < 3.5) {
    return {
      isSafe: false,
      ratio,
      isInverted: false,
      warning: `Low contrast ratio (${ratio.toFixed(1)}:1). Recommended minimum is 4.0:1 for reliable scanning.`,
    }
  }

  return { isSafe: true, ratio, isInverted: false, warning: null }
}

// Convert design options to QRCodeStyling options
export function buildQrCodeOptions(design: QrDesign, data: string, size: number): Options {
  const fgColor = design.foregroundColor
  const dotsOptions: Options['dotsOptions'] = {
    type: design.dotType,
  }

  if (design.foregroundColorType === 'gradient') {
    dotsOptions.gradient = {
      type: design.gradientType,
      rotation: (design.gradientRotation * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: fgColor },
        { offset: 1, color: design.gradientColor2 },
      ],
    }
  } else {
    dotsOptions.color = fgColor
    dotsOptions.gradient = undefined
  }

  const cornersSquareOptions: Options['cornersSquareOptions'] = {
    type: design.eyeFrameType,
    color: design.customEyeColor ? design.eyeFrameColor : fgColor,
  }

  const cornersDotOptions: Options['cornersDotOptions'] = {
    type: design.eyeBallType,
    color: design.customEyeColor ? design.eyeBallColor : fgColor,
  }

  const backgroundOptions: Options['backgroundOptions'] = {
    color: design.isTransparentBg ? 'transparent' : design.backgroundColor,
  }

  const effectiveErrorCorrection = design.logoUrl ? 'H' : design.errorCorrectionLevel

  // Scale margin proportionally so the quiet zone visual margin matches across preview (320px) and export (1024px+)
  // A standard preview size is 320px, so scaling factor is (size / 320)
  const scaledMargin = Math.round(design.quietZone * (size / 320))

  return {
    width: size,
    height: size,
    type: 'canvas',
    shape: design.shape || 'square',
    data,
    margin: scaledMargin,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte',
      errorCorrectionLevel: effectiveErrorCorrection,
    },
    imageOptions: {
      hideBackgroundDots: design.hideBackgroundDots,
      imageSize: design.logoSize,
      margin: design.logoMargin,
      crossOrigin: 'anonymous',
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions,
    image: design.logoUrl || undefined,
  }
}

// Helper to render framed QR onto a canvas of arbitrary target dimension
export async function renderFramedQrCanvas(
  rawQrCanvas: HTMLCanvasElement,
  design: QrDesign,
  targetSize: number = 1024
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const frameStyle = design.frameStyle
  if (frameStyle === 'none') {
    canvas.width = targetSize
    canvas.height = targetSize
    if (!design.isTransparentBg) {
      ctx.fillStyle = design.backgroundColor
      ctx.fillRect(0, 0, targetSize, targetSize)
    }
    ctx.drawImage(rawQrCanvas, 0, 0, targetSize, targetSize)
    return canvas
  }

  if (frameStyle === 'simple') {
    const borderWidth = Math.max(8, Math.round(targetSize * 0.03))
    const totalSize = targetSize + borderWidth * 2
    canvas.width = totalSize
    canvas.height = totalSize

    ctx.fillStyle = design.frameColor
    ctx.fillRect(0, 0, totalSize, totalSize)

    if (!design.isTransparentBg) {
      ctx.fillStyle = design.backgroundColor
      ctx.fillRect(borderWidth, borderWidth, targetSize, targetSize)
    }
    ctx.drawImage(rawQrCanvas, borderWidth, borderWidth, targetSize, targetSize)
    return canvas
  }

  if (frameStyle === 'bottom-label' || frameStyle === 'top-label') {
    // Proportions matching QrPreview:
    // Outer padding: p-4 = 16px relative to ~280px QR canvas => ~5.5%
    // Inner QR container padding: p-2 = 8px => ~2.8%
    // Total outer card padding around the inner container:
    const outerPadding = Math.round(targetSize * 0.055)
    const innerPadding = Math.round(targetSize * 0.028)
    const headerOrFooterHeight = Math.round(targetSize * 0.16)
    const innerBoxSize = targetSize + innerPadding * 2

    const totalWidth = innerBoxSize + outerPadding * 2
    const totalHeight = innerBoxSize + outerPadding * 2 + headerOrFooterHeight
    const borderRadius = Math.round(targetSize * 0.08)

    canvas.width = totalWidth
    canvas.height = totalHeight

    // Draw background card with rounded corners
    ctx.fillStyle = design.frameColor
    drawRoundedRect(ctx, 0, 0, totalWidth, totalHeight, borderRadius)
    ctx.fill()

    // Inner QR container coordinates
    const qrBoxX = outerPadding
    const qrBoxY = frameStyle === 'top-label' ? outerPadding + headerOrFooterHeight : outerPadding
    
    // Draw white or chosen background for inner QR container with rounded corners
    ctx.fillStyle = design.isTransparentBg ? '#ffffff' : design.backgroundColor
    drawRoundedRect(ctx, qrBoxX, qrBoxY, innerBoxSize, innerBoxSize, Math.round(borderRadius * 0.6))
    ctx.fill()

    // Draw QR canvas centered inside inner box
    ctx.drawImage(rawQrCanvas, qrBoxX + innerPadding, qrBoxY + innerPadding, targetSize, targetSize)

    // Text Banner
    ctx.fillStyle = design.frameTextColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const fontSize = Math.max(16, Math.round(targetSize * 0.052))
    ctx.font = `bold ${fontSize}px sans-serif`
    
    const textY = frameStyle === 'top-label' 
      ? outerPadding + headerOrFooterHeight / 2 
      : totalHeight - outerPadding - headerOrFooterHeight / 2 + outerPadding * 0.15

    ctx.fillText(design.frameText || 'SCAN ME', totalWidth / 2, textY)
    return canvas
  }

  if (frameStyle === 'table-tent') {
    const outerPadding = Math.round(targetSize * 0.065)
    const innerPadding = Math.round(targetSize * 0.025)
    const topHeight = Math.round(targetSize * 0.18)
    const bottomHeight = Math.round(targetSize * 0.12)
    const innerBoxSize = targetSize + innerPadding * 2

    const totalWidth = innerBoxSize + outerPadding * 2
    const totalHeight = innerBoxSize + outerPadding * 2 + topHeight + bottomHeight
    const borderRadius = Math.round(targetSize * 0.08)

    canvas.width = totalWidth
    canvas.height = totalHeight

    // Outer tent
    ctx.fillStyle = '#ffffff'
    drawRoundedRect(ctx, 0, 0, totalWidth, totalHeight, borderRadius)
    ctx.fill()

    // Top banner
    ctx.fillStyle = design.frameColor
    drawRoundedRect(ctx, outerPadding * 0.5, outerPadding * 0.5, totalWidth - outerPadding, topHeight, Math.round(borderRadius * 0.7))
    ctx.fill()

    // Top banner text
    ctx.fillStyle = design.frameTextColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const titleSize = Math.max(18, Math.round(targetSize * 0.055))
    ctx.font = `bold ${titleSize}px sans-serif`
    ctx.fillText(design.frameText || 'TABLE MENU', totalWidth / 2, outerPadding * 0.5 + topHeight / 2)

    // Inner QR container
    const qrBoxX = outerPadding
    const qrBoxY = outerPadding + topHeight
    ctx.fillStyle = design.isTransparentBg ? '#ffffff' : design.backgroundColor
    drawRoundedRect(ctx, qrBoxX, qrBoxY, innerBoxSize, innerBoxSize, Math.round(borderRadius * 0.6))
    ctx.fill()

    // QR in center
    ctx.drawImage(rawQrCanvas, qrBoxX + innerPadding, qrBoxY + innerPadding, targetSize, targetSize)

    // Bottom footnote
    ctx.fillStyle = '#64748b'
    ctx.font = `600 ${Math.round(targetSize * 0.032)}px sans-serif`
    ctx.fillText('Point your camera to order', totalWidth / 2, totalHeight - bottomHeight * 0.55)

    return canvas
  }

  // Fallback
  canvas.width = targetSize
  canvas.height = targetSize
  ctx.drawImage(rawQrCanvas, 0, 0, targetSize, targetSize)
  return canvas
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}


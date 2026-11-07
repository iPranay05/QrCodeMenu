export interface Restaurant {
  id: string
  user_id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  tagline: string | null
  address: string | null
  phone: string | null
  website: string | null
  primary_color: string
  theme: string | null
  background_image_url: string | null
  opening_time: string | null
  closing_time: string | null
  delivery_platforms: { name: string; url: string }[] | null
  live_url: string | null
  referral_code: string | null
  subscription_status: 'trial' | 'active' | 'expired' | 'grace' | null
  subscription_expires_at: string | null
  trial_ends_at: string | null
  qr_design?: QrDesign | null
  created_at: string
  updated_at: string
}

export type QrDotType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded'
export type QrEyeFrameType = 'square' | 'extra-rounded' | 'dot' | 'classy-rounded' | 'dots'
export type QrEyeBallType = 'square' | 'dot' | 'rounded' | 'classy-rounded' | 'dots'
export type QrShape = 'square' | 'circle'
export type QrFrameStyle = 'none' | 'simple' | 'bottom-label' | 'top-label' | 'table-tent'

export interface QrDesign {
  // Colors
  foregroundColorType: 'solid' | 'gradient'
  foregroundColor: string
  gradientColor2: string
  gradientType: 'linear' | 'radial'
  gradientRotation: number
  backgroundColor: string // hex or 'transparent'
  isTransparentBg: boolean
  useBrandColor: boolean
  customEyeColor: boolean
  eyeFrameColor: string
  eyeBallColor: string

  // Shapes & Styles
  shape?: QrShape
  dotType: QrDotType
  eyeFrameType: QrEyeFrameType
  eyeBallType: QrEyeBallType
  quietZone: number // 0 to 40 (margin)
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'

  // Center Logo
  logoUrl: string | null
  logoSize: number // 0.15 to 0.40
  logoMargin: number // 0 to 20
  hideBackgroundDots: boolean

  // Frame & CTA
  frameStyle: QrFrameStyle
  frameText: string
  frameTextColor: string
  frameColor: string
}

export const DEFAULT_QR_DESIGN: QrDesign = {
  foregroundColorType: 'solid',
  foregroundColor: '#0f172a',
  gradientColor2: '#4f46e5',
  gradientType: 'linear',
  gradientRotation: 45,
  backgroundColor: '#ffffff',
  isTransparentBg: false,
  useBrandColor: false,
  customEyeColor: false,
  eyeFrameColor: '#0f172a',
  eyeBallColor: '#0f172a',

  shape: 'square',
  dotType: 'rounded',
  eyeFrameType: 'extra-rounded',
  eyeBallType: 'dot',
  quietZone: 16,
  errorCorrectionLevel: 'H',

  logoUrl: null,
  logoSize: 0.28,
  logoMargin: 6,
  hideBackgroundDots: true,

  frameStyle: 'bottom-label',
  frameText: 'SCAN TO VIEW OUR MENU',
  frameTextColor: '#ffffff',
  frameColor: '#0f172a',
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name: string
  display_order: number
  created_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  ingredients: string | null
  video_url: string | null
  preparation_time: string | null
  is_available: boolean
  is_veg: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface MenuCategoryWithItems extends MenuCategory {
  menu_items: MenuItem[]
}

export interface Order {
  id: string
  restaurant_id: string
  table_number: string
  status: 'pending' | 'preparing' | 'completed' | 'cancelled'
  total_amount: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  price: number
  item_name: string
}

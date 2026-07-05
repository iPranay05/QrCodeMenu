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
  created_at: string
  updated_at: string
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

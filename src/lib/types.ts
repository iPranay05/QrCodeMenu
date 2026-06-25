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
  is_available: boolean
  is_veg: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface MenuCategoryWithItems extends MenuCategory {
  menu_items: MenuItem[]
}

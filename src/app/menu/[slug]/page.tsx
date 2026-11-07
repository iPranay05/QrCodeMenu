import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { MenuCategoryWithItems, Restaurant } from '@/lib/types'
import PublicMenuClient from './PublicMenuClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

const DEMO_RESTAURANT: Restaurant = {
  id: 'demo-restaurant-id',
  user_id: 'demo-user',
  name: 'The Saffron Table',
  slug: 'demo-restaurant',
  tagline: 'Artisan Indian Cuisine & Tandoor Bar',
  phone: '+91 98765 43210',
  address: '12 Connaught Place, New Delhi',
  website: null,
  live_url: null,
  primary_color: '#4F46E5',
  theme: 'book',
  logo_url: null,
  cover_url: null,
  background_image_url: null,
  delivery_platforms: [
    { name: 'Zomato', url: 'https://zomato.com' },
    { name: 'Swiggy', url: 'https://swiggy.com' }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  subscription_status: 'active',
  trial_ends_at: null,
  subscription_expires_at: null,
  referral_code: null,
  opening_time: '11:00 AM',
  closing_time: '11:00 PM',
}

const DEMO_CATEGORIES: MenuCategoryWithItems[] = [
  {
    id: 'cat-1',
    restaurant_id: 'demo-restaurant-id',
    name: 'Starters & Small Plates',
    display_order: 1,
    created_at: new Date().toISOString(),
    menu_items: [
      {
        id: 'item-1',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-1',
        name: 'Paneer Tikka Angara',
        description: 'Tender cottage cheese cubes marinated in Kashmiri chili, hung curd, and roasted garam masala.',
        price: 249,
        is_veg: true,
        is_available: true,
        display_order: 1,
        image_url: null,
        ingredients: 'Paneer, Spiced Curd, Bell Peppers, Onions',
        video_url: null,
        preparation_time: '15 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-2',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-1',
        name: 'Tandoori Murgh Wings',
        description: 'Smoky chicken wings charred in traditional clay oven with desi ghee brush.',
        price: 349,
        is_veg: false,
        is_available: true,
        display_order: 2,
        image_url: null,
        ingredients: 'Chicken Wings, Tandoori Masala, Lemon',
        video_url: null,
        preparation_time: '20 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-3',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-1',
        name: 'Crispy Corn Salt & Pepper',
        description: 'Crunchy golden sweet corn tossed with fresh scallions, crushed black pepper, and lime.',
        price: 199,
        is_veg: true,
        is_available: true,
        display_order: 3,
        image_url: null,
        ingredients: 'Sweet Corn, Scallions, Black Pepper',
        video_url: null,
        preparation_time: '10 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  },
  {
    id: 'cat-2',
    restaurant_id: 'demo-restaurant-id',
    name: 'Main Course Specialties',
    display_order: 2,
    created_at: new Date().toISOString(),
    menu_items: [
      {
        id: 'item-4',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-2',
        name: 'Dal Makhani Bukhara',
        description: 'Slow-simmered whole black lentils cooked for 16 hours with churned butter and dairy cream.',
        price: 289,
        is_veg: true,
        is_available: true,
        display_order: 1,
        image_url: null,
        ingredients: 'Black Lentils, Butter, Cream, Kasuri Methi',
        video_url: null,
        preparation_time: '20 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-5',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-2',
        name: 'Butter Chicken Grand Royale',
        description: 'Tandoori pulled chicken enveloped in silky, mildly sweet makhani gravy.',
        price: 399,
        is_veg: false,
        is_available: true,
        display_order: 2,
        image_url: null,
        ingredients: 'Chicken, Tomato Gravy, Butter, Cream, Cardamom',
        video_url: null,
        preparation_time: '25 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  },
  {
    id: 'cat-3',
    restaurant_id: 'demo-restaurant-id',
    name: 'Beverages & Coolers',
    display_order: 3,
    created_at: new Date().toISOString(),
    menu_items: [
      {
        id: 'item-6',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-3',
        name: 'Mango Lassi Royale',
        description: 'Creamy yogurt churned with Ratnagiri Alphonso mango pulp and garnished with crushed pistachios.',
        price: 149,
        is_veg: true,
        is_available: true,
        display_order: 1,
        image_url: null,
        ingredients: 'Alphonso Mango, Thick Curd, Pistachios',
        video_url: null,
        preparation_time: '5 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-7',
        restaurant_id: 'demo-restaurant-id',
        category_id: 'cat-3',
        name: 'Fresh Mint Lime Fizz',
        description: 'Muddled fresh mint sprigs, lime juice, and sparkling soda with black salt.',
        price: 119,
        is_veg: true,
        is_available: true,
        display_order: 2,
        image_url: null,
        ingredients: 'Fresh Mint, Lime, Soda, Black Salt',
        video_url: null,
        preparation_time: '5 mins',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'demo-restaurant') {
    return {
      title: `${DEMO_RESTAURANT.name} — Digital Menu Demo`,
      description: DEMO_RESTAURANT.tagline || 'Experience the digital QR menu demo',
    }
  }

  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  if (!restaurant) return { title: 'Menu Not Found' }

  return {
    title: `${restaurant.name} — Digital Menu`,
    description: restaurant.tagline || `Browse the menu at ${restaurant.name}`,
  }
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) {
    // If user opened demo-restaurant, provide the built-in rich demo menu
    if (slug === 'demo-restaurant') {
      return (
        <PublicMenuClient
          restaurant={DEMO_RESTAURANT}
          categories={DEMO_CATEGORIES}
        />
      )
    }
    notFound()
  }

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('display_order')

  const categoriesWithItems = (categories || []).map((cat: any) => ({
    ...cat,
    menu_items: (cat.menu_items || [])
      .filter((item: any) => item.is_available)
      .sort((a: any, b: any) => a.display_order - b.display_order),
  })) as MenuCategoryWithItems[]

  return (
    <PublicMenuClient
      restaurant={restaurant as Restaurant}
      categories={categoriesWithItems}
    />
  )
}


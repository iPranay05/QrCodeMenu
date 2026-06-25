import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { MenuCategoryWithItems, Restaurant } from '@/lib/types'
import PublicMenuClient from './PublicMenuClient'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
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

  if (!restaurant) notFound()

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

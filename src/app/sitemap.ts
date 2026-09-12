import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menuqr.com'

  // Fetch all public restaurant slugs
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at')

  const restaurantUrls: MetadataRoute.Sitemap = (restaurants || []).map((restaurant) => ({
    url: `${baseUrl}/menu/${restaurant.slug}`,
    lastModified: new Date(restaurant.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...restaurantUrls,
  ]
}

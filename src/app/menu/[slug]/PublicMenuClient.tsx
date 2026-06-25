'use client'
import { useState, useMemo } from 'react'
import { MapPin, Phone, Globe, Search, Leaf } from 'lucide-react'
import type { Restaurant, MenuCategoryWithItems, MenuItem } from '@/lib/types'

interface Props {
  restaurant: Restaurant
  categories: MenuCategoryWithItems[]
}

function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
        isVeg ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      <span className={isVeg ? 'veg-indicator' : 'non-veg-indicator'} />
      {isVeg ? 'Veg' : 'Non-Veg'}
    </span>
  )
}

function MenuItemCard({ item, primaryColor }: { item: MenuItem; primaryColor: string }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-3 p-4 hover:shadow-md transition-shadow">
      {item.image_url && !imgError ? (
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center flex-shrink-0 text-3xl">
          🍽️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h3>
              <VegBadge isVeg={item.is_veg} />
            </div>
            {item.description && (
              <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-extrabold" style={{ color: primaryColor }}>
            ₹{item.price}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PublicMenuClient({ restaurant, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)

  const primaryColor = restaurant.primary_color || '#F97316'

  const filteredCategories = useMemo(() => {
    if (!searchQuery && !vegOnly) return categories
    return categories
      .map(cat => ({
        ...cat,
        menu_items: cat.menu_items.filter(item => {
          const matchesSearch = !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
          const matchesVeg = !vegOnly || item.is_veg
          return matchesSearch && matchesVeg
        }),
      }))
      .filter(cat => cat.menu_items.length > 0)
  }, [categories, searchQuery, vegOnly])

  const totalItems = categories.reduce((acc, c) => acc + c.menu_items.length, 0)

  const scrollToCategory = (id: string) => {
    setActiveCategory(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative">
        {/* Cover */}
        {restaurant.cover_url ? (
          <div className="h-48 sm:h-56 overflow-hidden">
            <img src={restaurant.cover_url} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 h-48 sm:h-56 bg-black/30" />
          </div>
        ) : (
          <div
            className="h-48 sm:h-56"
            style={{ background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}55)` }}
          />
        )}

        {/* Info Card */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl -mt-16 relative z-10 p-5 sm:p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md flex-shrink-0 border-2 border-gray-100"
                />
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {restaurant.name[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{restaurant.name}</h1>
                {restaurant.tagline && (
                  <p className="text-gray-500 text-sm mt-0.5">{restaurant.tagline}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {restaurant.address && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} />
                      {restaurant.address}
                    </div>
                  )}
                  {restaurant.phone && (
                    <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500">
                      <Phone size={11} />
                      {restaurant.phone}
                    </a>
                  )}
                  {restaurant.website && (
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500">
                      <Globe size={11} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex gap-3 items-center">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border-2 transition-all ${
              vegOnly
                ? 'bg-green-500 text-white border-green-500'
                : 'text-green-700 border-green-200 hover:bg-green-50'
            }`}
          >
            <Leaf size={13} />
            Veg Only
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && !searchQuery && !vegOnly && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="max-w-2xl mx-auto px-4 mt-4 pb-12 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-lg">No items found</div>
            <div className="text-sm mt-1">Try a different search or filter</div>
          </div>
        ) : (
          filteredCategories.map(category => (
            <section key={category.id} id={`cat-${category.id}`}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-extrabold text-gray-900">{category.name}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {category.menu_items.length} items
                </span>
              </div>
              <div className="space-y-3">
                {category.menu_items.map(item => (
                  <MenuItemCard key={item.id} item={item} primaryColor={primaryColor} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a href="/" className="text-orange-400 font-semibold hover:underline">
              MenuQR
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

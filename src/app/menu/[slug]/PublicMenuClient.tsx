'use client'
import { useState, useMemo } from 'react'
import { MapPin, Phone, Globe, Search, Leaf, ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import type { Restaurant, MenuCategoryWithItems, MenuItem } from '@/lib/types'

interface Props {
  restaurant: Restaurant
  categories: MenuCategoryWithItems[]
}

function VegIndicator({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded ${
        isVeg ? 'border-green-600' : 'border-red-600'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </span>
  )
}

const DividerFlourish = () => (
  <div className="flex items-center justify-center gap-3 my-5 opacity-40">
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-neutral-500" />
    <span className="text-neutral-600 text-xs select-none">❦</span>
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-neutral-500" />
  </div>
)

// Realistic metal spiral binder loops
const BinderRings = ({ position }: { position: 'center' | 'left' }) => {
  const ringCount = 10
  return (
    <div
      className={`absolute top-6 bottom-6 w-6 flex flex-col justify-between items-center z-30 pointer-events-none ${
        position === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0 -translate-x-1/2'
      }`}
    >
      {Array.from({ length: ringCount }).map((_, i) => (
        <div key={i} className="relative w-8 h-3.5 flex items-center justify-center">
          {/* Paper holes shadow */}
          <div className="absolute left-[3px] w-1.5 h-2 bg-neutral-950/40 rounded-full blur-[0.5px]" />
          <div className="absolute right-[3px] w-1.5 h-2 bg-neutral-950/40 rounded-full blur-[0.5px]" />
          
          {/* Metal spiral ring body */}
          <div className="absolute w-7 h-2.5 bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-500 rounded-full border border-neutral-600/20 shadow-[0_2px_4px_rgba(0,0,0,0.35)]" />
          
          {/* Inner ring hole darkness */}
          <div className="absolute left-1 w-1 h-1 bg-neutral-950 rounded-full" />
          <div className="absolute right-1 w-1 h-1 bg-neutral-950 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function PublicMenuClient({ restaurant, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [mobileView, setMobileView] = useState<'index' | 'items'>('index')

  const primaryColor = restaurant.primary_color || '#6366F1'

  const activeCategoryIndex = useMemo(() => {
    return categories.findIndex(c => c.id === activeCategory)
  }, [categories, activeCategory])

  const activeCategoryData = useMemo(() => {
    return categories.find(c => c.id === activeCategory)
  }, [categories, activeCategory])

  // Items matching filters in the active category
  const filteredActiveItems = useMemo(() => {
    if (!activeCategoryData) return []
    return activeCategoryData.menu_items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesVeg = !vegOnly || item.is_veg
      return matchesSearch && matchesVeg
    })
  }, [activeCategoryData, searchQuery, vegOnly])

  // Global matching items across all categories for searches
  const globalMatchingItems = useMemo(() => {
    if (!searchQuery) return []
    const results: { item: MenuItem; categoryName: string }[] = []
    categories.forEach(cat => {
      cat.menu_items.forEach(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesVeg = !vegOnly || item.is_veg
        if (matchesSearch && matchesVeg) {
          results.push({ item, categoryName: cat.name })
        }
      })
    })
    return results
  }, [categories, searchQuery, vegOnly])

  const turnPage = (direction: 'prev' | 'next') => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory)
    if (direction === 'prev' && currentIndex > 0) {
      setActiveCategory(categories[currentIndex - 1].id)
    } else if (direction === 'next' && currentIndex < categories.length - 1) {
      setActiveCategory(categories[currentIndex + 1].id)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black py-6 px-3 sm:px-6 flex items-center justify-center font-sans">
      <div className="relative w-full max-w-5xl z-10 my-auto">
        
        {/* Leather Binding Cover Backing */}
        <div className="absolute inset-[-6px] sm:inset-[-12px] rounded-[24px] sm:rounded-[32px] bg-gradient-to-tr from-[#1b1a18] via-[#2a241e] to-[#12110f] shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#d4af37]/15 z-0" />
        
        {/* Golden Corner Guards */}
        <div className="absolute top-[-6px] left-[-6px] sm:top-[-12px] sm:left-[-12px] w-8 h-8 sm:w-12 sm:h-12 border-t-[3px] border-l-[3px] border-[#d4af37]/45 rounded-tl-[24px] sm:rounded-tl-[32px] pointer-events-none z-10" />
        <div className="absolute top-[-6px] right-[-6px] sm:top-[-12px] sm:right-[-12px] w-8 h-8 sm:w-12 sm:h-12 border-t-[3px] border-r-[3px] border-[#d4af37]/45 rounded-tr-[24px] sm:rounded-tr-[32px] pointer-events-none z-10" />
        <div className="absolute bottom-[-6px] left-[-6px] sm:bottom-[-12px] sm:left-[-12px] w-8 h-8 sm:w-12 sm:h-12 border-b-[3px] border-l-[3px] border-[#d4af37]/45 rounded-bl-[24px] sm:rounded-bl-[32px] pointer-events-none z-10" />
        <div className="absolute bottom-[-6px] right-[-6px] sm:bottom-[-12px] sm:right-[-12px] w-8 h-8 sm:w-12 sm:h-12 border-b-[3px] border-r-[3px] border-[#d4af37]/45 rounded-br-[24px] sm:rounded-br-[32px] pointer-events-none z-10" />

        {/* Stacked sheets visual effect underneath */}
        <div className="absolute right-[-3px] top-[4px] bottom-[4px] w-[3px] bg-[#fbf9f4] border-r border-neutral-300 rounded-r z-[-1] hidden md:block" />
        <div className="absolute right-[-6px] top-[8px] bottom-[8px] w-[3px] bg-[#f7f4ed] border-r border-neutral-300 rounded-r z-[-2] hidden md:block" />
        <div className="absolute left-[-3px] top-[4px] bottom-[4px] w-[3px] bg-[#fbf9f4] border-l border-neutral-300 rounded-l z-[-1] hidden md:block" />
        <div className="absolute left-[-6px] top-[8px] bottom-[8px] w-[3px] bg-[#f7f4ed] border-l border-neutral-300 rounded-l z-[-2] hidden md:block" />

        {/* The Open Book Content Wrapper */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch rounded-2xl overflow-visible min-h-[560px] md:min-h-[640px]">
          
          {/* Center binding ring components - only on desktop */}
          <div className="hidden md:block">
            <BinderRings position="center" />
          </div>
          {/* Left binding ring components - only on mobile */}
          <div className="block md:hidden">
            <BinderRings position="left" />
          </div>

          {/* Left Page (Cover & Index) */}
          <div
            className={`w-full md:w-1/2 flex-1 md:flex-none bg-[#fdfbf7] p-5 sm:p-8 flex flex-col justify-between relative rounded-2xl md:rounded-r-none md:rounded-l-2xl border-b md:border-b-0 md:border-r border-neutral-200 shadow-inner ${
              mobileView === 'index' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Center shadow page crease for left page */}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/8 to-transparent pointer-events-none border-r border-black/5" />

            <div>
              {/* Restaurant Brand Frame */}
              <div className="border border-double border-neutral-300 p-4 rounded-xl text-center mb-6 bg-white/40 shadow-sm relative">
                {restaurant.logo_url && (
                  <img
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2.5 shadow-sm border border-neutral-200"
                  />
                )}
                <h1 className="font-cinzel text-xl sm:text-2xl font-black text-neutral-800 tracking-wider leading-tight">
                  {restaurant.name}
                </h1>
                {restaurant.tagline && (
                  <p className="font-display italic text-xs text-neutral-500 mt-1">{restaurant.tagline}</p>
                )}
              </div>

              {/* Preferences / Quick Search */}
              <div className="mb-5 space-y-2.5 bg-neutral-100/50 p-3 rounded-xl border border-neutral-200/55">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-1.5 bg-white border border-neutral-300/80 rounded-lg px-2.5 py-1.5 shadow-sm">
                    <Search size={14} className="text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search menu..."
                      className="flex-1 bg-transparent text-xs focus:outline-none text-neutral-700 placeholder-neutral-400 font-medium"
                    />
                  </div>
                  <button
                    onClick={() => setVegOnly(!vegOnly)}
                    className={`flex items-center justify-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg border transition-all ${
                      vegOnly
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-green-700 border-neutral-300/80 hover:bg-green-50/50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Veg
                  </button>
                </div>
              </div>

              {/* Table of Contents / Categories Index */}
              <div className="text-center font-cinzel text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 flex items-center justify-center gap-2">
                <span className="h-[1px] w-6 bg-neutral-200" />
                Menu Index
                <span className="h-[1px] w-6 bg-neutral-200" />
              </div>

              <div className="space-y-1 max-h-[220px] md:max-h-[280px] overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400 italic py-6">No categories defined yet</p>
                ) : (
                  categories.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id)
                        setMobileView('items')
                      }}
                      className={`flex items-baseline justify-between w-full group py-1.5 px-2 rounded-lg text-left transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-neutral-100 text-indigo-600'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wide group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                        <span
                          className="w-1 h-1 rounded-full bg-neutral-400"
                          style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
                        />
                        {cat.name}
                      </span>
                      <span className="flex-1 border-b border-dashed border-neutral-300/70 mx-2 mb-1" />
                      <span className="font-display font-medium italic text-[11px] text-neutral-400">
                        p. {idx + 2}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Book bottom & Restaurant details */}
            <div className="mt-6 pt-4 border-t border-neutral-200/60">
              <div className="flex flex-col gap-1 text-[10px] text-neutral-500 font-medium">
                {restaurant.address && (
                  <div className="flex items-center gap-1 leading-tight">
                    <MapPin size={10} className="flex-shrink-0 text-neutral-400" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {restaurant.phone && (
                    <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                      <Phone size={10} className="text-neutral-400" />
                      {restaurant.phone}
                    </a>
                  )}
                  {restaurant.website && (
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                      <Globe size={10} className="text-neutral-400" />
                      Website
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] text-neutral-400 select-none">
                <span className="font-cinzel tracking-wider">L’AURA MENU</span>
                <span>Page 1</span>
              </div>
            </div>
          </div>

          {/* Right Page (Category Items List) */}
          <div
            className={`w-full md:w-1/2 flex-1 md:flex-none bg-[#fdfbf7] p-5 sm:p-8 flex flex-col justify-between relative rounded-2xl md:rounded-l-none md:rounded-r-2xl border-t md:border-t-0 border-neutral-200 shadow-inner ${
              mobileView === 'items' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Center shadow page crease for right page */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/8 to-transparent pointer-events-none" />
            
            {/* Left binding ring shadow in mobile view */}
            {mobileView === 'items' && (
              <div className="block md:hidden absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/8 to-transparent pointer-events-none" />
            )}

            {/* Back Button for mobile view */}
            {mobileView === 'items' && (
              <button
                onClick={() => setMobileView('index')}
                className="md:hidden self-start flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 mb-4 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 shadow-sm"
              >
                <ArrowLeft size={12} />
                Table of Contents
              </button>
            )}

            <div>
              {/* Category Page Title */}
              <div className="text-center relative">
                <h2 className="font-cinzel text-lg sm:text-xl font-black text-neutral-800 tracking-wide uppercase">
                  {searchQuery ? 'Search Results' : activeCategoryData?.name || 'Menu'}
                </h2>
                <DividerFlourish />
              </div>

              {/* Items Display */}
              <div className="space-y-4 max-h-[320px] md:max-h-[380px] overflow-y-auto pr-1">
                {searchQuery ? (
                  // Search Results list
                  globalMatchingItems.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 italic text-xs">
                      No matching items found across the menu.
                    </div>
                  ) : (
                    globalMatchingItems.map(({ item, categoryName }) => (
                      <div key={item.id} className="group py-2 border-b border-neutral-100 last:border-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <div className="flex items-center gap-1.5">
                            <VegIndicator isVeg={item.is_veg} />
                            <h3 className="font-display font-black text-neutral-800 text-[14px] leading-tight">
                              {item.name}
                            </h3>
                          </div>
                          <span className="flex-grow border-b border-dotted border-neutral-200 mx-2" />
                          <span className="font-display font-extrabold text-neutral-800 text-sm flex-shrink-0">
                            ₹{item.price}
                          </span>
                        </div>
                        <div className="flex justify-between items-start mt-0.5">
                          {item.description && (
                            <p className="text-neutral-500 text-[11px] italic leading-tight max-w-[70%]">
                              {item.description}
                            </p>
                          )}
                          <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded ml-auto">
                            {categoryName}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  // Regular Category items list
                  filteredActiveItems.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 italic text-xs">
                      No items in this category matching preferences.
                    </div>
                  ) : (
                    filteredActiveItems.map(item => (
                      <div key={item.id} className="group py-2.5 border-b border-neutral-100 last:border-0 flex gap-3 items-start">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg object-cover border border-neutral-200/70 shadow-sm flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <div className="flex items-center gap-1.5">
                              <VegIndicator isVeg={item.is_veg} />
                              <h3 className="font-display font-black text-neutral-800 text-[14px] leading-tight">
                                {item.name}
                              </h3>
                            </div>
                            <span className="flex-grow border-b border-dotted border-neutral-200 mx-2" />
                            <span className="font-display font-extrabold text-neutral-800 text-sm flex-shrink-0">
                              ₹{item.price}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-neutral-500 text-[11px] italic mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Book Page Footer Controls */}
            <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between">
              {/* Pagination controls */}
              {!searchQuery && categories.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => turnPage('prev')}
                    disabled={activeCategoryIndex === 0}
                    className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-40 transition-colors shadow-xs"
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-neutral-500 font-cinzel">
                    {activeCategoryIndex + 1} / {categories.length}
                  </span>
                  <button
                    onClick={() => turnPage('next')}
                    disabled={activeCategoryIndex === categories.length - 1}
                    className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-40 transition-colors shadow-xs"
                    title="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div />
              )}
              
              <div className="text-[10px] text-neutral-400 font-medium select-none flex items-center gap-1">
                <span>Powered by</span>
                <a href="/" className="font-bold text-indigo-600 hover:underline">MenuQR</a>
                <span className="mx-1">•</span>
                <span>Page {!searchQuery ? activeCategoryIndex + 2 : '?'}</span>
              </div>
            </div>

            {/* Tactile Bookmarks / Page Tabs on Right Page Edge */}
            {!searchQuery && (
              <div className="hidden md:flex absolute right-[-20px] top-6 bottom-6 w-5 flex-col justify-center pointer-events-auto z-20 gap-1.5">
                {categories.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id)
                      setMobileView('items')
                    }}
                    className={`w-[20px] py-3.5 rounded-r-md shadow-sm border-y border-r border-neutral-300/40 text-[8px] font-cinzel font-black uppercase text-center flex items-center justify-center transition-all hover:w-[26px] active:scale-95 ${
                      activeCategory === cat.id
                        ? 'text-white'
                        : 'bg-[#ebe7df] hover:bg-[#e1ddd4] text-neutral-500'
                    }`}
                    style={{
                      backgroundColor: activeCategory === cat.id ? primaryColor : undefined,
                    }}
                    title={cat.name}
                  >
                    <span className="[writing-mode:vertical-lr] rotate-180 select-none">
                      {cat.name.substring(0, 6)}
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { MapPin, Phone, Globe, Search, ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, X, Plus, Minus, CheckCircle2, PlayCircle, Info, BookOpen, Clock } from 'lucide-react'
import type { Restaurant, MenuCategoryWithItems, MenuItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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
          <div className="absolute left-[3px] w-1.5 h-2 bg-neutral-950/40 rounded-full blur-[0.5px]" />
          <div className="absolute right-[3px] w-1.5 h-2 bg-neutral-950/40 rounded-full blur-[0.5px]" />
          <div className="absolute w-7 h-2.5 bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-500 rounded-full border border-neutral-600/20 shadow-[0_2px_4px_rgba(0,0,0,0.35)]" />
          <div className="absolute left-1 w-1 h-1 bg-neutral-950 rounded-full" />
          <div className="absolute right-1 w-1 h-1 bg-neutral-950 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
  return match ? match[1] : null
}

export default function PublicMenuClient({ restaurant, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [mobileView, setMobileView] = useState<'index' | 'items'>('index')
  
  const [cart, setCart] = useState<{ [itemId: string]: { item: MenuItem; quantity: number } }>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState('')

  // Read ?table= query parameter if present on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tableFromUrl = params.get('table')
      if (tableFromUrl) {
        setTableNumber(tableFromUrl)
      }
    }
  }, [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const supabase = createClient()
  const primaryColor = restaurant.primary_color || '#6366F1'
  const bgImage = restaurant.background_image_url
  const [previewTheme, setPreviewTheme] = useState<string>(restaurant.theme || 'book')
  const themeLayout = previewTheme

  // Refs for scroll containers — reset to top when category changes
  const bookItemsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bookItemsScrollRef.current?.scrollTo({ top: 0 })
    // For modern/grid layouts the items area is the page itself — scroll window to below sticky header
    if (themeLayout !== 'book') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [activeCategory, themeLayout])

  const activeCategoryIndex = useMemo(() => categories.findIndex(c => c.id === activeCategory), [categories, activeCategory])
  const activeCategoryData = useMemo(() => categories.find(c => c.id === activeCategory), [categories, activeCategory])

  const filteredActiveItems = useMemo(() => {
    if (!activeCategoryData) return []
    return activeCategoryData.menu_items.filter(item => {
      const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesVeg = vegFilter === 'all' ? true : (vegFilter === 'veg' ? item.is_veg : !item.is_veg)
      return matchesSearch && matchesVeg
    })
  }, [activeCategoryData, searchQuery, vegFilter])

  const globalMatchingItems = useMemo(() => {
    if (!searchQuery) return []
    const results: { item: MenuItem; categoryName: string }[] = []
    categories.forEach(cat => {
      cat.menu_items.forEach(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesVeg = vegFilter === 'all' ? true : (vegFilter === 'veg' ? item.is_veg : !item.is_veg)
        if (matchesSearch && matchesVeg) results.push({ item, categoryName: cat.name })
      })
    })
    return results
  }, [categories, searchQuery, vegFilter])

  const turnPage = (direction: 'prev' | 'next') => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory)
    if (direction === 'prev' && currentIndex > 0) setActiveCategory(categories[currentIndex - 1].id)
    else if (direction === 'next' && currentIndex < categories.length - 1) setActiveCategory(categories[currentIndex + 1].id)
  }

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev[item.id]
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1
        }
      }
    })
    toast.success('Added to order')
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const existing = prev[itemId]
      if (!existing) return prev
      const newQuantity = existing.quantity + delta
      if (newQuantity <= 0) {
        const newCart = { ...prev }
        delete newCart[itemId]
        return newCart
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: newQuantity }
      }
    })
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)
  const cartItemCount = cartItems.reduce((sum, { quantity }) => sum + quantity, 0)

  const submitOrder = async () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter your table number')
      return
    }
    if (cartItems.length === 0) return

    setIsSubmitting(true)
    try {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        restaurant_id: restaurant.id,
        table_number: tableNumber,
        total_amount: cartTotal,
        status: 'pending'
      }).select().single()

      if (orderError) throw orderError

      const orderItemsToInsert = cartItems.map(({ item, quantity }) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity,
        price: item.price,
        item_name: item.name
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert)
      if (itemsError) throw itemsError

      setOrderSuccess(true)
      setCart({})
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItemDetails = (item: MenuItem) => (
    <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/60 mt-2 mb-2 animate-in fade-in slide-in-from-top-2 text-sm backdrop-blur-sm">
      {item.preparation_time && (
        <div className="mb-3">
          <strong className="text-neutral-700 text-xs uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-600" /> Preparation Time
          </strong>
          <p className="text-neutral-700 text-[13px] font-semibold">{item.preparation_time}</p>
        </div>
      )}
      {item.ingredients && (
        <div className="mb-3">
          <strong className="text-neutral-700 text-xs uppercase tracking-wider block mb-1">Ingredients</strong>
          <p className="text-neutral-600 text-[13px]">{item.ingredients}</p>
        </div>
      )}
      {item.video_url && extractYouTubeId(item.video_url) && (
        <div>
          <strong className="text-neutral-700 text-xs uppercase tracking-wider block mb-1 flex items-center gap-1">
            <PlayCircle size={14} /> Recipe Video
          </strong>
          <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-neutral-200 shadow-inner">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${extractYouTubeId(item.video_url)}`}
              title="Recipe Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {!item.ingredients && !item.video_url && !item.preparation_time && (
        <p className="text-neutral-400 text-xs italic">No additional details available.</p>
      )}
    </div>
  )

  const renderItemCard = (item: MenuItem, categoryName?: string, isGrid = false) => {
    const isExpanded = expandedItemId === item.id
    const qtyInCart = cart[item.id]?.quantity || 0

    if (isGrid) {
      return (
        <div key={item.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm flex flex-col transition-all hover:shadow-md">
          {item.image_url ? (
            <div className="relative h-40 w-full overflow-hidden bg-neutral-100 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-1 rounded shadow-sm">
                <VegIndicator isVeg={item.is_veg} />
              </div>
            </div>
          ) : (
            <div className="pt-4 px-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
               <VegIndicator isVeg={item.is_veg} />
            </div>
          )}
          
          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-2 mb-1 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
              <h3 className="font-display font-black text-neutral-800 text-[15px] leading-tight">
                {item.name}
              </h3>
              <span className="font-display font-extrabold text-neutral-800 text-[15px] flex-shrink-0" style={{ color: primaryColor }}>
                ₹{item.price}
              </span>
            </div>
            
            {item.description && (
              <p className="text-neutral-500 text-[12px] leading-relaxed line-clamp-2 mb-2 cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
                {item.description}
              </p>
            )}

            {item.preparation_time && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 rounded-md w-fit mb-2 shadow-xs">
                <Clock size={12} className="text-amber-600 flex-shrink-0" />
                <span>{item.preparation_time}</span>
              </div>
            )}

            {(item.ingredients || item.video_url || item.preparation_time) && !isExpanded && (
               <button onClick={() => setExpandedItemId(item.id)} className="text-[10px] text-neutral-400 flex items-center gap-1 mb-2 hover:text-neutral-600 transition-colors w-fit">
                 <Info size={12} /> More details
               </button>
            )}

            {isExpanded && renderItemDetails(item)}
            
            <div className="mt-auto pt-3 flex justify-between items-center">
               {categoryName && (
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded">
                    {categoryName}
                  </span>
                )}
                {!categoryName && <div />}
                
                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-1.5 py-1">
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1) }} className="text-neutral-600 hover:text-red-500 p-1 bg-white rounded-md shadow-sm">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm min-w-[2ch] text-center text-neutral-800">{qtyInCart}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1) }} className="text-white p-1 rounded-md shadow-sm" style={{ backgroundColor: primaryColor }}>
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(item) }}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg text-white shadow-sm hover:brightness-110 transition-all active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ADD
                  </button>
                )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={item.id} className="group py-3 border-b border-neutral-200/60 last:border-0 flex flex-col gap-2">
        <div className="flex gap-3 items-start cursor-pointer" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
          {item.image_url && (
            <img src={item.image_url} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-neutral-200 shadow-sm flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <VegIndicator isVeg={item.is_veg} />
                <h3 className="font-display font-black text-neutral-800 text-[15px] sm:text-[16px] leading-tight">
                  {item.name}
                </h3>
                {(item.ingredients || item.video_url || item.preparation_time) && (
                  <span className="text-neutral-400"><Info size={14} /></span>
                )}
              </div>
              <span className="font-display font-extrabold text-neutral-800 text-[15px] sm:text-[16px] flex-shrink-0">
                ₹{item.price}
              </span>
            </div>
            {item.description && (
              <p className="text-neutral-500 text-[12px] sm:text-[13px] mt-1 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              {item.preparation_time && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 rounded-md shadow-xs">
                  <Clock size={11} className="text-amber-600 flex-shrink-0" />
                  <span>{item.preparation_time}</span>
                </span>
              )}
              {categoryName && (
                <span className="text-[9px] uppercase tracking-wider font-bold bg-neutral-200/50 px-1.5 py-0.5 rounded text-neutral-600">
                  {categoryName}
                </span>
              )}
            </div>
          </div>
        </div>

        {isExpanded && renderItemDetails(item)}

        <div className="flex justify-end items-center mt-1">
          {qtyInCart > 0 ? (
            <div className="flex items-center gap-3 bg-white border border-neutral-300 rounded-lg px-2 py-1 shadow-sm">
              <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1) }} className="text-neutral-500 hover:text-red-500 p-1">
                <Minus size={14} />
              </button>
              <span className="font-bold text-sm min-w-[1ch] text-center">{qtyInCart}</span>
              <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1) }} className="text-neutral-500 hover:text-green-500 p-1">
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(item) }}
              className="text-xs font-bold px-4 py-1.5 rounded-lg border hover:bg-opacity-90 transition-colors shadow-sm"
              style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}10` }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderHeaderInfo = () => (
    <div className="flex items-center gap-3">
      {restaurant.logo_url && (
        <img
          src={restaurant.logo_url}
          alt={restaurant.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm border-2 border-white"
        />
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-cinzel text-lg sm:text-xl font-black text-neutral-900 tracking-wide leading-tight truncate">
          {restaurant.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          {restaurant.tagline && (
            <span className="font-display italic text-[11px] text-neutral-500 font-medium">{restaurant.tagline}</span>
          )}
          {restaurant.address && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
              <MapPin size={11} className="text-neutral-400 flex-shrink-0" />
              {restaurant.address}
            </span>
          )}
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium hover:text-indigo-600 transition-colors">
              <Phone size={11} className="text-neutral-400 flex-shrink-0" />
              {restaurant.phone}
            </a>
          )}
          {(restaurant.opening_time || restaurant.closing_time) && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
              <Clock size={11} className="text-neutral-400 flex-shrink-0" />
              {restaurant.opening_time || '??'} - {restaurant.closing_time || '??'}
            </span>
          )}
          {restaurant.delivery_platforms && Array.isArray(restaurant.delivery_platforms) && restaurant.delivery_platforms.length > 0 && (
            restaurant.delivery_platforms.map((platform, idx) => (
              <a
                key={idx}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded shadow-sm transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <Globe size={10} />
                {platform.name}
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderFilters = () => (
    <div className="flex gap-2 max-w-4xl w-full">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-xl px-3 py-2 shadow-sm flex-1">
        <Search size={15} className="text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search menu..."
          className="flex-1 bg-transparent text-sm focus:outline-none text-neutral-800 placeholder-neutral-400 font-medium min-w-0"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-neutral-600">
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="flex bg-white/90 backdrop-blur-md rounded-xl border border-neutral-200/80 p-1 shadow-sm flex-shrink-0">
        <button 
          onClick={() => setVegFilter('all')} 
          className={`px-3 text-xs font-bold py-1.5 rounded-lg transition-colors ${vegFilter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          All
        </button>
        <button 
          onClick={() => setVegFilter('veg')} 
          className={`px-3 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center gap-1 ${vegFilter === 'veg' ? 'bg-green-600 text-white shadow-sm' : 'text-green-700 hover:bg-green-50'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${vegFilter === 'veg' ? 'bg-white' : 'bg-green-600'}`} /> Veg
        </button>
        <button 
          onClick={() => setVegFilter('nonveg')} 
          className={`px-3 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center gap-1 ${vegFilter === 'nonveg' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 hover:bg-red-50'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${vegFilter === 'nonveg' ? 'bg-white' : 'bg-red-600'}`} /> Non-Veg
        </button>
      </div>
    </div>
  )

  const renderCategoryPills = () => (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-4 sm:px-0 scroll-smooth snap-x">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => {
            setActiveCategory(cat.id)
            setSearchQuery('')
          }}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all snap-center shadow-sm border ${
            activeCategory === cat.id && !searchQuery
              ? 'text-white border-transparent'
              : 'bg-white/90 backdrop-blur-sm text-neutral-600 border-neutral-200/80 hover:bg-white'
          }`}
          style={{ backgroundColor: activeCategory === cat.id && !searchQuery ? primaryColor : undefined }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )

  // Layouts
  
  const renderBookLayout = () => {
    return (
      <div 
        className="min-h-screen py-6 px-3 sm:px-6 flex items-center justify-center font-sans"
        style={{
          backgroundImage: `radial-gradient(ellipse at top, #262626, #171717, #000)`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

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
          <div 
            className="relative z-10 flex flex-col md:flex-row items-stretch rounded-2xl overflow-visible min-h-[600px] md:min-h-[680px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: bgImage ? `url(${bgImage})` : undefined,
              backgroundColor: bgImage ? undefined : '#fdfbf7'
            }}
          >
            
            <div className="hidden md:block">
              <BinderRings position="center" />
            </div>
            <div className="block md:hidden">
              <BinderRings position="left" />
            </div>

            {/* Left Page (Cover & Index) */}
            <div
              className={`w-full md:w-1/2 flex-1 md:flex-none p-5 sm:p-8 flex flex-col justify-between relative rounded-2xl md:rounded-r-none md:rounded-l-2xl border-b md:border-b-0 md:border-r border-neutral-200 shadow-inner ${
                bgImage ? 'bg-[#fdfbf7]/85 backdrop-blur-[2px]' : 'bg-[#fdfbf7]'
              } ${
                mobileView === 'index' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/8 to-transparent pointer-events-none border-r border-black/5" />

              <div>
                <div className="border border-double border-neutral-300 p-4 rounded-xl text-center mb-6 bg-white/40 shadow-sm relative">
                  <div className="text-center">
                    {restaurant.logo_url && (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto mb-3 shadow-sm border border-neutral-200"
                      />
                    )}
                    <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-neutral-800 tracking-wider leading-tight">
                      {restaurant.name}
                    </h1>
                    {restaurant.tagline && (
                      <p className="font-display italic text-sm text-neutral-500 mt-2">{restaurant.tagline}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px] text-neutral-600 font-medium">
                      {restaurant.address && (
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-neutral-200 shadow-sm">
                          <MapPin size={12} className="text-neutral-400" />
                          <span>{restaurant.address}</span>
                        </div>
                      )}
                      {restaurant.phone && (
                        <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-neutral-200 shadow-sm hover:text-indigo-600">
                          <Phone size={12} className="text-neutral-400" />
                          <span>{restaurant.phone}</span>
                        </a>
                      )}
                      {(restaurant.opening_time || restaurant.closing_time) && (
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-neutral-200 shadow-sm">
                          <Clock size={12} className="text-neutral-400" />
                          <span>
                            {restaurant.opening_time || '??'} - {restaurant.closing_time || '??'}
                          </span>
                        </div>
                      )}
                    </div>

                    {restaurant.delivery_platforms && Array.isArray(restaurant.delivery_platforms) && restaurant.delivery_platforms.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {restaurant.delivery_platforms.map((platform, idx) => (
                          <a
                            key={idx}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded shadow-sm transition-colors hover:brightness-110"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Globe size={10} />
                            {platform.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-5 bg-neutral-100/50 p-3 rounded-xl border border-neutral-200/55">
                  <div className="flex items-center gap-1.5 bg-white border border-neutral-300/80 rounded-lg px-2.5 py-2 shadow-sm mb-3">
                    <Search size={16} className="text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search menu..."
                      className="flex-1 bg-transparent text-sm focus:outline-none text-neutral-700 placeholder-neutral-400 font-medium"
                    />
                  </div>
                  
                  <div className="flex bg-white rounded-lg border border-neutral-300/80 p-1 shadow-sm">
                    <button 
                      onClick={() => setVegFilter('all')} 
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${vegFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setVegFilter('veg')} 
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${vegFilter === 'veg' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-50'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${vegFilter === 'veg' ? 'bg-white' : 'bg-green-600'}`} /> Veg
                    </button>
                    <button 
                      onClick={() => setVegFilter('nonveg')} 
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${vegFilter === 'nonveg' ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-50'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${vegFilter === 'nonveg' ? 'bg-white' : 'bg-red-600'}`} /> Non-Veg
                    </button>
                  </div>
                </div>

                <div className="text-center font-cinzel text-[11px] uppercase tracking-widest text-neutral-400 font-bold mb-3 flex items-center justify-center gap-2">
                  <span className="h-[1px] w-6 bg-neutral-200" />
                  Menu Categories
                  <span className="h-[1px] w-6 bg-neutral-200" />
                </div>

                <div className="space-y-1.5 flex-1 min-h-[300px] md:min-h-0 md:max-h-[350px] overflow-y-auto pr-1">
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
                        className={`flex items-baseline justify-between w-full group py-2 px-3 rounded-xl text-left transition-colors border ${
                          activeCategory === cat.id
                            ? 'bg-neutral-100 border-neutral-200 shadow-inner text-indigo-600'
                            : 'bg-transparent border-transparent text-neutral-700 hover:bg-neutral-50 hover:border-neutral-100'
                        }`}
                      >
                        <span className="font-cinzel text-sm sm:text-base font-bold tracking-wide group-hover:translate-x-0.5 transition-transform flex items-center gap-2">
                          <BookOpen size={14} className={activeCategory === cat.id ? 'opacity-100' : 'opacity-0'} style={{ color: primaryColor }} />
                          {cat.name}
                        </span>
                        <span className="flex-1 border-b border-dashed border-neutral-300/70 mx-2 mb-1" />
                        <span className="font-display font-medium italic text-xs text-neutral-400 flex items-center gap-1">
                          p. {idx + 2}
                          <ChevronRight size={13} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200/60">
                {/* Mobile Prominent Next Page Button */}
                <button
                  onClick={() => {
                    if (categories.length > 0 && !activeCategory) {
                      setActiveCategory(categories[0].id)
                    }
                    setMobileView('items')
                  }}
                  className="md:hidden w-full py-3 mb-3 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Open Menu (Page 2)</span>
                  <ChevronRight size={15} />
                </button>

                <div className="mt-2 flex justify-between items-center text-[10px] text-neutral-400 select-none">
                  <span className="font-cinzel tracking-wider uppercase">{restaurant.name}</span>
                  <button
                    onClick={() => {
                      if (categories.length > 0 && !activeCategory) {
                        setActiveCategory(categories[0].id)
                      }
                      setMobileView('items')
                    }}
                    className="md:hidden font-bold flex items-center gap-1 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <span>Next Page ➔</span>
                  </button>
                  <span className="hidden md:inline">Page 1</span>
                </div>
              </div>
            </div>

            {/* Right Page (Category Items List) */}
            <div
              className={`w-full md:w-1/2 flex-1 md:flex-none p-5 sm:p-8 flex flex-col justify-between relative rounded-2xl md:rounded-l-none md:rounded-r-2xl border-t md:border-t-0 border-neutral-200 shadow-inner ${
                bgImage ? 'bg-[#fdfbf7]/85 backdrop-blur-[2px]' : 'bg-[#fdfbf7]'
              } ${
                mobileView === 'items' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/8 to-transparent pointer-events-none" />
              
              {mobileView === 'items' && (
                <div className="block md:hidden absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/8 to-transparent pointer-events-none" />
              )}

              {mobileView === 'items' && (
                <div className="md:hidden flex items-center justify-between gap-2 mb-3">
                  <button
                    onClick={() => setMobileView('index')}
                    className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Table of Contents</span>
                  </button>
                  <span className="text-[11px] font-cinzel font-bold text-neutral-500">
                    Page {!searchQuery ? activeCategoryIndex + 2 : '?'} of {categories.length + 1}
                  </span>
                </div>
              )}

              {/* Mobile Quick Category Switcher Tabs */}
              {mobileView === 'items' && !searchQuery && categories.length > 1 && (
                <div className="flex md:hidden overflow-x-auto hide-scrollbar gap-1.5 pb-2 mb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-all border shrink-0 cursor-pointer ${
                        activeCategory === cat.id
                          ? 'text-white border-transparent shadow-xs'
                          : 'bg-white/80 text-neutral-600 border-neutral-200 hover:bg-white'
                      }`}
                      style={{
                        backgroundColor: activeCategory === cat.id ? primaryColor : undefined,
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="text-center relative">
                  <h2 className="font-cinzel text-xl sm:text-2xl font-black text-neutral-800 tracking-wide uppercase">
                    {searchQuery ? 'Search Results' : activeCategoryData?.name || 'Menu'}
                  </h2>
                  <DividerFlourish />
                </div>

                <div ref={bookItemsScrollRef} className="space-y-2 flex-1 min-h-[400px] md:min-h-0 md:max-h-[460px] overflow-y-auto pr-1">
                  {searchQuery ? (
                    globalMatchingItems.length === 0 ? (
                      <div className="text-center py-12 text-neutral-400 italic text-sm">
                        No matching items found across the menu.
                      </div>
                    ) : (
                      globalMatchingItems.map(({ item, categoryName }) => renderItemCard(item, categoryName, false))
                    )
                  ) : (
                    filteredActiveItems.length === 0 ? (
                      <div className="text-center py-12 text-neutral-400 italic text-sm">
                        No items in this category matching preferences.
                      </div>
                    ) : (
                      filteredActiveItems.map(item => renderItemCard(item, undefined, false))
                    )
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between">
                {!searchQuery && categories.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (activeCategoryIndex === 0) {
                          setMobileView('index')
                        } else {
                          turnPage('prev')
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      <span className="md:hidden text-[11px]">{activeCategoryIndex === 0 ? 'Cover' : 'Prev'}</span>
                    </button>
                    <span className="text-xs font-bold text-neutral-500 font-cinzel px-1">
                      {activeCategoryIndex + 1} / {categories.length}
                    </span>
                    <button
                      onClick={() => turnPage('next')}
                      disabled={activeCategoryIndex === categories.length - 1}
                      className="px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <span className="md:hidden text-[11px]">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div />
                )}
                
                <div className="text-[10px] text-neutral-400 font-medium select-none flex items-center gap-1">
                  <span>Page {!searchQuery ? activeCategoryIndex + 2 : '?'}</span>
                </div>
              </div>

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

  const renderModernOrGrid = (isGrid: boolean) => {
    return (
      <div 
        className="relative min-h-screen font-sans"
        style={{
          backgroundColor: bgImage ? undefined : '#fdfbf7'
        }}
      >
        {/* Fixed background layer */}
        {bgImage && (
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        {/* Subtle overlay */}
        <div className="fixed inset-0 bg-white/50 -z-10 pointer-events-none" />

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
            {renderHeaderInfo()}
            <div className="mt-3">
              {renderFilters()}
            </div>
            {!searchQuery && (
              <div className="mt-2 -mx-4 sm:mx-0">
                {renderCategoryPills()}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
          {searchQuery ? (
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-neutral-800 tracking-wide uppercase mb-6 text-center">
                Search Results
              </h2>
              {globalMatchingItems.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-neutral-200/50 text-neutral-500 font-medium">
                  No matching items found across the menu.
                </div>
              ) : (
                <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : "space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-neutral-200/50 shadow-sm"}>
                  {globalMatchingItems.map(({ item, categoryName }) => renderItemCard(item, categoryName, isGrid))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-neutral-800 tracking-wide uppercase mb-6 text-center flex items-center justify-center gap-4">
                <span className="h-[1px] flex-1 max-w-[60px] bg-neutral-300" />
                {activeCategoryData?.name}
                <span className="h-[1px] flex-1 max-w-[60px] bg-neutral-300" />
              </h2>
              {filteredActiveItems.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-neutral-200/50 text-neutral-500 font-medium">
                  No items in this category matching preferences.
                </div>
              ) : (
                <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : "space-y-3 bg-white/60 backdrop-blur-sm p-2 sm:p-4 rounded-3xl border border-neutral-200/50 shadow-sm"}>
                  {filteredActiveItems.map(item => renderItemCard(item, undefined, isGrid))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 1. THEME: MIDNIGHT LUXURY (dark-luxe) ──
  const renderDarkLuxeLayout = () => {
    return (
      <div className="relative min-h-screen bg-[#07090e] text-slate-100 font-sans pb-28">
        {/* Subtle Ambient Gold Glow */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 pointer-events-none -z-10 opacity-30"
          style={{ background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.2) 0%, transparent 70%)' }}
        />

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-amber-500/20 shadow-xl">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              {restaurant.logo_url && (
                <img src={restaurant.logo_url} alt={restaurant.name} className="size-12 rounded-full object-cover border-2 border-amber-400/40 shadow-md" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-cinzel text-lg sm:text-xl font-black text-amber-200 tracking-wider truncate">
                  {restaurant.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-400">
                  {restaurant.tagline && <span className="italic text-amber-300/70">{restaurant.tagline}</span>}
                  {restaurant.address && <span>{restaurant.address}</span>}
                  {restaurant.phone && <a href={`tel:${restaurant.phone}`} className="hover:text-amber-300">{restaurant.phone}</a>}
                </div>
              </div>
            </div>

            {/* Search + Veg Filter */}
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-2">
                <Search size={15} className="text-amber-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search dishes, cocktails, wine..."
                  className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                />
              </div>
              <div className="flex gap-1 bg-slate-900 border border-amber-500/25 p-1 rounded-xl">
                {(['all', 'veg', 'nonveg'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setVegFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      vegFilter === filter
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter === 'nonveg' ? 'Non-Veg' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            {!searchQuery && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-3 -mx-4 sm:mx-0 px-4 sm:px-0">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                        : 'bg-slate-900/80 text-amber-200/80 border-amber-500/25 hover:border-amber-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {(searchQuery ? globalMatchingItems.map(g => g.item) : filteredActiveItems).map(item => {
              const qty = cart[item.id]?.quantity || 0
              return (
                <div
                  key={item.id}
                  className="bg-[#0e1320]/90 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex gap-3.5 items-start flex-1 min-w-0">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="size-20 rounded-xl object-cover border border-amber-500/30 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <VegIndicator isVeg={item.is_veg} />
                        <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                      )}
                      {item.preparation_time && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                          <Clock size={11} className="text-amber-400" />
                          <span>{item.preparation_time}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="font-cinzel font-black text-amber-300 text-lg tabular-nums">
                      ₹{item.price}
                    </span>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 rounded-xl px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-amber-300 hover:text-white p-1">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-white min-w-[2ch] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-amber-300 hover:text-white p-1">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── 2. THEME: RUSTIC CHALKBOARD (chalkboard) ──
  const renderChalkboardLayout = () => {
    return (
      <div className="relative min-h-screen bg-[#1c2128] text-stone-100 font-sans pb-28">
        <div className="sticky top-0 z-40 bg-[#151921]/95 backdrop-blur-md border-b-2 border-dashed border-stone-600 shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
            <div className="text-center mb-3">
              <h1 className="font-cinzel text-xl sm:text-2xl font-black text-stone-100 tracking-widest uppercase">
                ❦ {restaurant.name} ❦
              </h1>
              {restaurant.tagline && <p className="italic text-xs text-stone-400 mt-0.5">{restaurant.tagline}</p>}
            </div>

            {/* Category selection */}
            {!searchQuery && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 sm:mx-0 px-4 sm:px-0">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                      activeCategory === cat.id
                        ? 'bg-stone-100 text-stone-900 border-white shadow-sm font-black'
                        : 'bg-stone-800/80 text-stone-300 border-stone-600 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {(searchQuery ? globalMatchingItems.map(g => g.item) : filteredActiveItems).map(item => {
              const qty = cart[item.id]?.quantity || 0
              return (
                <div
                  key={item.id}
                  className="bg-stone-900/60 border-2 border-dashed border-stone-700/80 hover:border-stone-500 rounded-2xl p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex gap-3.5 items-start flex-1 min-w-0">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="size-18 rounded-xl object-cover border border-stone-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <VegIndicator isVeg={item.is_veg} />
                        <h3 className="font-cinzel font-black text-stone-100 text-base">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                      )}
                      {item.preparation_time && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-stone-800 border border-stone-600 px-2 py-0.5 rounded-md">
                          <Clock size={11} className="text-amber-400" />
                          <span>{item.preparation_time}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                    <span className="font-mono font-black text-amber-300 text-lg tabular-nums">
                      ₹{item.price}
                    </span>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-stone-800 border border-stone-600 rounded-lg px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-stone-300 hover:text-white p-1">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-stone-100 min-w-[2ch] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-stone-300 hover:text-white p-1">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-stone-100 hover:bg-white text-stone-900 font-black text-xs px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-transform active:scale-95"
                      >
                        + Add Dish
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── 3. THEME: NORDIC BENTO (bento) ──
  const renderBentoLayout = () => {
    return (
      <div className="relative min-h-screen bg-[#f4f1ea] text-stone-900 font-sans pb-28">
        <div className="sticky top-0 z-40 bg-[#f4f1ea]/90 backdrop-blur-xl border-b-2 border-stone-900 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">BENTO MENU</span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight leading-tight uppercase">
                  {restaurant.name}
                </h1>
              </div>
              <span className="text-xs font-black bg-stone-950 text-white px-3 py-1 rounded-full border border-stone-900">
                TABLE SERVICE
              </span>
            </div>

            {/* Category Pills */}
            {!searchQuery && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 sm:mx-0 px-4 sm:px-0">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-black transition-all border-2 shrink-0 ${
                      activeCategory === cat.id
                        ? 'bg-stone-950 text-white border-stone-950 shadow-[2px_2px_0px_#000]'
                        : 'bg-white text-stone-800 border-stone-950 shadow-[2px_2px_0px_#000] hover:bg-stone-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(searchQuery ? globalMatchingItems.map(g => g.item) : filteredActiveItems).map(item => {
              const qty = cart[item.id]?.quantity || 0
              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-stone-950 rounded-3xl p-5 shadow-[4px_4px_0px_#1c1917] hover:shadow-[6px_6px_0px_#1c1917] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between"
                >
                  <div>
                    {item.image_url && (
                      <div className="h-44 w-full rounded-2xl overflow-hidden border-2 border-stone-950 mb-3 bg-stone-100">
                        <img src={item.image_url} alt={item.name} className="size-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <VegIndicator isVeg={item.is_veg} />
                        <h3 className="font-black text-stone-950 text-base tracking-tight">{item.name}</h3>
                      </div>
                      <span className="font-black text-stone-950 text-base tabular-nums bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-300 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                    {item.preparation_time ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-md">
                        <Clock size={11} className="text-stone-500" />
                        <span>{item.preparation_time}</span>
                      </span>
                    ) : <div />}

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-stone-100 border-2 border-stone-950 rounded-xl px-2 py-1 shadow-[2px_2px_0px_#000]">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 font-black text-stone-950">
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-sm text-stone-950 min-w-[2ch] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 font-black text-stone-950">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-stone-950 hover:bg-stone-800 text-white font-black text-xs px-5 py-2 rounded-xl border-2 border-stone-950 shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                      >
                        + Select
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── 4. THEME: STREET POP DINER (street) ──
  const renderStreetLayout = () => {
    return (
      <div className="relative min-h-screen bg-[#fffdf2] text-slate-900 font-sans pb-28">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-black shadow-[0_4px_0px_#000]">
          <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🔥</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase leading-none">
                    {restaurant.name}
                  </h1>
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                    FRESH STREET KITCHEN
                  </span>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            {!searchQuery && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 sm:mx-0 px-4 sm:px-0">
                {categories.map((cat, idx) => {
                  const colors = ['bg-yellow-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-pink-400', 'bg-orange-400']
                  const activeColor = colors[idx % colors.length]
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black transition-all border-2 border-black shrink-0 ${
                        activeCategory === cat.id
                          ? `${activeColor} text-black shadow-[3px_3px_0px_#000] scale-105`
                          : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(searchQuery ? globalMatchingItems.map(g => g.item) : filteredActiveItems).map(item => {
              const qty = cart[item.id]?.quantity || 0
              return (
                <div
                  key={item.id}
                  className="bg-white border-3 border-black rounded-3xl p-4.5 shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all flex flex-col justify-between"
                >
                  <div>
                    {item.image_url && (
                      <div className="h-44 w-full rounded-2xl overflow-hidden border-2 border-black mb-3 bg-slate-100">
                        <img src={item.image_url} alt={item.name} className="size-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <VegIndicator isVeg={item.is_veg} />
                        <h3 className="font-black text-black text-base uppercase tracking-tight">{item.name}</h3>
                      </div>
                      <span className="font-black text-black text-base bg-yellow-300 border-2 border-black px-2.5 py-0.5 rounded-xl shadow-[2px_2px_0px_#000] shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-slate-700 text-xs font-medium leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between">
                    {item.preparation_time ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-950 bg-orange-100 border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#000]">
                        <Clock size={11} className="text-orange-600" />
                        <span>{item.preparation_time}</span>
                      </span>
                    ) : <div />}

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-yellow-300 border-2 border-black rounded-xl px-2 py-1 shadow-[2px_2px_0px_#000]">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 font-black text-black">
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-sm text-black min-w-[2ch] text-center">{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 font-black text-black">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-red-500 hover:bg-red-600 text-white font-black text-xs px-5 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                      >
                        + GRAB IT
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Live Demo Theme Switcher Bar for testing all 7 themes */}
      {restaurant.slug === 'demo-restaurant' && (
        <aside aria-label="Demo theme selector" className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-1.5 max-w-[95vw] overflow-x-auto hide-scrollbar">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider pl-1 pr-1 shrink-0">
            🎨 Theme:
          </span>
          {[
            { id: 'book', label: 'Classic Book' },
            { id: 'dark-luxe', label: 'Midnight Luxe' },
            { id: 'chalkboard', label: 'Chalkboard' },
            { id: 'bento', label: 'Nordic Bento' },
            { id: 'street', label: 'Street Pop' },
            { id: 'modern', label: 'Modern List' },
            { id: 'grid', label: 'Photo Grid' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setPreviewTheme(t.id)}
              className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                previewTheme === t.id
                  ? 'bg-white text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </aside>
      )}

      {cartItemCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 md:bottom-6 right-4 md:right-6 z-50 rounded-full shadow-2xl p-4 text-white hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 animate-bounce-short"
          style={{ backgroundColor: primaryColor }}
        >
          <ShoppingBag size={24} />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] uppercase font-bold opacity-80">View Order</span>
            <span className="text-sm font-black">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</span>
          </div>
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black flex items-center gap-2 text-slate-800">
                <ShoppingBag size={20} className="text-indigo-600" style={{ color: primaryColor }} />
                Your Order
              </h2>
              <button onClick={() => { setIsCartOpen(false); setOrderSuccess(false); }} className="text-slate-400 hover:text-slate-700 bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {orderSuccess ? (
                <div className="text-center py-8 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Order Placed!</h3>
                  <p className="text-slate-500 text-base">Your order has been sent to the kitchen. It will be served to Table <strong className="text-slate-800">{tableNumber}</strong> shortly.</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Your order is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(({ item, quantity }) => (
                    <div key={item.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex-1 pr-4">
                        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">₹{item.price} x {quantity}</div>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-500 hover:text-red-500 p-1.5 bg-white rounded-lg shadow-sm">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm min-w-[2ch] text-center text-slate-700">{quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-white p-1.5 rounded-lg shadow-sm hover:brightness-110" style={{ backgroundColor: primaryColor }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t-2 border-dashed border-slate-200">
                    <div className="flex justify-between items-center font-black text-xl text-slate-800">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Table Number</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="e.g. 12 or A3"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-lg font-bold text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {!orderSuccess && cartItems.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="w-full text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Submit Order</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {themeLayout === 'book' && renderBookLayout()}
      {themeLayout === 'modern' && renderModernOrGrid(false)}
      {themeLayout === 'grid' && renderModernOrGrid(true)}
      {themeLayout === 'dark-luxe' && renderDarkLuxeLayout()}
      {themeLayout === 'chalkboard' && renderChalkboardLayout()}
      {themeLayout === 'bento' && renderBentoLayout()}
      {themeLayout === 'street' && renderStreetLayout()}
      {!['book', 'modern', 'grid', 'dark-luxe', 'chalkboard', 'bento', 'street'].includes(themeLayout) && renderBookLayout()}
    </>
  )
}

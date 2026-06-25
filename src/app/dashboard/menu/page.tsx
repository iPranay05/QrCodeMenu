'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp, Upload, Leaf, Drumstick, Database, AlertTriangle, Sparkles } from 'lucide-react'
import type { Restaurant, MenuCategory, MenuItem } from '@/lib/types'

export default function MenuBuilderPage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<(MenuCategory & { menu_items: MenuItem[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)
  
  const [dbError, setDbError] = useState<'tables_missing' | 'restaurant_missing' | null>(null)
  const [initName, setInitName] = useState('')
  const [creatingRest, setCreatingRest] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [itemSearchQuery, setItemSearchQuery] = useState('')

  const emptyItemForm = {
    name: '', description: '', price: '', is_veg: true, is_available: true
  }
  const [itemForm, setItemForm] = useState(emptyItemForm)

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id)
    }
  }, [categories, activeCategoryId])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: rests, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (restError) {
        console.error('Error fetching restaurant:', restError)
        if (restError.code === 'PGRST205' || restError.message?.includes('relation "public.restaurants" does not exist') || restError.message?.includes('relation "restaurants" does not exist')) {
          setDbError('tables_missing')
        } else {
          toast.error(restError.message)
        }
        setLoading(false)
        return
      }

      if (!rests || rests.length === 0) {
        setDbError('restaurant_missing')
        setLoading(false)
        return
      }

      const rest = rests[0]
      setRestaurant(rest)
      setDbError(null)

      if (rest) {
        const { data: cats, error: catsError } = await supabase
          .from('menu_categories')
          .select('*, menu_items(*)')
          .eq('restaurant_id', rest.id)
          .order('display_order')
        
        if (catsError) {
          console.error('Error fetching categories:', catsError)
          if (catsError.code === 'PGRST205' || catsError.message?.includes('relation "public.menu_categories" does not exist')) {
            setDbError('tables_missing')
          }
        } else {
          const fetchedCats = (cats as any) || []
          setCategories(fetchedCats)
          const ids = new Set<string>(fetchedCats.map((c: any) => String(c.id)))
          setExpandedCategories(ids)
          if (fetchedCats.length > 0) {
            setActiveCategoryId(prev => {
              if (prev && ids.has(prev)) return prev
              return fetchedCats[0].id
            })
          } else {
            setActiveCategoryId(null)
          }
        }
      }
    } catch (err: any) {
      console.error('Unexpected loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInitialRestaurant = async () => {
    if (!initName.trim()) {
      toast.error('Please enter a restaurant name')
      return
    }
    setCreatingRest(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        setCreatingRest(false)
        return
      }

      const slug = `${initName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`
      const { data, error } = await supabase.from('restaurants').insert({
        user_id: user.id,
        name: initName.trim(),
        slug,
        primary_color: '#6366F1'
      }).select().single()

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('relation "public.restaurants" does not exist')) {
          setDbError('tables_missing')
        } else {
          toast.error(error.message)
        }
      } else {
        setRestaurant(data)
        setDbError(null)
        toast.success('Restaurant profile created! 🎉')
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setCreatingRest(false)
    }
  }

  const addCategory = async () => {
    if (!newCategoryName.trim() || !restaurant) return
    setAddingCategory(true)
    const { data, error } = await supabase.from('menu_categories').insert({
      restaurant_id: restaurant.id,
      name: newCategoryName.trim(),
      display_order: categories.length,
    }).select().single()
    if (error) toast.error(error.message)
    else {
      setCategories(prev => [...prev, { ...data, menu_items: [] }])
      setExpandedCategories(prev => new Set([...prev, data.id]))
      setActiveCategoryId(data.id)
      setNewCategoryName('')
      toast.success('Category added!')
    }
    setAddingCategory(false)
  }

  const updateCategory = async (id: string) => {
    const { error } = await supabase.from('menu_categories').update({ name: editingCategoryName }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editingCategoryName } : c))
      setEditingCategoryId(null)
      toast.success('Category updated!')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its items?')) return
    const { error } = await supabase.from('menu_categories').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      setCategories(prev => {
        const remaining = prev.filter(c => c.id !== id)
        setActiveCategoryId(prevActive => {
          if (prevActive === id) {
            return remaining[0]?.id || null
          }
          return prevActive
        })
        return remaining
      })
      toast.success('Category deleted')
    }
  }

  const addItem = async (categoryId: string) => {
    if (!itemForm.name.trim() || !restaurant) return
    const { data, error } = await supabase.from('menu_items').insert({
      category_id: categoryId,
      restaurant_id: restaurant.id,
      name: itemForm.name.trim(),
      description: itemForm.description,
      price: parseFloat(itemForm.price) || 0,
      is_veg: itemForm.is_veg,
      is_available: itemForm.is_available,
      display_order: categories.find(c => c.id === categoryId)?.menu_items.length || 0,
    }).select().single()

    if (error) toast.error(error.message)
    else {
      setCategories(prev => prev.map(c => c.id === categoryId
        ? { ...c, menu_items: [...c.menu_items, data as MenuItem] }
        : c
      ))
      setItemForm(emptyItemForm)
      setAddingItemFor(null)
      toast.success('Item added!')
    }
  }

  const updateItem = async () => {
    if (!editingItem) return
    const { error } = await supabase.from('menu_items').update({
      name: editingItem.name,
      description: editingItem.description,
      price: editingItem.price,
      is_veg: editingItem.is_veg,
      is_available: editingItem.is_available,
    }).eq('id', editingItem.id)

    if (error) toast.error(error.message)
    else {
      setCategories(prev => prev.map(c => ({
        ...c,
        menu_items: c.menu_items.map(i => i.id === editingItem.id ? editingItem : i)
      })))
      setEditingItem(null)
      toast.success('Item updated!')
    }
  }

  const deleteItem = async (categoryId: string, itemId: string) => {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
    if (error) toast.error(error.message)
    else {
      setCategories(prev => prev.map(c => c.id === categoryId
        ? { ...c, menu_items: c.menu_items.filter(i => i.id !== itemId) }
        : c
      ))
      toast.success('Item deleted')
    }
  }

  const uploadItemImage = async (file: File, itemId: string, categoryId: string) => {
    setUploadingItemId(itemId)
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('menu-items').upload(filename, file, { upsert: true })
    if (error) { toast.error('Upload failed'); setUploadingItemId(null); return }
    const { data: { publicUrl } } = supabase.storage.from('menu-items').getPublicUrl(filename)
    await supabase.from('menu_items').update({ image_url: publicUrl }).eq('id', itemId)
    setCategories(prev => prev.map(c => c.id === categoryId
      ? { ...c, menu_items: c.menu_items.map(i => i.id === itemId ? { ...i, image_url: publicUrl } : i) }
      : c
    ))
    toast.success('Image uploaded!')
    setUploadingItemId(null)
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (dbError === 'tables_missing') {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-xl shadow-red-50">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Database Setup Required ⚠️</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            The application database tables do not exist in your Supabase project. To configure your database, please open the 
            <a 
              href="https://supabase.com/dashboard/project/zzxksexzlsoalzcvfjes/sql/new" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 font-bold hover:underline mx-1"
            >
              Supabase SQL Editor
            </a> 
            and run the code inside <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono text-xs">supabase-setup.sql</code>.
          </p>
          <div className="bg-white rounded-2xl border border-red-100 p-5 text-left text-xs text-gray-500 space-y-2">
            <div className="font-bold text-gray-700 uppercase tracking-wider mb-1">Steps:</div>
            <p>1. Open your Supabase project dashboard.</p>
            <p>2. Go to the <strong>SQL Editor</strong> in the left sidebar.</p>
            <p>3. Copy the entire contents of the <code>supabase-setup.sql</code> file in this codebase.</p>
            <p>4. Paste and click <strong>Run</strong>.</p>
            <p>5. Once successful, refresh this page to get started!</p>
          </div>
          <button
            onClick={() => { setLoading(true); loadData(); }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm hover:scale-105 transition-transform"
          >
            Check Again / Refresh
          </button>
        </div>
      </div>
    )
  }

  if (dbError === 'restaurant_missing' || !restaurant) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 pb-28 sm:pb-12 max-w-md mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Create Restaurant Profile</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Enter your restaurant's name to initialize your digital QR code menu builder.
          </p>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Restaurant Name</label>
              <input
                id="init-restaurant-name"
                type="text"
                value={initName}
                onChange={e => setInitName(e.target.value)}
                placeholder="e.g. Gourmet Bistro"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-800"
              />
            </div>
            <button
              onClick={createInitialRestaurant}
              disabled={creatingRest || !initName.trim()}
              className="bg-slate-900 hover:bg-slate-800 w-full text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
            >
              {creatingRest ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Initialize Builder ✨</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0]
  const filteredItems = activeCategory?.menu_items.filter(item => 
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(itemSearchQuery.toLowerCase())
  ) || []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto fade-in-up">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Menu Builder</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Create categories and menu items for your digital QR code menu.</p>
        </div>
        {categories.length > 0 && (
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-4 py-2.5 rounded-2xl self-start sm:self-center shadow-sm">
            {categories.reduce((acc, c) => acc + c.menu_items.length, 0)} items across {categories.length} categories
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
          <div className="text-6xl mb-6 animate-bounce">🍽️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your First Category</h3>
          <p className="text-sm text-gray-500 mb-6">Every menu needs categories like "Starters", "Mains", or "Desserts" to group your delicious dishes.</p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              id="new-category-input"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="e.g. Starters"
              className="flex-1 px-4 py-3 rounded-2xl glass-input text-sm text-gray-900 font-medium"
            />
            <button
              onClick={addCategory}
              disabled={addingCategory || !newCategoryName.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Categories List */}
          <div className="md:col-span-4 space-y-6">
            {/* Mobile Category Selector (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-3 md:hidden scrollbar-none">
              {categories.map(category => {
                const isActive = category.id === activeCategoryId
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategoryId(category.id)
                      setItemSearchQuery('')
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                      isActive
                        ? 'bg-slate-900 text-white border-transparent shadow-sm'
                        : 'bg-white/60 text-gray-700 hover:bg-white border-slate-200'
                    }`}
                  >
                    {category.name} ({category.menu_items.length})
                  </button>
                )
              })}
              <button
                onClick={() => {
                  const name = prompt('Enter new category name:')
                  if (name && name.trim()) {
                    setNewCategoryName(name)
                    // We can assign and run because state updates are batched, but direct function call uses local ref
                    // For safety, let's just trigger category addition manually or let user use desktop pane
                  }
                }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 border-dashed flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Desktop Categories Panel */}
            <div className="hidden md:block glass-panel rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">{categories.length} total</span>
              </div>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {categories.map(category => {
                  const isActive = category.id === activeCategoryId
                  return (
                    <div
                      key={category.id}
                      onClick={() => {
                        setActiveCategoryId(category.id)
                        setItemSearchQuery('')
                      }}
                      className={`group relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                        isActive
                          ? 'bg-slate-900 text-white border-transparent shadow-md hover:scale-[1.01]'
                          : 'bg-white/40 hover:bg-white/80 border-slate-200 text-gray-700 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-6">
                        <span className={`text-base flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`}>🍽️</span>
                        {editingCategoryId === category.id ? (
                          <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                            <input
                              value={editingCategoryName}
                              onChange={e => setEditingCategoryName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') updateCategory(category.id)
                                if (e.key === 'Escape') setEditingCategoryId(null)
                              }}
                              className="px-2 py-1 rounded-lg bg-white text-gray-900 border border-gray-200 text-xs font-semibold focus:outline-none w-full"
                              autoFocus
                            />
                            <button onClick={() => updateCategory(category.id)} className="text-green-600 hover:bg-green-50 p-1 rounded-lg">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingCategoryId(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded-lg">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="truncate font-bold text-sm tracking-tight">{category.name}</div>
                        )}
                      </div>

                      {editingCategoryId !== category.id && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                          }`}>
                            {category.menu_items.length}
                          </span>
                          
                          {/* Desktop hover actions */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-150 absolute right-2 bg-gradient-to-l from-inherit pl-4 py-1.5 rounded-r-2xl" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name) }}
                              className={`p-1.5 rounded-lg transition-all ${isActive ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-white'}`}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className={`p-1.5 rounded-lg transition-all ${isActive ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-white'}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Category Section at Bottom of Desktop Panel */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <input
                  id="new-category-input"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="New category..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-gray-900 font-medium"
                />
                <button
                  onClick={addCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                  className="bg-slate-900 hover:bg-slate-800 w-full text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm transition-all"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Menu Items list */}
          <div className="md:col-span-8 space-y-6">
            {!activeCategory ? (
              <div className="text-center py-16 bg-white/40 border border-white/60 rounded-3xl p-8 shadow-xl text-gray-400">
                <p className="text-sm font-semibold">Select a category on the left to see its items.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 shadow-sm">
                {/* Active Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🔥</span>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">{activeCategory.name}</h2>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                        {activeCategory.menu_items.length} items
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Add, edit, or remove items in this category.</p>
                  </div>
                  
                  {/* Category edit actions for mobile / screen header */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => { setEditingCategoryId(activeCategory.id); setEditingCategoryName(activeCategory.name) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-gray-600 hover:text-indigo-600 hover:bg-slate-50 transition-all bg-white/80"
                    >
                      <Edit3 size={13} /> Rename
                    </button>
                    <button
                      onClick={() => deleteCategory(activeCategory.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 text-xs font-bold text-red-500 hover:bg-red-50 transition-all bg-white/80"
                    >
                      <Trash2 size={13} /> Delete Category
                    </button>
                  </div>
                </div>

                {/* Search Menu Items inside active category */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={e => setItemSearchQuery(e.target.value)}
                    placeholder={`Search items in ${activeCategory.name}...`}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-gray-900 font-medium"
                  />
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white/20 rounded-2xl border border-dashed border-slate-200 mb-6">
                    <p className="text-sm font-semibold mb-1">No items found</p>
                    <p className="text-xs text-gray-500">
                      {itemSearchQuery ? 'Try adjusting your search query' : 'Add your first menu item below!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {filteredItems.map(item => {
                      const isEditing = editingItem?.id === item.id
                      return (
                        <div
                          key={item.id}
                          className={`bg-white/40 border rounded-2xl p-4 transition-all duration-300 hover:bg-white/60 hover:shadow-md ${
                            isEditing ? 'border-indigo-300 bg-white/80 shadow-md' : 'border-slate-200'
                          }`}
                        >
                          {isEditing && editingItem ? (
                            /* Editing Item Form */
                            <div className="space-y-3.5">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Name *</label>
                                <input
                                  value={editingItem.name}
                                  onChange={e => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-gray-900 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Price (₹) *</label>
                                <input
                                  type="number"
                                  value={editingItem.price}
                                  onChange={e => setEditingItem(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : prev)}
                                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-gray-900 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Description</label>
                                <textarea
                                  value={editingItem.description || ''}
                                  onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : prev)}
                                  placeholder="Description..."
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-gray-900 font-medium resize-none"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editingItem.is_veg}
                                    onChange={e => setEditingItem(prev => prev ? { ...prev, is_veg: e.target.checked } : prev)}
                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
                                  />
                                  <Leaf size={12} className="text-green-500" /> Veg
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editingItem.is_available}
                                    onChange={e => setEditingItem(prev => prev ? { ...prev, is_available: e.target.checked } : prev)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                  />
                                  Available
                                </label>
                              </div>
                              <div className="flex gap-2 pt-1.5 border-t border-slate-100">
                                <button
                                  onClick={updateItem}
                                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-green-600 transition-all shadow-md shadow-green-100"
                                >
                                  <Save size={12} /> Save
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-300 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Display Item Card */
                            <div className="flex flex-col h-full justify-between">
                              <div className="flex gap-3">
                                {/* Image / Upload section */}
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 group">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-slate-300 bg-slate-50">
                                      <span className="text-2xl">🍱</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (fileInputRef.current) {
                                        fileInputRef.current.dataset.itemId = item.id
                                        fileInputRef.current.dataset.categoryId = activeCategory.id
                                        fileInputRef.current.click()
                                      }
                                    }}
                                    className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                  >
                                    <Upload size={12} className="text-white" />
                                  </button>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={item.is_veg ? 'veg-indicator' : 'non-veg-indicator'} />
                                    <span className={`font-bold text-sm text-gray-950 tracking-tight ${!item.is_available ? 'line-through text-gray-400' : ''}`}>
                                      {item.name}
                                    </span>
                                    {!item.is_available && (
                                      <span className="text-[9px] font-bold bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                                        Unavailable
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2.5">
                                <span className="font-black text-slate-900 text-base">₹{item.price}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-white/80 transition-all"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(activeCategory.id, item.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-white/80 transition-all"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add Item Form / Button inside Active Category */}
                {addingItemFor === activeCategory.id ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Item Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Name *</label>
                        <input
                          id="new-item-name"
                          value={itemForm.name}
                          onChange={e => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Paneer Tikka"
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-gray-900 font-medium"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Price (₹) *</label>
                        <input
                          id="new-item-price"
                          type="number"
                          value={itemForm.price}
                          onChange={e => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="249"
                          className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-gray-900 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Description</label>
                      <textarea
                        id="new-item-desc"
                        value={itemForm.description}
                        onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-gray-900 font-medium resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemForm.is_veg}
                          onChange={e => setItemForm(prev => ({ ...prev, is_veg: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
                        />
                        <Leaf size={12} className="text-green-500" /> Veg
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                      <button
                        id="save-item-btn"
                        onClick={() => addItem(activeCategory.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus size={12} />
                        <span>Add Item</span>
                      </button>
                      <button
                        onClick={() => { setAddingItemFor(null); setItemForm(emptyItemForm) }}
                        className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id={`add-item-btn-${activeCategory.id}`}
                    onClick={() => { setAddingItemFor(activeCategory.id); setItemForm(emptyItemForm) }}
                    className="w-full border border-dashed border-slate-300 text-slate-600 rounded-2xl py-4 text-xs font-bold hover:bg-white/60 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    Add Menu Item to {activeCategory.name}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for item images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async e => {
          const file = e.target.files?.[0]
          const itemId = fileInputRef.current?.dataset.itemId
          const categoryId = fileInputRef.current?.dataset.categoryId
          if (file && itemId && categoryId) {
            await uploadItemImage(file, itemId, categoryId)
          }
          if (fileInputRef.current) fileInputRef.current.value = ''
        }}
      />
    </div>
  )
}

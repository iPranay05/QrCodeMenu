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

  const emptyItemForm = {
    name: '', description: '', price: '', is_veg: true, is_available: true
  }
  const [itemForm, setItemForm] = useState(emptyItemForm)

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
          setCategories((cats as any) || [])
          const ids = new Set((cats || []).map((c: any) => c.id))
          setExpandedCategories(ids)
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
        primary_color: '#F97316'
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
      setCategories(prev => prev.filter(c => c.id !== id))
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
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
              className="text-orange-500 font-bold hover:underline mx-1"
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
            className="btn-gradient text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-lg shadow-orange-200 hover:scale-105 transition-transform"
          >
            Check Again / Refresh
          </button>
        </div>
      </div>
    )
  }

  if (dbError === 'restaurant_missing' || !restaurant) {
    return (
      <div className="p-6 lg:p-10 max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl shadow-orange-50 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-orange-100">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Create Restaurant Profile</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your restaurant's name to initialize your digital QR code menu builder.
          </p>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Name</label>
              <input
                id="init-restaurant-name"
                type="text"
                value={initName}
                onChange={e => setInitName(e.target.value)}
                placeholder="e.g. Gourmet Bistro"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-gray-900"
              />
            </div>
            <button
              onClick={createInitialRestaurant}
              disabled={creatingRest || !initName.trim()}
              className="btn-gradient w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200"
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

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Menu Builder</h1>
          <p className="text-gray-500 mt-1">Add categories and menu items for your restaurant.</p>
        </div>
        <div className="text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
          {categories.reduce((acc, c) => acc + c.menu_items.length, 0)} items across {categories.length} categories
        </div>
      </div>

      {/* Add Category */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Add New Category</div>
        <div className="flex gap-3">
          <input
            id="new-category-input"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="e.g. Starters, Mains, Desserts..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
          />
          <button
            id="add-category-btn"
            onClick={addCategory}
            disabled={addingCategory || !newCategoryName.trim()}
            className="btn-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md shadow-orange-200 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🍽️</div>
          <div className="text-xl font-bold mb-2">Your menu is empty</div>
          <div className="text-sm">Start by adding a category above.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-50 to-rose-50 border-b border-gray-100">
                {editingCategoryId === category.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editingCategoryName}
                      onChange={e => setEditingCategoryName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border-2 border-orange-300 focus:outline-none text-sm font-bold"
                      autoFocus
                    />
                    <button onClick={() => updateCategory(category.id)} className="text-green-600 hover:text-green-700 p-1">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditingCategoryId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{category.menu_items.length} items</span>
                  </div>
                )}
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name) }}
                    className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-white"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-white"
                  >
                    {expandedCategories.has(category.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Items */}
              {expandedCategories.has(category.id) && (
                <div className="p-4 space-y-3">
                  {category.menu_items.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {editingItem?.id === item.id ? (
                        /* Edit Item Form */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-500 mb-1 block">Name</label>
                              <input
                                value={editingItem.name}
                                onChange={e => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹)</label>
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={e => setEditingItem(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : prev)}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                              />
                            </div>
                          </div>
                          <input
                            value={editingItem.description || ''}
                            onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : prev)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                          />
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={editingItem.is_veg} onChange={e => setEditingItem(prev => prev ? { ...prev, is_veg: e.target.checked } : prev)} className="accent-green-500" />
                              <Leaf size={14} className="text-green-500" /> Vegetarian
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={editingItem.is_available} onChange={e => setEditingItem(prev => prev ? { ...prev, is_available: e.target.checked } : prev)} className="accent-orange-500" />
                              Available
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={updateItem} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-green-600">
                              <Save size={14} /> Save
                            </button>
                            <button onClick={() => setEditingItem(null)} className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Item Display */
                        <div className="flex items-center gap-3">
                          {/* Image */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-orange-100 flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-orange-300">
                                <span className="text-2xl">🍱</span>
                              </div>
                            )}
                            <button
                              onClick={() => { fileInputRef.current && (fileInputRef.current.dataset.itemId = item.id) && (fileInputRef.current.dataset.categoryId = category.id); fileInputRef.current?.click() }}
                              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <Upload size={14} className="text-white" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={item.is_veg ? 'veg-indicator' : 'non-veg-indicator'} />
                              <span className={`font-semibold text-gray-900 ${!item.is_available ? 'line-through text-gray-400' : ''}`}>{item.name}</span>
                              {!item.is_available && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Unavailable</span>}
                            </div>
                            {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-orange-600">₹{item.price}</span>
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => deleteItem(category.id, item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Item Form */}
                  {addingItemFor === category.id ? (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">New Item</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
                          <input
                            id="new-item-name"
                            value={itemForm.name}
                            onChange={e => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Paneer Tikka"
                            className="w-full px-3 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-400 focus:outline-none text-sm bg-white"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹) *</label>
                          <input
                            id="new-item-price"
                            type="number"
                            value={itemForm.price}
                            onChange={e => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="249"
                            className="w-full px-3 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-400 focus:outline-none text-sm bg-white"
                          />
                        </div>
                      </div>
                      <input
                        id="new-item-desc"
                        value={itemForm.description}
                        onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-400 focus:outline-none text-sm bg-white"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={itemForm.is_veg}
                            onChange={e => setItemForm(prev => ({ ...prev, is_veg: e.target.checked }))}
                            className="accent-green-500"
                          />
                          <Leaf size={14} className="text-green-500" /> Vegetarian
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          id="save-item-btn"
                          onClick={() => addItem(category.id)}
                          className="btn-gradient text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-orange-200"
                        >
                          <Plus size={14} />
                          <span>Add Item</span>
                        </button>
                        <button
                          onClick={() => { setAddingItemFor(null); setItemForm(emptyItemForm) }}
                          className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      id={`add-item-btn-${category.id}`}
                      onClick={() => { setAddingItemFor(category.id); setItemForm(emptyItemForm) }}
                      className="w-full border-2 border-dashed border-orange-200 text-orange-500 rounded-xl py-3 text-sm font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add Item to {category.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
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

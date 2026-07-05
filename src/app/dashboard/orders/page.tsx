'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Clock, CheckCircle2, ChefHat, XCircle, ChevronRight, AlertTriangle } from 'lucide-react'
import type { Order, OrderItem } from '@/lib/types'

type OrderWithItems = Order & { order_items: OrderItem[] }

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (!restaurantId) return

    // Set up Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          // On any change to orders, just reload all orders for simplicity and to get nested items
          loadOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // First get all restaurants for this user
      const { data: restsData, error: restError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)

      if (restError) {
        console.error('Error fetching restaurant:', restError)
        toast.error('Failed to load restaurant data: ' + restError.message)
        setLoading(false)
        return
      }
      
      if (!restsData || restsData.length === 0) {
        setLoading(false)
        return
      }

      const restIds = restsData.map(r => r.id)
      setRestaurantId(restIds[0]) // Keep for realtime fallback if needed, but better to watch all

      // Get orders with items for all user's restaurants
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .in('restaurant_id', restIds)
        .order('created_at', { ascending: false })

      if (ordersError) {
        if (ordersError.code === 'PGRST205' || ordersError.message?.includes('relation') || ordersError.message?.includes('orders')) {
          setDbError(true)
        } else {
          toast.error('Failed to load orders')
        }
      } else {
        setOrders(ordersData as OrderWithItems[] || [])
        setDbError(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Order marked as ${status}`)
      loadOrders()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-xl shadow-red-50">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Database Setup Required</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            The <code>orders</code> table is missing. Please run the provided SQL script in the Supabase SQL Editor.
          </p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled')

  const renderOrderCard = (order: OrderWithItems) => (
    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
        <div>
          <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Table {order.table_number}
          </span>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-900">₹{order.total_amount.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {order.order_items?.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-slate-700"><span className="font-semibold text-indigo-600">{item.quantity}x</span> {item.item_name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {order.status === 'pending' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <ChefHat size={14} /> Accept & Prepare
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <CheckCircle2 size={14} /> Mark Complete
          </button>
        )}
        {(order.status === 'pending' || order.status === 'preparing') && (
          <button
            onClick={() => updateOrderStatus(order.id, 'cancelled')}
            className="flex-none bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Orders</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage incoming orders from tables in real-time.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-200/60">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Clock className="text-blue-500" size={20} />
            <h2 className="font-bold text-slate-800 text-lg">Pending ({pendingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            {pendingOrders.map(renderOrderCard)}
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">No pending orders</div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-200/60">
          <div className="flex items-center gap-2 mb-4 px-2">
            <ChefHat className="text-amber-500" size={20} />
            <h2 className="font-bold text-slate-800 text-lg">Preparing ({preparingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            {preparingOrders.map(renderOrderCard)}
            {preparingOrders.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">No orders in preparation</div>
            )}
          </div>
        </div>

        {/* Completed/History Column */}
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-200/60 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 mb-4 px-2">
            <CheckCircle2 className="text-green-500" size={20} />
            <h2 className="font-bold text-slate-800 text-lg">Recent ({completedOrders.length})</h2>
          </div>
          <div className="space-y-4">
            {completedOrders.slice(0, 10).map(renderOrderCard)}
            {completedOrders.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">No recent orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Clock, CheckCircle2, ChefHat, XCircle, AlertTriangle, ClipboardList, Bell } from 'lucide-react'
import type { Order, OrderItem } from '@/lib/types'

type OrderWithItems = Order & { order_items: OrderItem[] }

function timeAgo(dateStr: string): string {
  const now = new Date()
  const past = new Date(dateStr)
  const diffMs = now.getTime() - past.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return past.toLocaleDateString()
}

function OrderCard({ order, onUpdateStatus }: { order: OrderWithItems; onUpdateStatus: (id: string, status: Order['status']) => void; isNew?: boolean }) {
  const isNew = useRef(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    // Pulse if created within last 10 seconds
    const diff = Date.now() - new Date(order.created_at).getTime()
    if (diff < 10000 && order.status === 'pending') {
      isNew.current = true
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 6000)
      return () => clearTimeout(t)
    }
  }, [order.created_at, order.status])

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-blue-50 border-blue-200',
    preparing: 'bg-amber-50 border-amber-200',
    completed: 'bg-emerald-50 border-emerald-100',
    cancelled: 'bg-slate-50 border-slate-200',
  }

  return (
    <div
      className={`relative border rounded-2xl p-4 shadow-sm transition-all duration-300 ${statusColors[order.status]} ${
        pulse ? 'ring-2 ring-blue-400 ring-offset-1 animate-pulse-border' : ''
      }`}
    >
      {pulse && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
            <Bell size={10} className="text-white" />
          </span>
        </span>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
        <div>
          <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            Table {order.table_number}
          </span>
          <div className="text-[11px] text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
            <Clock size={10} className="text-slate-400" />
            {timeAgo(order.created_at)}
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-slate-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-black text-slate-900 text-base">₹{order.total_amount.toFixed(2)}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{order.status}</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-1.5 mb-4">
        {order.order_items?.map(item => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-medium">
              <span className="font-black text-indigo-600 mr-1">{item.quantity}×</span>
              {item.item_name}
            </span>
            <span className="text-slate-500 font-semibold text-xs">₹{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChefHat size={14} />
            Accept & Prepare
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={14} />
            Mark Complete
          </button>
        )}
        {(order.status === 'pending' || order.status === 'preparing') && (
          <button
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-red-100"
          >
            <XCircle size={14} />
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyColumn({ icon: Icon, color, message }: { icon: typeof Clock; color: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-3 opacity-40`}>
        <Icon size={22} />
      </div>
      <p className="text-slate-400 text-sm font-semibold">{message}</p>
    </div>
  )
}

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantIds, setRestaurantIds] = useState<string[]>([])
  const [dbError, setDbError] = useState(false)
  const prevOrderIds = useRef<Set<string>>(new Set())

  const loadOrders = useCallback(async (isFirstLoad = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      const ids = restsData.map(r => r.id)
      setRestaurantIds(ids)

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .in('restaurant_id', ids)
        .order('created_at', { ascending: false })

      if (ordersError) {
        if (ordersError.code === 'PGRST205' || ordersError.message?.includes('relation') || ordersError.message?.includes('orders')) {
          setDbError(true)
        } else {
          toast.error('Failed to load orders')
        }
      } else {
        const newOrders = (ordersData as OrderWithItems[]) || []

        // Detect new pending orders (not on first load)
        if (!isFirstLoad && prevOrderIds.current.size > 0) {
          const newPending = newOrders.filter(
            o => o.status === 'pending' && !prevOrderIds.current.has(o.id)
          )
          if (newPending.length > 0) {
            toast.custom(
              () => (
                <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm">
                  <Bell size={16} className="text-blue-400" />
                  🔔 {newPending.length} new order{newPending.length > 1 ? 's' : ''} received!
                </div>
              ),
              { duration: 5000 }
            )
            // Browser notification (if permission granted)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('New Order!', {
                body: `${newPending.length} new order${newPending.length > 1 ? 's' : ''} received at ${newPending[0]?.table_number ? `Table ${newPending[0].table_number}` : 'your restaurant'}.`,
              })
            }
          }
        }

        // Update tracked IDs
        prevOrderIds.current = new Set(newOrders.map(o => o.id))
        setOrders(newOrders)
        setDbError(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Initial load
  useEffect(() => {
    loadOrders(true)
  }, [loadOrders])

  // Ask for browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Realtime subscription — watch ALL user's restaurants
  useEffect(() => {
    if (restaurantIds.length === 0) return

    const channel = supabase
      .channel('live-orders-all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // Only reload if the changed order belongs to one of the user's restaurants
          const record = (payload.new || payload.old) as { restaurant_id?: string }
          if (record?.restaurant_id && restaurantIds.includes(record.restaurant_id)) {
            loadOrders(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantIds, loadOrders, supabase])

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      const labels: Record<string, string> = {
        preparing: '🍳 Order accepted — kitchen notified',
        completed: '✅ Order marked as complete',
        cancelled: '❌ Order cancelled',
      }
      toast.success(labels[status] || `Order marked as ${status}`)
      loadOrders(false)
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto fade-in-up pb-28 md:pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Live Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage incoming orders from tables in real-time.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live Realtime
          </div>

          <div className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ClipboardList size={12} />
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Kanban Board — single col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Pending */}
        <div className={`rounded-3xl p-4 border transition-all ${pendingOrders.length > 0 ? 'bg-blue-50/40 border-blue-200/70' : 'bg-slate-50/50 border-slate-200/60'}`}>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={18} />
              <h2 className="font-bold text-slate-800 text-base">Pending</h2>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${pendingOrders.length > 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {pendingOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
            ))}
            {pendingOrders.length === 0 && (
              <EmptyColumn icon={Clock} color="bg-blue-100 text-blue-400" message="No pending orders" />
            )}
          </div>
        </div>

        {/* Preparing */}
        <div className={`rounded-3xl p-4 border transition-all ${preparingOrders.length > 0 ? 'bg-amber-50/40 border-amber-200/70' : 'bg-slate-50/50 border-slate-200/60'}`}>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <ChefHat className="text-amber-500" size={18} />
              <h2 className="font-bold text-slate-800 text-base">Preparing</h2>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${preparingOrders.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {preparingOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
            ))}
            {preparingOrders.length === 0 && (
              <EmptyColumn icon={ChefHat} color="bg-amber-100 text-amber-400" message="No orders in preparation" />
            )}
          </div>
        </div>

        {/* Completed / Cancelled */}
        <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-200/60 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <h2 className="font-bold text-slate-800 text-base">Recent</h2>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-500">
              {completedOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {completedOrders.slice(0, 10).map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
            ))}
            {completedOrders.length === 0 && (
              <EmptyColumn icon={CheckCircle2} color="bg-emerald-100 text-emerald-400" message="No recent orders" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

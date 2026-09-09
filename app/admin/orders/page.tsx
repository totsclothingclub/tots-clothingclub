'use client'

import React, { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '@/lib/supabase/data-service'
import { Order } from '@/lib/types'
import {
  PackageCheck,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Download
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/cloudinary-utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    setLoading(true)
    const data = await getAllOrders()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    await updateOrderStatus(orderId, newStatus)
    loadOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, order_status: newStatus } : null))
    }
  }

  const statusColors: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'Processing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
    'Returned': 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.customer_phone && o.customer_phone.includes(q))
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 pb-16">

      {/* ── Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Order Management</h1>
          <p className="text-xs text-mid mt-1">
            Track customer shipments, view invoice line items, and manage fulfillment workflow.
          </p>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto no-scrollbar pb-2">
        {[
          { key: 'all', label: 'All Orders', count: orders.length },
          { key: 'Pending', label: 'Pending', count: orders.filter(o => o.order_status === 'Pending').length },
          { key: 'Processing', label: 'Processing', count: orders.filter(o => o.order_status === 'Processing').length },
          { key: 'Shipped', label: 'Shipped', count: orders.filter(o => o.order_status === 'Shipped').length },
          { key: 'Delivered', label: 'Delivered', count: orders.filter(o => o.order_status === 'Delivered').length },
          { key: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.order_status === 'Cancelled').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${statusFilter === tab.key
                ? 'bg-charcoal text-cream shadow-xs'
                : 'bg-white text-mid border border-border hover:text-charcoal'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.key ? 'bg-gold text-charcoal' : 'bg-beige text-mid'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, email, or phone..."
            className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-xs text-mid ml-auto hidden sm:inline">
          Showing <strong className="text-charcoal">{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#f5f1ea] text-mid uppercase font-semibold border-b border-border">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-mid">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-mid">
                    <p className="font-serif text-lg text-charcoal mb-1">No orders found</p>
                    <p className="text-xs text-mid">No orders match the selected filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#faf7f2] transition-colors">
                    {/* Order ID */}
                    <td className="p-4 font-mono font-semibold text-charcoal">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="hover:underline text-wine font-bold"
                      >
                        {order.order_number}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <span className="font-semibold text-charcoal block">{order.customer_name}</span>
                      <span className="text-[11px] text-mid">{order.customer_email}</span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-mid">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Payment */}
                    <td className="p-4">
                      <span className="inline-block bg-[#f5efe6] px-2 py-0.5 rounded text-charcoal text-[11px] font-medium">
                        {order.payment_method}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-4 font-serif font-bold text-wine text-sm">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>

                    {/* Status dropdown */}
                    <td className="p-4">
                      <select
                        value={order.order_status}
                        onChange={e => handleStatusChange(order.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${statusColors[order.order_status] || 'bg-gray-100'
                          }`}
                        aria-label="Update Order Status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal hover:text-wine bg-beige/60 hover:bg-beige px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Modal / Drawer ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl border border-border shadow-panel max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeup">

            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-[#faf7f2]">
              <div>
                <span className="text-[10px] uppercase tracking-widest2 font-semibold text-gold block">
                  Order Details
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-mid mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-mid hover:text-charcoal rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f8f6f0] rounded-xl border border-border">
                <div className="space-y-1">
                  <span className="font-semibold text-charcoal uppercase tracking-wider text-[10px] block">
                    Customer Information
                  </span>
                  <p className="font-medium text-charcoal">{selectedOrder.customer_name}</p>
                  <p className="text-mid flex items-center gap-1"><Mail size={12} /> {selectedOrder.customer_email}</p>
                  <p className="text-mid flex items-center gap-1"><Phone size={12} /> {selectedOrder.customer_phone}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-charcoal uppercase tracking-wider text-[10px] block">
                    Shipping Address
                  </span>
                  <p className="text-mid flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {typeof selectedOrder.shipping_address === 'string'
                        ? selectedOrder.shipping_address
                        : [
                            selectedOrder.shipping_address?.street,
                            selectedOrder.shipping_address?.apartment,
                            selectedOrder.shipping_address?.city,
                            selectedOrder.shipping_address?.state,
                            selectedOrder.shipping_address?.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h4 className="font-serif text-base font-semibold text-charcoal">
                    Items Ordered ({selectedOrder.items?.length || 0})
                  </h4>
                  <span className="text-[11px] text-mid">
                    Total Units: {selectedOrder.items?.reduce((s, i) => s + (Number(i.quantity) || 1), 0) || 1}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-border rounded-xl shadow-2xs hover:border-gold/50 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.image_url || '/images/placeholder.jpg'}
                            alt={item.product_name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=300&auto=format&fit=crop&q=80'
                            }}
                            className="w-12 h-16 object-cover rounded-lg border border-border shrink-0 bg-[#faf7f2] shadow-2xs"
                          />
                          <div className="space-y-1 min-w-0">
                            <p className="font-semibold text-charcoal truncate">{item.product_name}</p>
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              <span className="inline-flex items-center font-bold px-2 py-0.5 rounded bg-[#f5f1ea] border border-border text-charcoal">
                                Size: {item.size || 'Standard'}
                              </span>
                              {item.color && item.color !== 'Standard' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                                  Color: {item.color}
                                </span>
                              )}
                              <span className="font-semibold text-mid">
                                Qty: <strong className="text-charcoal">{item.quantity}</strong>
                              </span>
                              <span className="text-stone-400">•</span>
                              <span className="text-mid">₹{Number(item.price).toLocaleString('en-IN')} each</span>
                            </div>
                          </div>
                        </div>
                        <span className="font-serif font-bold text-wine text-sm shrink-0 pl-3">
                          ₹{(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#faf7f2] border border-border/80 rounded-xl text-center text-mid text-xs">
                      <p className="font-medium text-charcoal">No individual item rows saved for this historical order.</p>
                      <p className="text-[11px] text-mid mt-0.5">Total order amount: ₹{selectedOrder.total}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Calculations */}
              <div className="p-4 bg-[#faf7f2] rounded-xl border border-border space-y-2">
                <div className="flex justify-between text-mid">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN') || selectedOrder.total}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-mid">
                  <span>Shipping Fee</span>
                  <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}</span>
                </div>
                <div className="flex justify-between font-serif text-base font-bold text-charcoal pt-2 border-t border-border">
                  <span>Total Paid</span>
                  <span className="text-wine">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="flex items-center justify-between p-4 bg-white border border-border rounded-xl">
                <div>
                  <span className="font-semibold text-charcoal block">Update Fulfillment Status</span>
                  <span className="text-mid text-[11px]">Notify customer tracking webhook</span>
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border bg-beige outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f8f6f0] border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-charcoal text-cream text-xs font-semibold rounded-lg hover:bg-wine transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

import React from 'react'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { getAllOrders } from '@/lib/supabase/data-service'
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function CustomerOrdersPage() {
  const orders = await getAllOrders()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>
      case 'Processing':
      case 'Packed':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>
      case 'Shipped':
      case 'Out for Delivery':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> {status}</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full">{status}</span>
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 pb-24">
        <div className="flex justify-between items-center border-b border-tots-border pb-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-tots-gold" />
            <h1 className="font-serif text-3xl font-bold text-tots-dark">My Orders</h1>
          </div>
          <Link href="/account" className="text-xs font-semibold text-tots-wine underline">
            Back to Account
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-tots-border p-8 space-y-3">
            <Package className="w-16 h-16 text-tots-gold mx-auto stroke-1" />
            <h2 className="font-serif text-2xl font-bold text-tots-dark">No orders placed yet</h2>
            <p className="text-xs text-tots-gray">Your placed fashion orders will appear here for easy tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-tots-border p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tots-border pb-3">
                  <div>
                    <span className="text-[11px] text-tots-gray block">ORDER ID</span>
                    <strong className="font-serif text-base text-tots-dark">{order.order_number}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-tots-gray block">DATE PLACED</span>
                    <span className="text-xs font-medium text-tots-dark">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-tots-gray block">TOTAL AMOUNT</span>
                    <strong className="font-serif text-base text-tots-wine">₹{order.total}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-tots-gray block">STATUS</span>
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>

                {/* Tracking & Timeline Bar */}
                <div className="bg-tots-beige p-3 rounded-xl border border-tots-border/60 text-xs flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-tots-gold" />
                    <span>Tracking Number: <strong className="font-mono text-tots-dark">{order.tracking_number || 'TOTS-TRK-89210'}</strong></span>
                  </div>
                  <span className="text-[11px] text-tots-gray">Payment Method: <strong>{order.payment_method} ({order.payment_status})</strong></span>
                </div>

                {/* Items in Order */}
                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.image_url || '/images/placeholder.jpg'} alt="" className="w-12 h-14 object-cover rounded-lg border border-tots-border" />
                      <div className="flex-1 text-xs">
                        <h4 className="font-semibold text-tots-dark">{item.product_name}</h4>
                        <p className="text-tots-gray">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-xs text-tots-wine">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

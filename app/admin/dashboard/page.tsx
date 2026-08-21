import React from 'react'
import Link from 'next/link'
import { getDashboardStats, getAllOrders, getAllAdminProducts, getCategories } from '@/lib/supabase/data-service'
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import SalesChart from '@/components/admin/SalesChart'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const [stats, allOrders, products, categories] = await Promise.all([
    getDashboardStats(),
    getAllOrders(),
    getAllAdminProducts(),
    getCategories()
  ])

  const recentOrders = allOrders.slice(0, 6)
  const lowStockProducts = products.filter(p => (p.variants?.some(v => v.stock_quantity <= 5) || false))
  const topProducts = products.slice(0, 4)

  const statusColors: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'Processing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── Dashboard Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Dashboard</h1>
          <p className="text-xs text-mid mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/editor"
            className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-white border border-border text-charcoal text-xs font-medium px-3.5 py-2.5 rounded-lg hover:bg-beige transition-colors"
          >
            <span>Store</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* ── 6 Real Statistics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-mid">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Sales</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            ₹{stats.totalSales.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp size={11} /> +18.4% month
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-mid">
            <span className="text-[11px] uppercase font-bold tracking-wider">Orders</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"><Package size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            {stats.totalOrders}
          </h3>
          <p className="text-[10px] text-mid">All time volume</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-mid">
            <span className="text-[11px] uppercase font-bold tracking-wider">Customers</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg"><Users size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            {stats.totalCustomers}
          </h3>
          <p className="text-[10px] text-amber-700 font-medium">VIP Shoppers</p>
        </div>

        {/* Products */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-mid">
            <span className="text-[11px] uppercase font-bold tracking-wider">Products</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"><ShoppingBag size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            {stats.totalProducts}
          </h3>
          <p className="text-[10px] text-mid">XS to 7XL styles</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] uppercase font-bold tracking-wider">Pending</span>
            <div className="p-1.5 bg-amber-50 rounded-lg"><Clock size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-amber-800">
            {stats.pendingOrders}
          </h3>
          <p className="text-[10px] text-amber-700 font-medium">Requires fulfillment</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] uppercase font-bold tracking-wider">Low Stock</span>
            <div className="p-1.5 bg-rose-50 rounded-lg"><AlertTriangle size={14} /></div>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-rose-800">
            {lowStockProducts.length}
          </h3>
          <p className="text-[10px] text-rose-700 font-medium">Needs reorder</p>
        </div>

      </div>

      {/* ── Sales Analytics Section ── */}
      <SalesChart />

      {/* ── Two Column: Recent Orders & Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-charcoal">Recent Orders</h3>
              <p className="text-xs text-mid">Latest customer transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-charcoal hover:text-wine flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-mid uppercase font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-3 font-mono font-semibold text-charcoal">
                      <Link href="/admin/orders" className="hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-charcoal">{o.customer_name}</td>
                    <td className="py-3 text-mid">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 font-serif font-bold text-wine">
                      ₹{o.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-mid">{o.payment_method}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[o.order_status] || 'bg-gray-100 text-gray-800'}`}>
                        {o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Showcase */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-charcoal">Top Products</h3>
              <p className="text-xs text-mid">Best-selling pieces</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-charcoal hover:text-wine flex items-center gap-1 transition-colors"
            >
              <span>Manage</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod) => (
              <div key={prod.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#faf7f2] transition-colors">
                <img
                  src={prod.primary_image || '/images/placeholder.jpg'}
                  alt={prod.name}
                  className="w-12 h-14 object-cover object-top rounded border border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-charcoal truncate">{prod.name}</h4>
                  <p className="text-[11px] text-mid">{prod.category?.name || 'General'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-serif font-bold text-xs text-wine">
                      ₹{(prod.sale_price || prod.regular_price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Low Stock Alerts Section ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertCircle size={18} />
              <h3 className="font-serif text-lg font-semibold">Low Stock Inventory Alerts</h3>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-rose-800 underline hover:text-rose-900"
            >
              Update Inventory
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-rose-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-charcoal truncate max-w-[180px]">{item.name}</h4>
                  <p className="text-[11px] font-mono text-mid">{item.sku}</p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  {item.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

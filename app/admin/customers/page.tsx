'use client'

import React, { useEffect, useState } from 'react'
import { getAllOrders } from '@/lib/supabase/data-service'
import { Order } from '@/lib/types'
import { Users, Search, Mail, Phone, ShoppingBag, ArrowUpRight, Crown, Star } from 'lucide-react'

interface CustomerSummary {
  name: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
  status: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllOrders().then(orders => {
      // Group orders by email or customer name
      const map = new Map<string, CustomerSummary>()

      orders.forEach(o => {
        const key = o.customer_email || o.customer_name
        if (!map.has(key)) {
          map.set(key, {
            name: o.customer_name,
            email: o.customer_email,
            phone: o.customer_phone,
            ordersCount: 1,
            totalSpent: o.total,
            lastOrderDate: o.created_at,
            status: o.total > 2000 ? 'VIP Member' : 'Active Customer'
          })
        } else {
          const curr = map.get(key)!
          curr.ordersCount += 1
          curr.totalSpent += o.total
          if (new Date(o.created_at) > new Date(curr.lastOrderDate)) {
            curr.lastOrderDate = o.created_at
          }
          if (curr.totalSpent > 2000) curr.status = 'VIP Member'
        }
      })

      // Add default mock customer if empty
      if (map.size === 0) {
        map.set('simran.k@example.com', {
          name: 'Simran Kaur',
          email: 'simran.k@example.com',
          phone: '+91 98765 12345',
          ordersCount: 3,
          totalSpent: 4297,
          lastOrderDate: new Date().toISOString(),
          status: 'VIP Member'
        })
      }

      setCustomers(Array.from(map.values()))
      setLoading(false)
    })
  }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="space-y-6 pb-16">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Customer Directory</h1>
          <p className="text-xs text-mid mt-1">
            Registered customer accounts, purchase frequency, and loyalty tier classifications.
          </p>
        </div>
      </div>

      {/* Search and Summary */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-xs text-mid">
          Total Customers: <strong className="text-charcoal">{filtered.length}</strong>
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#f5f1ea] text-mid uppercase font-semibold border-b border-border">
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spent</th>
                <th className="p-4">Last Active</th>
                <th className="p-4">Membership Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-mid">
                    Loading customer records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-mid">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={i} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-charcoal text-cream font-serif font-bold text-xs flex items-center justify-center">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal">{c.name}</h4>
                          <span className="text-[11px] text-mid">Registered Member</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="text-charcoal flex items-center gap-1.5"><Mail size={12} className="text-mid" /> {c.email}</p>
                      <p className="text-mid text-[11px] flex items-center gap-1.5 mt-0.5"><Phone size={12} className="text-mid" /> {c.phone}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-charcoal">{c.ordersCount} Orders</span>
                    </td>

                    <td className="p-4 font-serif font-bold text-wine text-sm">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4 text-mid">
                      {new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          c.status === 'VIP Member'
                            ? 'bg-gold/20 text-gold-dark border border-gold/40'
                            : 'bg-beige text-charcoal'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

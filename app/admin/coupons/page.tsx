'use client'

import React, { useEffect, useState } from 'react'
import { getAllCoupons, saveCoupon, deleteCoupon } from '@/lib/supabase/data-service'
import { Coupon } from '@/lib/types'
import { Ticket, PlusCircle, Trash2, Edit, X, Percent, DollarSign } from 'lucide-react'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({
    code: 'TOTS20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 999,
    is_active: true
  })
  const [loading, setLoading] = useState(true)

  const loadCoupons = async () => {
    setLoading(true)
    const data = await getAllCoupons()
    setCoupons(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon.code) return
    await saveCoupon({
      ...editingCoupon,
      code: editingCoupon.code.toUpperCase().trim()
    })
    setIsModalOpen(false)
    loadCoupons()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon code?')) {
      await deleteCoupon(id)
      loadCoupons()
    }
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Coupons & Discounts</h1>
          <p className="text-xs text-mid mt-1">
            Create promotional coupon vouchers, percentage discounts, and minimum order qualifiers.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon({
              code: 'TOTS15',
              discount_type: 'percentage',
              discount_value: 15,
              min_order_amount: 999,
              is_active: true
            })
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-mid">Loading coupons...</div>
        ) : (
          coupons.map(coupon => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-gold block">
                    Promo Code
                  </span>
                  <h3 className="font-mono font-bold text-xl text-charcoal tracking-wider mt-0.5">
                    {coupon.code}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    coupon.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {coupon.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] rounded-lg border border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-mid">Discount</span>
                  <span className="font-bold text-wine">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} FLAT OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid">Min. Order</span>
                  <span className="font-semibold text-charcoal">₹{coupon.min_order_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid">Redemptions</span>
                  <span className="font-semibold text-charcoal">{coupon.used_count || 0} times</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-[11px] text-mid">Cart & Checkout enabled</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon)
                      setIsModalOpen(true)
                    }}
                    className="p-1.5 text-mid hover:text-charcoal rounded"
                    title="Edit Coupon"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 rounded"
                    title="Delete Coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl border border-border shadow-panel max-w-md w-full overflow-hidden animate-fadeup">
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#faf7f2]">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                {editingCoupon.id ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-mid hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={e => setEditingCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. TOTS10"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={e => setEditingCoupon(prev => ({ ...prev, discount_type: e.target.value as any }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Value</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discount_value || ''}
                    onChange={e => setEditingCoupon(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                    placeholder="10"
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.min_order_amount || 0}
                    onChange={e => setEditingCoupon(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Status</label>
                  <select
                    value={editingCoupon.is_active ? 'true' : 'false'}
                    onChange={e => setEditingCoupon(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-charcoal text-cream text-xs font-semibold rounded-lg hover:bg-wine transition-colors"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

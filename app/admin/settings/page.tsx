'use client'

import React, { useEffect, useState } from 'react'
import { getStoreSettings, updateStoreSettings } from '@/lib/supabase/data-service'
import { StoreSettings } from '@/lib/types'
import { Save, ShieldCheck, CheckCircle2, Store, Truck, CreditCard, Instagram, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    store_name: 'TOTS',
    logo_url: '/images/tots-logo.png',
    support_email: 'care@tots.in',
    support_phone: '+91 98765 43210',
    currency: '₹',
    free_shipping_threshold: 999.00,
    standard_shipping_fee: 99.00,
    instagram_handle: '@tots_clothingclub'
  })

  const [savedMsg, setSavedMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getStoreSettings().then(setSettings)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await updateStoreSettings(settings)
    setSaving(false)
    setSavedMsg('Store configuration saved successfully!')
    setTimeout(() => setSavedMsg(''), 3500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-20">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Store Settings</h1>
          <p className="text-xs text-mid mt-1">
            Configure store identity, free shipping policies, tax rates, contact channels, and payments.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 rounded-lg hover:bg-wine transition-colors shadow-sm"
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2 animate-fadein">
          <CheckCircle2 size={16} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. Brand Identity & Contact */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Store size={16} className="text-gold" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">Brand Identity & Support</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold block mb-1 text-charcoal">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={e => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-charcoal">Support Email</label>
            <input
              type="email"
              value={settings.support_email}
              onChange={e => setSettings(prev => ({ ...prev, support_email: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-charcoal">Support Phone / WhatsApp</label>
            <input
              type="text"
              value={settings.support_phone}
              onChange={e => setSettings(prev => ({ ...prev, support_phone: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-charcoal">Instagram Handle</label>
            <input
              type="text"
              value={settings.instagram_handle}
              onChange={e => setSettings(prev => ({ ...prev, instagram_handle: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* 2. Shipping & Delivery Rules */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Truck size={16} className="text-gold" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">Shipping & Fulfillment Rates</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold block mb-1 text-charcoal">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={settings.free_shipping_threshold}
              onChange={e => setSettings(prev => ({ ...prev, free_shipping_threshold: Number(e.target.value) }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
            <p className="text-[11px] text-mid mt-1">Orders at or above this value qualify for free domestic express shipping.</p>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-charcoal">Standard Shipping Fee (₹)</label>
            <input
              type="number"
              value={settings.standard_shipping_fee}
              onChange={e => setSettings(prev => ({ ...prev, standard_shipping_fee: Number(e.target.value) }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
            <p className="text-[11px] text-mid mt-1">Flat shipping charge applied for orders below threshold.</p>
          </div>
        </div>
      </div>

      {/* 3. Payment Gateway Configuration */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <CreditCard size={16} className="text-gold" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">Payment Gateways & Security</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-[#faf7f2] rounded-lg border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-charcoal block">Cash on Delivery (COD)</span>
              <span className="text-mid text-[11px]">Allow customers to pay upon parcel receipt</span>
            </div>
            <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
              ENABLED
            </span>
          </div>

          <div className="p-3.5 bg-[#faf7f2] rounded-lg border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-charcoal block">UPI & Razorpay / Stripe Card Checkout</span>
              <span className="text-mid text-[11px]">Integrated online payments (GPay, PhonePe, Cards, NetBanking)</span>
            </div>
            <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px]">
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Save Area */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 rounded-lg hover:bg-wine transition-colors shadow-sm"
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

    </form>
  )
}

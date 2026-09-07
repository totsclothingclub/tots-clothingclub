'use client'

import React, { useEffect, useState } from 'react'
import { getStoreSettings, updateStoreSettings } from '@/lib/supabase/data-service'
import { StoreSettings } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { Save, ShieldCheck, CheckCircle2, Store, Truck, CreditCard, Instagram, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<StoreSettings>({
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    store_name: 'TOTS',
    logo_url: '/images/tots-logo.png',
    support_email: 'support@totsclothingclub.com',
    support_phone: '+91 85940 41490',
    currency: '₹',
    free_shipping_threshold: 999.00,
    standard_shipping_fee: 80.00,
    instagram_handle: '@tots_clothingclub'
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getStoreSettings().then(setSettings)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateStoreSettings(settings)
      toast.success('Store configuration saved successfully!', 'Settings Saved')
    } catch (err: any) {
      toast.error('Failed to save store settings. Please try again.', 'Error')
    } finally {
      setSaving(false)
    }
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

        <div className="max-w-md text-xs">
          <div>
            <label className="font-semibold block mb-1 text-charcoal">Standard Shipping Fee (₹)</label>
            <input
              type="number"
              value={settings.standard_shipping_fee}
              onChange={e => setSettings(prev => ({ ...prev, standard_shipping_fee: Number(e.target.value) }))}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
            />
            <p className="text-[11px] text-mid mt-1">
              Base shipping fee applied for 1–2 items. For every additional 2 items (3–4, 5–6, etc.), shipping scales automatically (2x, 3x, etc.).
            </p>
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

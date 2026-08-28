'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  PhoneCall
} from 'lucide-react'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return

    setIsSearching(true)
    // Simulate lookup
    setTimeout(() => {
      setIsSearching(false)
      setSearchResult({
        orderNumber: orderId.toUpperCase(),
        courier: 'Delhivery Express',
        awb: 'DLHV' + Math.floor(100000000 + Math.random() * 900000000),
        status: 'In Transit',
        estimatedDelivery: '3 - 5 Business Days',
        destination: 'Customer Delivery Address',
        timeline: [
          { status: 'Order Placed & Payment Confirmed', date: 'Online via Razorpay', done: true },
          { status: 'Quality Inspection & Packing Complete', date: 'Warehouse Guruvayoor', done: true },
          { status: 'Handed Over to Courier Service', date: 'Delhivery Hub', done: true },
          { status: 'Out for Doorstep Delivery', date: 'Expected Soon', done: false },
        ]
      })
    }, 600)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-white">Track Order</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Truck size={14} />
              <span>Live Courier Tracking</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Track Your Shipment
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Enter your Order Number or registered Mobile Number to check real-time courier dispatch status.
            </p>
          </div>
        </section>

        {/* ── Search Card with Proper Padding ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e2d9cc] shadow-sm">
            <form onSubmit={handleTrack} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Order Number / ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOTS-10042 or ORD-782"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 85940 41490"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 rounded-xl bg-charcoal text-white font-bold text-xs uppercase tracking-widest hover:bg-wine transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Search size={15} />
                <span>{isSearching ? 'Searching Tracking Database...' : 'Track Package'}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-border mt-6 flex items-center justify-between text-xs text-mid">
              <span>Have an account with us?</span>
              <Link href="/account/orders" className="font-bold text-wine hover:underline">
                View All Account Orders →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Tracking Result Display ── */}
        {searchResult && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e2d9cc] shadow-sm space-y-6">
              
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mid block">ORDER FOUND</span>
                  <h3 className="font-serif text-xl font-bold text-charcoal">{searchResult.orderNumber}</h3>
                  <p className="text-xs text-mid mt-0.5">
                    Carrier: <strong>{searchResult.courier}</strong> (AWB: <code className="bg-[#faf7f2] px-1.5 py-0.5 rounded border border-border">{searchResult.awb}</code>)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {searchResult.status}
                  </span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-charcoal">Delivery Progress</h4>
                <div className="space-y-3.5 pl-2">
                  {searchResult.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {step.done ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                          <Clock size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div className="text-xs">
                        <p className={`font-semibold ${step.done ? 'text-charcoal' : 'text-mid'}`}>
                          {step.status}
                        </p>
                        <p className="text-[11px] text-mid">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Reminder Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Friendly Reminder:</strong> Please record a continuous, unedited unboxing video starting from opening the outer parcel before removing tags in case you need any size exchange or return.
                </p>
              </div>

            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

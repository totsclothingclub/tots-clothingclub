import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  Truck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  PackageCheck, 
  AlertCircle, 
  PhoneCall, 
  Mail,
  ChevronRight,
  Sparkles
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | TOTS Clothing Club',
  description: 'Learn about TOTS Clothing Club shipping rates, delivery timelines, courier partners, and tracking information across India.',
}

export default function ShippingPolicyPage() {
  const lastUpdated = 'August 28, 2026'

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Header Hero ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Policies</span>
              <ChevronRight size={12} />
              <span className="text-white">Shipping & Delivery</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Truck size={14} />
              <span>Pan-India Courier Home Delivery</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Transparent, fast, and secure doorstep delivery across India. Last updated: <span className="text-cream font-medium">{lastUpdated}</span>
            </p>
          </div>
        </section>

        {/* ── Highlights Grid with Proper Margin ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-[#e2d9cc] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#b8974a]/10 border border-[#b8974a]/30 text-gold flex items-center justify-center flex-shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mid font-semibold">Shipping Charge</p>
                <p className="text-xl font-serif font-bold text-charcoal">₹80 Flat Rate</p>
                <p className="text-[11px] text-mid">Across all Indian states</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e2d9cc] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7b1f35]/10 border border-[#7b1f35]/30 text-wine flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mid font-semibold">Dispatch Time</p>
                <p className="text-xl font-serif font-bold text-charcoal">1 – 2 Business Days</p>
                <p className="text-[11px] text-mid">Express packing & dispatch</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e2d9cc] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-mid font-semibold">Estimated Delivery</p>
                <p className="text-xl font-serif font-bold text-charcoal">3 – 7 Working Days</p>
                <p className="text-[11px] text-mid">Live tracking provided</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Policy Content ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-10 text-sm text-charcoal/90 leading-relaxed">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">1</span>
                <span>Delivery Coverage & Courier Network</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Home Delivery Across India
              </h2>
              <p>
                <strong>TOTS Clothing Club</strong> provides dependable door-to-door home delivery across India through leading courier and logistics partners including <em>Bluedart, Delhivery, DTDC, Xpressbees, Shadowfax, and India Post Speed Post</em>.
              </p>
              <p>
                We service over 25,000+ pin codes across all states and Union Territories in India. Remote or rural pin codes are serviced via India Post Speed Post to guarantee delivery to every customer.
              </p>
            </div>

            <hr className="border-border" />

            {/* Section 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">2</span>
                <span>Shipping Fees & Rates</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Standard Shipping Charge of ₹80/-
              </h2>
              <div className="p-5 rounded-xl bg-beige-light border border-border space-y-2">
                <p className="font-medium text-charcoal">
                  • <strong>Standard Shipping:</strong> A flat shipping charge of <strong>₹80/-</strong> applies per order irrespective of the number of items or weight.
                </p>
                <p className="text-xs text-mid">
                  • The shipping charge is clearly displayed at the checkout page before payment confirmation.
                </p>
                <p className="text-xs text-mid">
                  • Standard shipping fees are calculated and applied automatically at checkout before payment.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">3</span>
                <span>Order Processing & Delivery Timelines</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Dispatch & Delivery Schedule
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl border border-border bg-[#faf7f2]">
                    <h3 className="font-serif font-bold text-charcoal text-base mb-1">Order Dispatch</h3>
                    <p className="text-xs text-mid leading-relaxed">
                      Orders confirmed before 2:00 PM IST on business days are packed and dispatched within <strong>24 to 48 hours</strong> (excluding Sundays and National Holidays).
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border border-border bg-[#faf7f2]">
                    <h3 className="font-serif font-bold text-charcoal text-base mb-1">Transit Time</h3>
                    <p className="text-xs text-mid leading-relaxed">
                      • <strong>South India:</strong> 2 – 4 business days.<br />
                      • <strong>Metro Cities & Rest of India:</strong> 4 – 7 business days.<br />
                      • <strong>Remote & North-East locations:</strong> 6 – 9 business days.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-mid italic">
                  *Delivery timelines may vary slightly during festive rush seasons, extreme weather conditions, or local logistical restrictions.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">4</span>
                <span>Real-Time Shipment Tracking</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Track Your Parcel Anytime
              </h2>
              <p>
                Once your order has been packaged and handed over to our courier partner, you will receive an instant notification via SMS / WhatsApp and Email containing:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-charcoal/80 pl-2">
                <li>Courier Partner Name (e.g., Delhivery, Bluedart)</li>
                <li>Airway Bill (AWB) / Tracking Number</li>
                <li>Direct live tracking link to track your parcel from our warehouse to your doorstep</li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/track-order"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors"
                >
                  <PackageCheck size={14} />
                  <span>Go to Track Order Page</span>
                </Link>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 5: Important Notice */}
            <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertCircle size={18} className="text-amber-700 flex-shrink-0" />
                <span>Important: Inspection Upon Delivery</span>
              </div>
              <p className="text-xs leading-relaxed">
                Please do NOT accept packages that appear severely torn, opened, or tampered with before delivery. If the courier package is intact, please remember that an <strong>unedited, continuous unboxing video</strong> is mandatory for any missing, damaged, or return claims.
              </p>
              <div className="pt-1">
                <Link href="/return-policy" className="text-xs font-bold text-wine underline hover:text-wine-dark">
                  Read our Mandatory Unboxing Video Return Policy →
                </Link>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 6: Support Contact */}
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-charcoal">
                Need Help With Your Shipment?
              </h2>
              <p className="text-xs text-mid">
                If your parcel is delayed beyond the estimated timeline or if you have specific delivery instructions, our support desk is ready to assist you:
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <a
                  href="mailto:support@totsclothingclub.com"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#faf7f2] border border-border hover:border-gold transition-colors font-medium text-charcoal"
                >
                  <Mail size={14} className="text-gold" />
                  <span>support@totsclothingclub.com</span>
                </a>
                <a
                  href="https://wa.me/918594041490"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#faf7f2] border border-border hover:border-emerald-500 transition-colors font-medium text-charcoal"
                >
                  <PhoneCall size={14} className="text-emerald-600" />
                  <span>WhatsApp: +91 85940 41490</span>
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

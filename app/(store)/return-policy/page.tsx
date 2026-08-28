import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  Video, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  FileVideo, 
  Mail, 
  PhoneCall, 
  ChevronRight,
  HelpCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Return, Refund & Cancellation Policy | TOTS Clothing Club',
  description: 'Understand our return and refund guidelines, mandatory unboxing video requirement, exchange criteria, and cancellation process.',
}

export default function ReturnPolicyPage() {
  const lastUpdated = 'August 28, 2026'

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Policies</span>
              <ChevronRight size={12} />
              <span className="text-white">Return & Refund Policy</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold">
              <Video size={14} />
              <span>Unboxing Video Mandatory Policy</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Cancellation, Return & Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              We ensure 100% genuine quality. Please review our video-verified return guidelines carefully. Last updated: <span className="text-cream font-medium">{lastUpdated}</span>
            </p>
          </div>
        </section>

        {/* ── CRITICAL MANDATORY VIDEO BANNER ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="bg-gradient-to-br from-[#7b1f35] to-[#4a1020] rounded-2xl p-7 sm:p-10 text-white shadow-xl border border-rose-900/50 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8">
              <Video size={200} />
            </div>

            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest">
                <AlertTriangle size={18} className="text-amber-400" />
                <span>MANDATORY REQUIREMENT FOR ALL RETURNS</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-cream">
                Continuous & Unedited Unboxing Video is Strictly Required
              </h2>

              <p className="text-xs sm:text-sm text-cream/90 leading-relaxed max-w-2xl">
                To prevent transit disputes and guarantee a transparent return process, an <strong>opening/unboxing video</strong> is <u>mandatory</u> for every return, exchange, or damage claim. <strong>No return request will be entertained without this proof.</strong>
              </p>

              {/* 3 Video Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="flex items-center gap-2 font-bold text-xs text-gold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Rule 1: Start to End</span>
                  </div>
                  <p className="text-[11px] text-cream/80 leading-normal">
                    Video must start before cutting/opening the sealed outer courier parcel.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="flex items-center gap-2 font-bold text-xs text-gold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Rule 2: Continuous & Uncut</span>
                  </div>
                  <p className="text-[11px] text-cream/80 leading-normal">
                    Single continuous take. Paused, spliced, edited, or filtered videos are invalid.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="flex items-center gap-2 font-bold text-xs text-gold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Rule 3: Clear Visibility</span>
                  </div>
                  <p className="text-[11px] text-cream/80 leading-normal">
                    The defect, wrong size, wrong colour, or damage must be visibly shown in the video.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Policy Sections ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-10 text-sm text-charcoal/90 leading-relaxed">

            {/* 1. When are Returns Accepted? */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">1</span>
                <span>Eligibility Criteria</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                When is a Return or Exchange Accepted?
              </h2>

              <p>
                At <strong>TOTS Clothing Club</strong>, every piece is quality-checked before packing. However, in the rare event of a transit mishap or dispatch error, returns or replacements will be gladly approved under the following conditions:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-emerald-900">Physical Damage in Transit</h3>
                    <p className="text-[11px] text-emerald-800">Torn fabric, broken zippers, or severe defects clearly shown during package unboxing.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-emerald-900">Wrong Size Dispatched</h3>
                    <p className="text-[11px] text-emerald-800">If the size delivered differs from what was ordered and clearly visible on product tags.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-emerald-900">Wrong Colour or Item</h3>
                    <p className="text-[11px] text-emerald-800">If a completely different style, print, or colour is received contrary to your order.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-emerald-900">Missing Package Items</h3>
                    <p className="text-[11px] text-emerald-800">If an ordered multi-item shipment is missing a product in the unboxing footage.</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* 2. Non-Returnable Scenarios */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">2</span>
                <span>Exceptions & Non-Returnable Items</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Conditions Where Returns Will NOT Be Accepted
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Absence of Unboxing Video:</strong> Return requests without an unedited opening video starting from the sealed package will be strictly rejected.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Altered or Washed Garments:</strong> Items that have been worn, washed, perfume-sprayed, stained, or altered in size.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Missing Original Tags & Packaging:</strong> Original price tags, brand labels, and polybags must be intact.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Minor 5-10% Screen Colour Variation:</strong> Slight differences in shade due to digital studio lighting or mobile screen calibrations do not qualify as defect.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2.5">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Clearance / Final Sale Items:</strong> Items explicitly marked under deep clearance sale (e.g. ₹99 store) unless delivered damaged.</span>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* 3. Step-by-Step Return Process */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">3</span>
                <span>Return Request Procedure</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                How to Submit a Return or Exchange Request
              </h2>

              <ol className="space-y-3 text-xs">
                <li className="p-4 rounded-xl border border-border bg-[#faf7f2] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <div>
                    <h3 className="font-bold text-charcoal">Notify Us Within 48 Hours</h3>
                    <p className="text-mid mt-0.5">
                      Contact our support desk via WhatsApp (<strong>+91 85940 41490</strong>) or Email (<strong>support@totsclothingclub.com</strong>) within <strong>48 hours</strong> of courier delivery.
                    </p>
                  </div>
                </li>

                <li className="p-4 rounded-xl border border-border bg-[#faf7f2] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <div>
                    <h3 className="font-bold text-charcoal">Attach Order ID & Opening Video</h3>
                    <p className="text-mid mt-0.5">
                      Share your <strong>Order Number (e.g., TOTS-10023)</strong> along with the unedited unboxing video file (or Google Drive link if the file size is large).
                    </p>
                  </div>
                </li>

                <li className="p-4 rounded-xl border border-border bg-[#faf7f2] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <div>
                    <h3 className="font-bold text-charcoal">Verification & Reverse Pickup</h3>
                    <p className="text-mid mt-0.5">
                      Our Quality Team will verify the video within 24 hours. Upon approval, we will arrange a reverse courier pickup from your delivery address or provide self-ship instructions.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <hr className="border-border" />

            {/* 4. Refund Timeline & Mode */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">4</span>
                <span>Refund Processing & Timeline</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Razorpay Online Refund Timeline
              </h2>

              <p>
                Once the returned product reaches our warehouse and passes standard verification:
              </p>

              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
                <p>
                  • <strong>Online Payment (UPI / Cards / NetBanking / Wallets):</strong> The refund will be credited directly back to the original source account via <strong>Razorpay Payment Gateway</strong> within <strong>5 to 7 business days</strong>.
                </p>
                <p>
                  • <strong>Replacement / Exchange:</strong> If you requested a size or product exchange, the replacement package will be dispatched within 2 business days after receipt of the returned item.
                </p>
                <p>
                  • <strong>Shipping Fee Refund:</strong> The standard ₹80 shipping fee is non-refundable unless the return is due to an error on our part (damaged item or wrong product sent).
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* 5. Cancellation Policy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">5</span>
                <span>Order Cancellation Policy</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Order Cancellations
              </h2>

              <p className="text-xs">
                • <strong>Before Dispatch:</strong> You can request an order cancellation before your parcel is handed over to the courier (usually within 12 hours of placing the order). Contact our WhatsApp support with your Order ID for immediate cancellation and 100% refund.
              </p>
              <p className="text-xs">
                • <strong>After Dispatch:</strong> Once the tracking number (AWB) is generated and courier pickup is completed, the order cannot be cancelled. The standard return process must be followed upon receipt.
              </p>
            </div>

            <hr className="border-border" />

            {/* Support CTA */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] text-cream flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Have a Return Request?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Reach out to our customer care with your unboxing video.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/918594041490"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors flex items-center gap-2"
                >
                  <PhoneCall size={14} />
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href="mailto:support@totsclothingclub.com"
                  className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Mail size={14} />
                  <span>Email Team</span>
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

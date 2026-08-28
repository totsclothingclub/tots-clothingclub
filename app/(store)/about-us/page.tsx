import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { Sparkles, Heart, Crown, ShieldCheck, Truck, ArrowRight, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | TOTS Clothing Club — Affordable Premium Fashion',
  description: 'Learn about TOTS Clothing Club: our story, commitment to inclusive sizing (XS to 7XL), premium craftsmanship, and affordable luxury fashion.',
}

export default function AboutUsPage() {
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
              <span className="text-white">About Us</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Crown size={14} />
              <span>Style Has No Size • XS to 7XL</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase pt-1">
              Affordable Premium Fashion For Every Woman
            </h1>
            <p className="text-xs sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Born from a vision to make elegant, luxurious, and perfectly fitting ethnic &amp; western wear accessible to every silhouette.
            </p>
          </div>
        </section>

        {/* ── Brand Story Section with Generous Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
          
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-8 text-sm text-charcoal/90 leading-relaxed">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold block">OUR ETHOS</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                Redefining Inclusive Luxury
              </h2>
              <p>
                At <strong>TOTS Clothing Club</strong>, we believe fashion should empower, inspire, and fit effortlessly. Rooted in the rich cultural heritage of Guruvayoor, Kerala, we curate timeless apparel that blends traditional grace with modern flair.
              </p>
              <p>
                Unlike conventional fast-fashion brands that stop at standard sizes, we celebrate every body type with curated collections extending from <strong>XS all the way up to 7XL</strong>. Every cut is tailor-engineered to flatter real proportions, ensuring utmost comfort and supreme confidence.
              </p>
            </div>

            <hr className="border-border" />

            {/* Core Values 3 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div className="p-5 rounded-xl bg-[#faf7f2] border border-border space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-2">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal">Uncompromising Quality</h3>
                <p className="text-xs text-mid leading-relaxed">
                  Breathable cottons, pure mulmul, modal rayons, and premium linens selected for durability and skin-friendly comfort.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#faf7f2] border border-border space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-wine/10 text-wine flex items-center justify-center mx-auto mb-2">
                  <Crown size={22} />
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal">True Size Inclusivity</h3>
                <p className="text-xs text-mid leading-relaxed">
                  From petite XS to generously proportioned 7XL with detailed sizing specifications so you always find your perfect fit.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#faf7f2] border border-border space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Heart size={22} />
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal">Honest & Fair Pricing</h3>
                <p className="text-xs text-mid leading-relaxed">
                  Direct-to-consumer design model eliminating middleman markups so you enjoy boutique luxury at honest prices.
                </p>
              </div>
            </div>
          </div>

          {/* Shop Collections Call to Action */}
          <div className="bg-[#141414] rounded-2xl p-8 sm:p-10 text-cream text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#242424] shadow-md">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">Explore Our Curated Collections</h3>
              <p className="text-xs text-gray-400 mt-1">Discover new arrivals, plus-size favorites, salwar sets, and modest styles.</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-charcoal font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all flex-shrink-0"
            >
              <span>Explore Store</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

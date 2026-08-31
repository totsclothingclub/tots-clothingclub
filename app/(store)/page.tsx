import React from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { ProductCard } from '@/components/store/ProductCard'
import BestSellersCarousel from '@/components/store/BestSellersCarousel'
import HeroSlider from '@/components/store/HeroSlider'
import HomeCategoryCarousel from '@/components/store/HomeCategoryCarousel'
import InstagramReelsGallery from '@/components/store/InstagramReelsGallery'
import NewsletterForm from '@/components/store/NewsletterForm'
import { getActiveBanners, getCategories, getProducts, getInstagramPosts, getActivePromoCards, getStoreSettings } from '@/lib/supabase/data-service'
import {
  ArrowRight,
  Truck,
  RefreshCw,
  ShieldCheck,
  Crown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Sparkles,
  Instagram,
  Play,
  CheckCircle2
} from 'lucide-react'

export const revalidate = 0

export default async function HomePage() {
  const [banners, rawCategories, products, allProducts, dynamicIgPosts, promoCards, storeSettings] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getProducts({ isBestSeller: true }),
    getProducts(),
    getInstagramPosts(),
    getActivePromoCards(),
    getStoreSettings()
  ])

  const categories = (rawCategories || []).filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)

  // 6 Best Sellers for desktop (matching reference layout)
  const bestSellers = (products && products.length > 0 ? products : allProducts).slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-charcoal selection:bg-gold/30">
      <Header initialCategories={categories} />

      <main className="flex-1 space-y-12 lg:space-y-16 pb-16">
        
        {/* ═══════════════════════════════════════════════════
            1. HERO SLIDER SECTION (Functional Desktop & Mobile Slider)
        ═══════════════════════════════════════════════════ */}
        <HeroSlider initialBanners={banners} />

        {/* ═══════════════════════════════════════════════════
            3. SHOP BY CATEGORY SECTION (4 Desktop Cards + Auto-Swiping Mobile 4-Item Carousel)
        ═══════════════════════════════════════════════════ */}
        {categories.length > 0 && (
          <HomeCategoryCarousel categories={categories} />
        )}

        {/* ═══════════════════════════════════════════════════
            4. OUR BEST SELLERS SECTION — Smart Centered Carousel
        ═══════════════════════════════════════════════════ */}
        {bestSellers.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center space-y-1.5 px-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-charcoal uppercase">
                OUR BEST SELLERS
              </h2>
              <p className="text-xs text-mid max-w-sm mx-auto">
                Loved by our customers. Shop the styles everyone is talking about.
              </p>
              <div className="w-12 h-0.5 bg-gold mx-auto mt-1" />
            </div>

            {/* Smart centered carousel: centers when few products, scrolls when many */}
            <BestSellersCarousel products={bestSellers} />

            <div className="text-center pt-2 px-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border border-charcoal text-charcoal text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-lg hover:bg-charcoal hover:text-white transition-colors"
              >
                <span>VIEW ALL PRODUCTS</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            5. PROMOTIONAL CARDS — 3 Sized Cards in 1 Row on Desktop
        ═══════════════════════════════════════════════════ */}
        {promoCards && promoCards.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop: 3 Sized Cards in 1 Single Line matching the exact container */}
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 w-full">
              {promoCards.slice(0, 3).map((card) => {
                const isDark = card.bg_color === 'wine' || card.bg_color === 'charcoal'
                const bgClass =
                  card.bg_color === 'wine' ? 'bg-[#7a1e3c] text-white border-[#7a1e3c]' :
                  card.bg_color === 'charcoal' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' :
                  card.bg_color === 'gold' ? 'bg-[#b8966a] text-white border-[#b8966a]' :
                  card.bg_color === 'white' ? 'bg-white text-charcoal border-[#e8dfd2]' :
                  'bg-[#f5efe6] text-charcoal border-[#e8dfd2]'
                const labelColor = isDark ? 'text-gold/90' : 'text-[#b8966a]'
                const btnClass = isDark
                  ? 'border-white text-white hover:bg-white hover:text-wine'
                  : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
                const descColor = isDark ? 'text-cream/85' : 'text-mid'

                return (
                  <div
                    key={card.id}
                    className={`overflow-hidden border flex items-stretch min-h-[220px] xl:min-h-[240px] w-full shadow-2xs hover:shadow-xs transition-all duration-300 ${bgClass}`}
                  >
                    <div className="flex-1 p-6 xl:p-7 flex flex-col justify-between">
                      <div className="space-y-2">
                        {card.label && (
                          <span className={`text-[10px] uppercase font-bold tracking-widest block ${labelColor}`}>
                            {card.label}
                          </span>
                        )}
                        <h3 className="font-serif text-2xl xl:text-3xl font-bold leading-tight uppercase">
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className={`text-xs leading-relaxed ${descColor}`}>
                            {card.description.split('\n').map((line, i) => (
                              <span key={i}>
                                {line}
                                {i < card.description!.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                      {card.button_text && card.button_url && (
                        <div className="pt-3">
                          <Link
                            href={card.button_url}
                            className={`inline-block border text-[10px] uppercase font-bold tracking-widest px-5 py-2.5 transition-colors ${btnClass}`}
                          >
                            {card.button_text}
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="w-[42%] flex-shrink-0 bg-transparent overflow-hidden flex items-end justify-center relative">
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="w-full h-full object-cover object-top bg-transparent hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20 bg-transparent">
                          <span className="text-4xl">👗</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>



            {/* Mobile: stacked flex cards */}
            <div className="lg:hidden flex flex-col gap-4">
              {promoCards.map((card) => {
                const isDark = card.bg_color === 'wine' || card.bg_color === 'charcoal'
                const bgClass =
                  card.bg_color === 'wine' ? 'bg-wine text-white border-wine' :
                  card.bg_color === 'charcoal' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' :
                  card.bg_color === 'gold' ? 'bg-[#b8966a] text-white border-[#b8966a]' :
                  card.bg_color === 'white' ? 'bg-white text-charcoal border-[#e8dfd2]' :
                  'bg-[#f5efe6] text-charcoal border-[#e8dfd2]'
                const labelColor = isDark ? 'text-gold/90' : 'text-mid'
                const btnClass = isDark
                  ? 'border-white/90 text-white hover:bg-white hover:text-wine'
                  : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
                const descColor = isDark ? 'text-cream/80' : 'text-mid'

                return (
                  <div
                    key={card.id}
                    className={`overflow-hidden border flex items-stretch h-[200px] ${bgClass}`}
                  >
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div className="space-y-1">
                        {card.label && (
                          <span className={`text-[10px] uppercase font-bold tracking-wider block ${labelColor}`}>
                            {card.label}
                          </span>
                        )}
                        <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight uppercase">
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className={`text-[11px] leading-snug pt-1 ${descColor}`}>
                            {card.description.split('\n').map((line, i) => (
                              <span key={i}>
                                {line}
                                {i < card.description!.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                      {card.button_text && card.button_url && (
                        <div>
                          <Link
                            href={card.button_url}
                            className={`inline-block border text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 transition-colors ${btnClass}`}
                          >
                            {card.button_text}
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="w-[42%] flex-shrink-0 overflow-hidden bg-transparent flex items-center justify-center relative">
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="w-full h-full object-cover object-top bg-transparent"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20 bg-transparent">
                          <span className="text-3xl">👗</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}


        {/* ═══════════════════════════════════════════════════
            6. SEEN ON INSTAGRAM / REELS GALLERY (100% Dynamic)
        ═══════════════════════════════════════════════════ */}
        {dynamicIgPosts && dynamicIgPosts.length > 0 && (
          <InstagramReelsGallery
            posts={dynamicIgPosts}
            instagramHandle={storeSettings?.instagram_handle || 'tots_clothingclub'}
          />
        )}

        {/* ═══════════════════════════════════════════════════
            7. VALUE PROPOSITIONS STRIP (5 Features) — Desktop/Laptop Only
        ═══════════════════════════════════════════════════ */}
        <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-5 gap-4 py-8 border-y border-border text-center">
            
            <Link href="/shipping-policy" className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity">
              <Truck size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">HOME DELIVERY</h5>
              <p className="text-[11px] text-mid">₹80 Courier Shipping</p>
            </Link>

            <Link href="/return-policy" className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity">
              <RefreshCw size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">EASY RETURNS</h5>
              <p className="text-[11px] text-mid">Unboxing Video Verified</p>
            </Link>

            <Link href="/payment-policy" className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity">
              <ShieldCheck size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">SECURE PAYMENT</h5>
              <p className="text-[11px] text-mid">Razorpay 256-Bit Encrypted</p>
            </Link>

            <Link href="/payment-policy" className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity">
              <CreditCard size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">ONLINE ONLY</h5>
              <p className="text-[11px] text-mid">UPI, Cards & Net Banking</p>
            </Link>

            <Link href="/size-guide" className="flex flex-col items-center gap-1.5 p-2 hover:opacity-80 transition-opacity">
              <Crown size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">SIZE INCLUSIVE</h5>
              <p className="text-[11px] text-mid">XS to 7XL Silhouettes</p>
            </Link>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            8. STAY IN STYLE NEWSLETTER BAR
        ═══════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
          <div className="bg-[#141414] text-cream rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 shadow-md border border-[#222222] overflow-hidden w-full">
            <div className="flex items-center gap-4 text-center lg:text-left">
              <div className="p-3 bg-[#202020] rounded-xl text-gold">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold uppercase tracking-wider text-white">
                  STAY IN STYLE
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sign up and get 10% off your first order
                </p>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <NewsletterForm />
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

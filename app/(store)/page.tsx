import React from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { ProductCard } from '@/components/store/ProductCard'
import BestSellersCarousel from '@/components/store/BestSellersCarousel'
import HeroSlider from '@/components/store/HeroSlider'
import NewsletterForm from '@/components/store/NewsletterForm'
import { getActiveBanners, getCategories, getProducts, getInstagramPosts } from '@/lib/supabase/data-service'
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
  const [banners, rawCategories, products, allProducts, dynamicIgPosts] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getProducts({ isBestSeller: true }),
    getProducts(),
    getInstagramPosts()
  ])

  const categories = (rawCategories || []).filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)

  // 6 Best Sellers for desktop (matching reference layout)
  const bestSellers = (products && products.length > 0 ? products : allProducts).slice(0, 6)

  // Dynamic gallery photos from Instagram admin posts or real products
  const igPhotos = dynamicIgPosts && dynamicIgPosts.length > 0
    ? dynamicIgPosts.slice(0, 8).map(p => ({
        url: p.image_url,
        tag: p.tag,
        post_url: p.post_url || 'https://instagram.com/tots_clothingclub'
      }))
    : allProducts
        .filter(p => p.primary_image && !p.primary_image.includes('placeholder'))
        .slice(0, 8)
        .map(p => ({
          url: p.primary_image,
          tag: p.sale_price ? `₹${p.sale_price}` : null,
          post_url: 'https://instagram.com/tots_clothingclub'
        }))

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-charcoal selection:bg-gold/30">
      <Header initialCategories={categories} />

      <main className="flex-1 space-y-12 lg:space-y-16 pb-16">
        
        {/* ═══════════════════════════════════════════════════
            1. HERO SLIDER SECTION (Functional Desktop & Mobile Slider)
        ═══════════════════════════════════════════════════ */}
        <HeroSlider initialBanners={banners} />

        {/* ═══════════════════════════════════════════════════
        {/* ═══════════════════════════════════════════════════
            3. SHOP BY CATEGORY SECTION (Dynamic Centered Layout)
        ═══════════════════════════════════════════════════ */}
        {categories.length > 0 && (
          <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
            <div className="text-center space-y-1 lg:hidden">
              <h2 className="font-serif text-2xl font-bold tracking-wider text-charcoal uppercase">
                SHOP BY CATEGORY
              </h2>
              <div className="w-12 h-0.5 bg-gold mx-auto" />
            </div>

            {/* ── DESKTOP VIEW: Dynamic Centered Horizontal Split Cards ── */}
            <div className="hidden lg:flex flex-wrap justify-center gap-5">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative bg-[#f5efe6] overflow-hidden border border-border/70 flex items-stretch hover:border-gold transition-all duration-300 min-h-[150px] flex-1 min-w-[270px] max-w-[360px]"
                >
                  {/* Left section: Text content */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-charcoal text-base lg:text-lg uppercase tracking-wider group-hover:text-wine transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-mid leading-relaxed line-clamp-2">
                        {cat.description || 'Check out our latest collection'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal group-hover:text-wine transition-colors">
                        SHOP NOW &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Right section: Large category image */}
                  <div className="w-[42%] flex-shrink-0 bg-white">
                    <img
                      src={cat.image_url || '/images/placeholder.jpg'}
                      alt={cat.name}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* ── MOBILE VIEW: Dynamic Centered Circular Cards ── */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:hidden">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center space-y-2.5 cursor-pointer w-[calc(50%-12px)] max-w-[180px]"
                >
                  <div className="w-32 h-32 xs:w-36 xs:h-36 rounded-full overflow-hidden bg-beige p-1 border-2 border-gold/40 group-hover:border-wine group-hover:scale-105 transition-all duration-300 shadow-md">
                    <img
                      src={cat.image_url || '/images/placeholder.jpg'}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-charcoal text-xs xs:text-sm uppercase tracking-wider group-hover:text-wine transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            4. OUR BEST SELLERS SECTION — Smart Centered Carousel
        ═══════════════════════════════════════════════════ */}
        {bestSellers.length > 0 && (
          <section className="max-w-[1600px] mx-auto space-y-6">
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
            5. THREE PROMOTIONAL BANNERS — Rectangular Split Layout (Desktop Only)
        ═══════════════════════════════════════════════════ */}
        <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          {/* Desktop: 3-column flat rectangular banners */}
          <div className="hidden lg:grid grid-cols-3 gap-5">

            {/* Banner 1: Style Under ₹499 — Wine Background */}
            <div className="bg-wine text-white overflow-hidden border border-wine flex items-stretch min-h-[190px]">
              {/* Left: Text */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold/90 block">
                    SPECIAL DROP
                  </span>
                  <h3 className="font-serif text-2xl font-bold leading-tight">
                    STYLE UNDER<br />₹499
                  </h3>
                  <p className="text-[11px] text-cream/80 leading-snug">
                    Everything you love.<br />Nothing over ₹499.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?maxPrice=499"
                    className="inline-block border border-white text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:bg-white hover:text-wine transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
              {/* Right: Image */}
              <div className="w-[38%] flex-shrink-0">
                <img
                  src="/images/placeholder.jpg"
                  alt="Style Under 499"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Banner 2: Plus Size — Cream Background */}
            <div className="bg-[#f5efe6] text-charcoal overflow-hidden border border-[#e8dfd2] flex items-stretch min-h-[190px]">
              {/* Left: Text */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#b8966a] block">
                    XS TO 7XL
                  </span>
                  <h3 className="font-serif text-2xl font-bold leading-tight text-charcoal">
                    PLUS SIZE<br />COLLECTION
                  </h3>
                  <p className="text-[11px] text-mid leading-snug">
                    Fashion that fits beautifully<br />and feels amazing.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?category=plus-size"
                    className="inline-block border border-charcoal text-charcoal text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:bg-charcoal hover:text-white transition-colors"
                  >
                    EXPLORE NOW
                  </Link>
                </div>
              </div>
              {/* Right: Image */}
              <div className="w-[38%] flex-shrink-0">
                <img
                  src="/images/placeholder.jpg"
                  alt="Plus Size Collection"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Banner 3: New Arrivals — Cream Background */}
            <div className="bg-[#f5efe6] text-charcoal overflow-hidden border border-[#e8dfd2] flex items-stretch min-h-[190px]">
              {/* Left: Text */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#b8966a] block">
                    NEW SEASON
                  </span>
                  <h3 className="font-serif text-2xl font-bold leading-tight text-charcoal">
                    NEW<br />ARRIVALS
                  </h3>
                  <p className="text-[11px] text-mid leading-snug">
                    Fresh styles.<br />Just for you.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?category=new-arrivals"
                    className="inline-block border border-charcoal text-charcoal text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:bg-charcoal hover:text-white transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
              {/* Right: Image */}
              <div className="w-[38%] flex-shrink-0">
                <img
                  src="/images/placeholder.jpg"
                  alt="New Arrivals"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

          </div>

          {/* Mobile: Clean Rectangular Cards (Uniform height, no border-radius, split layout) */}
          <div className="lg:hidden flex flex-col gap-4">

            {/* Card 1: Style Under ₹499 (Burgundy / Wine) */}
            <div className="bg-wine text-white overflow-hidden border border-wine flex items-stretch h-[200px]">
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight uppercase">
                    STYLE UNDER<br />₹499
                  </h3>
                  <p className="text-[11px] text-cream/80 leading-snug pt-1">
                    Everything you love.<br />Nothing over ₹499.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?maxPrice=499"
                    className="inline-block border border-white/90 text-white text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 hover:bg-white hover:text-wine transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
              <div className="w-[42%] flex-shrink-0 relative overflow-hidden">
                <img
                  src="/images/placeholder.jpg"
                  alt="Style Under 499"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Card 2: Plus Size Collection (Cream) — Same exact height as Card 1 */}
            <div className="bg-[#f5efe6] text-charcoal overflow-hidden border border-[#e8dfd2] flex items-stretch h-[200px]">
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight text-charcoal uppercase">
                    PLUS SIZE COLLECTION
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-mid block pt-0.5">
                    XS TO 7XL
                  </span>
                  <p className="text-[11px] text-mid leading-snug pt-1">
                    Fashion that fits beautifully<br />and feels amazing.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?category=plus-size"
                    className="inline-block border border-charcoal text-charcoal text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 hover:bg-charcoal hover:text-white transition-colors"
                  >
                    EXPLORE NOW
                  </Link>
                </div>
              </div>
              <div className="w-[42%] flex-shrink-0 relative overflow-hidden">
                <img
                  src="/images/placeholder.jpg"
                  alt="Plus Size Collection"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Card 3: New Arrivals (Cream) — Same exact height as Card 1 */}
            <div className="bg-[#f5efe6] text-charcoal overflow-hidden border border-[#e8dfd2] flex items-stretch h-[200px]">
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight text-charcoal uppercase">
                    NEW ARRIVALS
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-mid block pt-0.5">
                    NEW SEASON
                  </span>
                  <p className="text-[11px] text-mid leading-snug pt-1">
                    Fresh styles.<br />Just for you.
                  </p>
                </div>
                <div>
                  <Link
                    href="/shop?category=new-arrivals"
                    className="inline-block border border-charcoal text-charcoal text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 hover:bg-charcoal hover:text-white transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
              <div className="w-[42%] flex-shrink-0 relative overflow-hidden">
                <img
                  src="/images/placeholder.jpg"
                  alt="New Arrivals"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            6. SEEN ON INSTAGRAM GALLERY (100% Dynamic)
        ═══════════════════════════════════════════════════ */}
        {igPhotos.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 text-center">
            <div className="space-y-0.5">
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider text-charcoal uppercase">
                SEEN ON INSTAGRAM
              </h2>
              <p className="text-[11px] sm:text-xs text-gold-dark font-medium">@tots_clothingclub</p>
            </div>

            {/* Dynamically centered cards: 1, 2, 3... 8 items are always centered and balanced */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
              {igPhotos.map((item, idx) => (
                <a
                  key={idx}
                  href={item.post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden border border-border group relative bg-[#e8e2d8] block w-[calc(33.333%-6px)] sm:w-[130px] md:w-[140px] max-w-[160px] flex-shrink-0"
                >
                  <img
                    src={item.url}
                    alt={`Instagram Post ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Yellow Price Badge (e.g. 499/-) */}
                  {item.tag && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#facc15] text-[#1a1a1a] font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-xs tracking-tight">
                      {item.tag}
                    </div>
                  )}

                  {/* Subtle Center Video / Reel Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/75 backdrop-blur-xs text-charcoal flex items-center justify-center shadow-xs group-hover:bg-white group-hover:scale-110 transition-all">
                      <Play size={12} fill="currentColor" className="ml-0.5 text-charcoal" />
                    </div>
                  </div>

                  {/* Hover Overlay with Instagram Icon */}
                  <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Instagram size={10} /> View Post
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="https://instagram.com/tots_clothingclub"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[#b8966a] text-charcoal text-[10px] sm:text-xs uppercase font-bold tracking-widest px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-[#b8966a] hover:text-white transition-all shadow-2xs"
              >
                <span>FOLLOW US ON INSTAGRAM</span>
              </a>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            7. VALUE PROPOSITIONS STRIP (5 Features) — Desktop/Laptop Only
        ═══════════════════════════════════════════════════ */}
        <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-5 gap-4 py-8 border-y border-border text-center">
            
            <div className="flex flex-col items-center gap-1.5 p-2">
              <Truck size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">FAST DELIVERY</h5>
              <p className="text-[11px] text-mid">Across India</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <RefreshCw size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">EASY RETURNS</h5>
              <p className="text-[11px] text-mid">7 Days Easy Returns</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <ShieldCheck size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">SECURE PAYMENT</h5>
              <p className="text-[11px] text-mid">100% Secure Checkout</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <CreditCard size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">CASH ON DELIVERY</h5>
              <p className="text-[11px] text-mid">Available</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <Crown size={20} className="text-gold" />
              <h5 className="font-serif text-xs font-bold text-charcoal uppercase">SIZE INCLUSIVE</h5>
              <p className="text-[11px] text-mid">XS to 7XL</p>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            8. STAY IN STYLE NEWSLETTER BAR
        ═══════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="bg-[#141414] text-cream rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md border border-[#222222]">
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

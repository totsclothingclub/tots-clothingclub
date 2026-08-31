import React from 'react'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { ProductCard } from '@/components/store/ProductCard'
import SortSelect from '@/components/store/SortSelect'
import MobileShopFilters from '@/components/store/MobileShopFilters'
import { getCategories, getProducts } from '@/lib/supabase/data-service'
import Link from 'next/link'
import {
  ChevronLeft,
  SlidersHorizontal,
  Truck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ShopPageProps {
  searchParams: {
    category?: string
    size?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    search?: string
    isSale?: string
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const categories = await getCategories()

  const currentCategorySlug = searchParams.category || 'all'
  const currentSize         = searchParams.size     || 'all'
  const currentSort         = searchParams.sort     || 'featured'
  const searchQuery         = searchParams.search   || ''
  const isSaleOnly          = searchParams.isSale   === 'true'

  // Dynamic category groups
  const shopParent = categories.find(c => c.slug === 'shop')
  const plusSizeParent = categories.find(c => c.slug === 'plus-size')

  const shopCategories = categories
    .filter(c => {
      if (c.slug === 'new-arrivals' || c.slug === 'shop' || c.slug === 'plus-size' || c.slug === 'sale') return false
      if (c.nav_location === 'shop_dropdown') return true
      if (shopParent && c.parent_id === shopParent.id) return true
      if (c.parent_id === 'cat-shop') return true
      if (['under-199', 'under-499', '99-store', 'salwar-sets', 'chikankari', 'hijabs'].includes(c.slug)) return true
      if (c.slug === 'bottoms' && c.nav_location !== 'plus_size_dropdown') return true
      return !c.nav_location || c.nav_location === 'none'
    })
    .sort((a, b) => a.display_order - b.display_order)

  const plusSizeCategories = categories
    .filter(c => {
      if (c.slug === 'new-arrivals' || c.slug === 'shop' || c.slug === 'sale' || c.slug === 'all-plus-size' || c.slug === 'plus-size') return false
      if (c.nav_location === 'plus_size_dropdown') return true
      if (plusSizeParent && c.parent_id === plusSizeParent.id) return true
      if (c.parent_id === 'cat-plus-size') return true
      if (['modest-wear', 'salwar', 'daily-wear', 'plus-size-bottoms'].includes(c.slug)) return true
      return false
    })
    .sort((a, b) => a.display_order - b.display_order)

  const isPlusSizeSection =
    currentCategorySlug === 'plus-size' ||
    plusSizeCategories.some(c => c.slug === currentCategorySlug)

  const products = await getProducts({
    categorySlug: currentCategorySlug === 'all' ? undefined : currentCategorySlug,
    size:         currentSize === 'all' ? undefined : currentSize,
    searchQuery,
    isSale:       isSaleOnly,
    maxPrice:     searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy:       currentSort as any,
  })

  const currentCategory = categories.find(c => c.slug === currentCategorySlug)
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL']

  // Dynamic Header Title & Subtitle
  const pageTitle = isPlusSizeSection
    ? (currentCategory && currentCategory.slug !== 'plus-size' && currentCategory.slug !== 'all-plus-size'
        ? `PLUS SIZE ${currentCategory.name}`
        : 'PLUS SIZE COLLECTION')
    : (currentCategory ? currentCategory.name : 'ALL PRODUCTS')

  const pageDescription = currentCategory?.description || (isPlusSizeSection ? 'XS to 7XL — Designed for every body' : 'XS to 7XL — Made for every body')

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-charcoal">
      <Header initialCategories={categories} />

      {/* ── Category Header (Exact Reference Screen 2) ── */}
      <div className="bg-[#faf7f2] border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 text-charcoal hover:text-wine rounded-lg flex items-center gap-1 text-xs font-semibold"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <div className="text-center space-y-0.5 flex-1 max-w-lg mx-auto">
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-wider text-charcoal uppercase">
                {pageTitle}
              </h1>
              <p className="text-xs text-mid">
                {pageDescription}
              </p>
            </div>

            <div className="w-8" /> {/* Spacer for symmetry */}
          </div>

          {/* ── Size Filter Pills — Desktop (centered, bordered) ── */}
          <div className="hidden sm:block pt-5 pb-2">
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {sizeOptions.map(size => {
                const isActive = currentSize === size
                const params = new URLSearchParams(searchParams as Record<string, string>)
                if (isActive) params.delete('size')
                else params.set('size', size)

                return (
                  <Link
                    key={size}
                    href={`/shop?${params.toString()}`}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all whitespace-nowrap border shadow-2xs ${
                      isActive
                        ? 'bg-[#141414] text-cream border-[#141414] shadow-sm'
                        : 'bg-white text-charcoal border-border hover:border-gold hover:bg-beige'
                    }`}
                  >
                    {size}
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE ONLY: Size pills + Sort/Filter bar (client component) ── */}
      <div className="sm:hidden bg-[#faf7f2] border-b border-border/60">
        <div className="px-4">
          <MobileShopFilters
            categories={categories}
            currentCategorySlug={currentCategorySlug}
            currentSize={currentSize}
            currentSort={currentSort}
            productsCount={products.length}
            sizeOptions={sizeOptions}
            isPlusSizeSection={isPlusSizeSection}
          />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 pb-24 space-y-6">

        {/* ── DESKTOP: Dynamic Category Sub-Tabs & Sort Row ── */}
        <div className="hidden sm:flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-3">
          
          {/* Dynamic Categories Tab Bar (Desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {isPlusSizeSection ? (
              <>
                {/* 1. First Tab is always ALL PLUS SIZE */}
                <Link
                  href="/shop?category=plus-size"
                  className={`text-xs uppercase font-semibold tracking-wider px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentCategorySlug === 'plus-size' || currentCategorySlug === 'all-plus-size'
                      ? 'bg-wine text-white shadow-xs'
                      : 'bg-beige text-charcoal hover:bg-gold hover:text-white'
                  }`}
                >
                  ALL PLUS SIZE
                </Link>

                {/* 2. Subcategories under PLUS SIZE: MODEST WEAR | SALWAR | DAILY WEAR | BOTTOMS */}
                {plusSizeCategories
                  .filter(c => c.slug !== 'all-plus-size' && c.slug !== 'plus-size')
                  .map(cat => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className={`text-xs uppercase font-semibold tracking-wider px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                        currentCategorySlug === cat.slug
                          ? 'bg-wine text-white shadow-xs'
                          : 'bg-beige text-charcoal hover:bg-gold hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
              </>
            ) : (
              <>
                {/* 1. All Products */}
                <Link
                  href="/shop"
                  className={`text-xs uppercase font-semibold tracking-wider px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentCategorySlug === 'all'
                      ? 'bg-wine text-white shadow-xs'
                      : 'bg-beige text-charcoal hover:bg-gold hover:text-white'
                  }`}
                >
                  All
                </Link>

                {/* 2. SHOP categories: UNDER ₹199 | UNDER ₹499 | 99 STORE | SALWAR SETS | CHIKANKARI | HIJABS | BOTTOMS */}
                {shopCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className={`text-xs uppercase font-semibold tracking-wider px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      currentCategorySlug === cat.slug
                        ? 'bg-wine text-white shadow-xs'
                        : 'bg-beige text-charcoal hover:bg-gold hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Sort & Filter Controls (Desktop) */}
          <div className="flex items-center gap-3 ml-auto text-xs">
            <span className="text-mid">
              Showing <strong className="text-charcoal">{products.length}</strong> styles
            </span>
            <div className="flex items-center gap-2">
              <span className="text-mid font-medium">Sort:</span>
              <SortSelect currentSort={currentSort} />
            </div>
          </div>

        </div>

        {/* ── Product Grid (2-column on mobile, 4-column on desktop) ── */}
        {products.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-border p-8">
            <SlidersHorizontal size={36} className="text-gold mx-auto stroke-1" />
            <h3 className="font-serif text-2xl font-bold text-charcoal">No products found</h3>
            <p className="text-xs text-mid max-w-sm mx-auto">
              We couldn&apos;t find any items matching your selected filters. Try clearing size or category filters.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-wine text-white text-xs uppercase font-semibold tracking-wider px-6 py-3 rounded-xl hover:bg-wine-dark transition-colors"
            >
              Reset All Filters
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-5">
            {products.map(product => (
              <div
                key={product.id}
                className="w-[calc(50%-6px)] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] min-w-[145px] max-w-[285px] flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* ── Load More Button (Exact Reference Screen 2) ── */}
        {products.length > 0 && (
          <div className="text-center pt-8 pb-4">
            <button
              type="button"
              className="border border-charcoal text-charcoal text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-lg hover:bg-charcoal hover:text-white transition-colors shadow-2xs"
            >
              LOAD MORE PRODUCTS
            </button>
          </div>
        )}

        {/* ── Service Benefits Box ── */}
        <div className="mt-8">
          {/* Mobile: Compact soft-cream box with 3 vertically stacked items (Exact Reference) */}
          <div className="sm:hidden bg-[#f9f5ee] border border-[#e8dfd2] rounded-2xl p-5 max-w-[340px] mx-auto shadow-2xs">
            <div className="space-y-4">
              
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[#b8966a]">
                  <Truck size={22} className="stroke-[1.75]" />
                </div>
                <div className="text-left">
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase tracking-wider">
                    FAST DELIVERY
                  </h5>
                  <p className="text-[11px] text-mid">Across India</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[#b8966a]">
                  <RefreshCw size={20} className="stroke-[1.75]" />
                </div>
                <div className="text-left">
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase tracking-wider">
                    EASY RETURNS
                  </h5>
                  <p className="text-[11px] text-mid">7 Days Easy Returns</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[#b8966a]">
                  <ShieldCheck size={22} className="stroke-[1.75]" />
                </div>
                <div className="text-left">
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase tracking-wider">
                    SECURE PAYMENT
                  </h5>
                  <p className="text-[11px] text-mid">100% Safe Checkout</p>
                </div>
              </div>

            </div>
          </div>

          {/* Desktop: Full width 3-column horizontal strip */}
          <div className="hidden sm:block bg-white rounded-2xl border border-border p-6">
            <div className="grid grid-cols-3 gap-4 divide-x divide-border">
              
              <div className="flex items-center gap-3.5 p-2 justify-start">
                <Truck size={22} className="text-gold flex-shrink-0" />
                <div>
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase">FAST DELIVERY</h5>
                  <p className="text-[11px] text-mid">Across India</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2 pl-6 justify-start">
                <RefreshCw size={20} className="text-gold flex-shrink-0" />
                <div>
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase">EASY RETURNS</h5>
                  <p className="text-[11px] text-mid">7 Days Easy Returns</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2 pl-6 justify-start">
                <ShieldCheck size={22} className="text-gold flex-shrink-0" />
                <div>
                  <h5 className="font-serif text-xs font-bold text-charcoal uppercase">SECURE PAYMENT</h5>
                  <p className="text-[11px] text-mid">100% Safe Checkout</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

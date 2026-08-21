'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react'

interface MobileShopFiltersProps {
  categories: { id: string; name: string; slug: string }[]
  currentCategorySlug: string
  currentSize: string
  currentSort: string
  productsCount: number
  sizeOptions: string[]
}

export default function MobileShopFilters({
  categories,
  currentCategorySlug,
  currentSize,
  currentSort,
  productsCount,
  sizeOptions,
}: MobileShopFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [tempSizes, setTempSizes] = useState<string[]>([])

  // Load current sizes into temp state when opening the Size panel
  useEffect(() => {
    if (showSizeModal) {
      setTempSizes(currentSize === 'all' || !currentSize ? [] : currentSize.split(','))
    }
  }, [showSizeModal, currentSize])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('sort', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Toggle size inside the main horizontal quick row
  const toggleSizeQuick = (size: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    const activeSizes = currentSize === 'all' || !currentSize ? [] : currentSize.split(',')
    
    let newSizes: string[]
    if (activeSizes.includes(size)) {
      newSizes = activeSizes.filter(s => s !== size)
    } else {
      newSizes = [...activeSizes, size]
    }

    if (newSizes.length === 0) {
      params.delete('size')
    } else {
      params.set('size', newSizes.join(','))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleSizeTemp = (size: string) => {
    if (tempSizes.includes(size)) {
      setTempSizes(tempSizes.filter(s => s !== size))
    } else {
      setTempSizes([...tempSizes, size])
    }
  }

  const applySizeFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (tempSizes.length === 0) {
      params.delete('size')
    } else {
      params.set('size', tempSizes.join(','))
    }
    router.push(`${pathname}?${params.toString()}`)
    setShowSizeModal(false)
  }

  const clearAllSizes = () => {
    setTempSizes([])
  }

  const buildCategoryUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (!slug) params.delete('category')
    else params.set('category', slug)
    return `${pathname}?${params.toString()}`
  }

  // First 6 sizes to fit mobile viewport without wrapping or horizontal overflow
  const visibleSizes = sizeOptions.slice(0, 6)
  const activeSizes = currentSize === 'all' || !currentSize ? [] : currentSize.split(',')

  return (
    <>
      {/* ── Mobile Size Selector Row (Exact User Requirements) ── */}
      <div className="sm:hidden flex items-center justify-between gap-3 py-3 px-1">
        
        {/* Fixed Non-Overflowing Row of first few sizes */}
        <div className="flex items-center justify-between flex-1 gap-1">
          {visibleSizes.map(size => {
            const isActive = activeSizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSizeQuick(size)}
                className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all border text-center ${
                  isActive
                    ? 'bg-[#141414] text-cream border-[#141414] shadow-sm'
                    : 'bg-white text-charcoal border-border/70 hover:bg-beige/40'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>

        {/* Filter/Expand Icon Button on the far right */}
        <button
          type="button"
          onClick={() => setShowSizeModal(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border/70 text-charcoal hover:bg-beige active:scale-95 transition-all shadow-2xs"
          aria-label="Filter sizes"
        >
          <SlidersHorizontal size={14} />
        </button>

      </div>

      {/* ── Mobile Sort & Filter Bar ── */}
      <div className="sm:hidden flex items-center border-t border-b border-border/60 divide-x divide-border/60">
        
        {/* Sort Dropdown Button */}
        <div className="relative flex-1">
          <select
            value={currentSort}
            onChange={e => handleSortChange(e.target.value)}
            className="w-full appearance-none bg-transparent text-xs font-semibold text-charcoal py-3 pl-10 pr-4 cursor-pointer outline-none"
            aria-label="Sort products"
          >
            <option value="featured">Sort</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
          </select>
          {/* Sort icon overlay */}
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
            </svg>
          </span>
          <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mid" />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilterPanel(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-charcoal"
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>

      </div>

      {/* ── Mobile Filter Panel (Categories) ── */}
      {showFilterPanel && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilterPanel(false)}
          />

          {/* Panel */}
          <div className="relative bg-[#faf7f2] rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-fadein">
            
            {/* Panel Header */}
            <div className="sticky top-0 bg-[#faf7f2] flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/60">
              <h3 className="font-serif text-base font-bold text-charcoal">Filter Products</h3>
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="p-1.5 text-mid hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-6">

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">Category</h4>
                <div className="space-y-1">
                  <Link
                    href={buildCategoryUrl(null)}
                    onClick={() => setShowFilterPanel(false)}
                    className={`block py-2.5 text-sm font-medium border-b border-border/40 transition-colors ${
                      currentCategorySlug === 'all'
                        ? 'text-wine font-bold'
                        : 'text-charcoal'
                    }`}
                  >
                    All Products
                  </Link>
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={buildCategoryUrl(cat.slug)}
                      onClick={() => setShowFilterPanel(false)}
                      className={`block py-2.5 text-sm font-medium border-b border-border/40 transition-colors ${
                        currentCategorySlug === cat.slug
                          ? 'text-wine font-bold'
                          : 'text-charcoal'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="w-full bg-wine text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xl"
              >
                Apply Filters · {productsCount} styles
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Size Selection Modal/Bottom Sheet ── */}
      {showSizeModal && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSizeModal(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative bg-[#faf7f2] rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-fadein">
            
            {/* Header */}
            <div className="sticky top-0 bg-[#faf7f2] flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/60">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal">Select Sizes</h3>
                <p className="text-[10px] text-mid">Choose one or multiple sizes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="p-1.5 text-mid hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sizes Content */}
            <div className="px-5 py-5 space-y-6">
              
              <div className="grid grid-cols-4 gap-2.5">
                {sizeOptions.map(size => {
                  const isSelected = tempSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSizeTemp(size)}
                      className={`text-xs font-semibold py-3 rounded-xl border transition-all flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#141414] text-cream border-[#141414] shadow-sm font-bold'
                          : 'bg-white text-charcoal border-border/70 hover:bg-beige/40'
                      }`}
                    >
                      {size}
                      {isSelected && <Check size={11} className="text-gold" />}
                    </button>
                  )
                })}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                {tempSizes.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSizes}
                    className="flex-1 py-3.5 bg-white border border-border text-charcoal hover:bg-beige/40 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={applySizeFilters}
                  className="flex-[2] py-3.5 bg-wine text-white text-xs font-bold uppercase tracking-wider rounded-xl text-center shadow-md hover:bg-wine-dark"
                >
                  Apply Selection ({tempSizes.length})
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  )
}

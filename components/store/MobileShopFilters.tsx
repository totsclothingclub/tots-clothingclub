'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'rating',     label: 'Highest Rated' },
]

interface MobileShopFiltersProps {
  categories: { id: string; name: string; slug: string }[]
  currentCategorySlug: string
  currentSize: string
  currentSort: string
  productsCount: number
  sizeOptions: string[]
  isPlusSizeSection?: boolean
}

export default function MobileShopFilters({
  categories,
  currentCategorySlug,
  currentSize,
  currentSort,
  productsCount,
  sizeOptions,
  isPlusSizeSection = false,
}: MobileShopFiltersProps) {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [tempSizes, setTempSizes] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<'shop' | 'plus_size'>(
    isPlusSizeSection ? 'plus_size' : 'shop'
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSelectedGroup(isPlusSizeSection ? 'plus_size' : 'shop')
  }, [isPlusSizeSection, currentCategorySlug])

  // Prevent background scrolling while any mobile modal is open
  useEffect(() => {
    const isAnyModalOpen = showFilterPanel || showSortModal || showSizeModal
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow
      const originalTouchAction = document.body.style.touchAction
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.touchAction = originalTouchAction
      }
    }
  }, [showFilterPanel, showSortModal, showSizeModal])

  const shopParent = categories.find(c => c.slug === 'shop')
  const plusSizeParent = categories.find(c => c.slug === 'plus-size')

  const shopCategoriesList = categories
    .filter(c => {
      if (c.slug === 'new-arrivals' || c.slug === 'shop' || c.slug === 'plus-size' || c.slug === 'sale') return false
      if ((c as any).nav_location === 'shop_dropdown') return true
      if (shopParent && (c as any).parent_id === shopParent.id) return true
      if ((c as any).parent_id === 'cat-shop') return true
      if (['under-199', 'under-499', '99-store', 'salwar-sets', 'chikankari', 'hijabs', 'bottoms'].includes(c.slug) && (c as any).nav_location !== 'plus_size_dropdown') return true
      return false
    })
    .sort((a, b) => ((a as any).display_order || 0) - ((b as any).display_order || 0))

  const plusSizeCategoriesList = categories
    .filter(c => {
      if (c.slug === 'new-arrivals' || c.slug === 'shop' || c.slug === 'sale' || c.slug === 'all-plus-size' || c.slug === 'plus-size') return false
      if ((c as any).nav_location === 'plus_size_dropdown') return true
      if (plusSizeParent && (c as any).parent_id === plusSizeParent.id) return true
      if ((c as any).parent_id === 'cat-plus-size') return true
      if (['modest-wear', 'salwar', 'daily-wear', 'plus-size-bottoms'].includes(c.slug)) return true
      return false
    })
    .sort((a, b) => ((a as any).display_order || 0) - ((b as any).display_order || 0))

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
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || 'Featured'

  return (
    <>
      {/* ── Mobile Size Selector Row ── */}
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
      <div className="sm:hidden flex items-center border-t border-b border-border/60 divide-x divide-border/60 bg-[#faf7f2]">
        {/* Sort Trigger Button */}
        <button
          type="button"
          onClick={() => setShowSortModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-charcoal hover:bg-beige/30 active:bg-beige/50 transition-colors"
          aria-label="Sort products"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-charcoal shrink-0">
            <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
          </svg>
          <span className="truncate">{activeSortLabel}</span>
          <ChevronDown size={12} className="text-mid shrink-0" />
        </button>

        {/* Filter Trigger Button */}
        <button
          type="button"
          onClick={() => setShowFilterPanel(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-charcoal hover:bg-beige/30 active:bg-beige/50 transition-colors"
          aria-label="Filter products"
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
      </div>

      {/* ── Mobile Filter Bottom Sheet Modal (Matches Reference Screenshot 1) ── */}
      {showFilterPanel && mounted && typeof document !== 'undefined' && createPortal(
        <div className="sm:hidden fixed inset-0 z-[80] flex flex-col justify-end">
          {/* Solid Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-fadein"
            onClick={() => setShowFilterPanel(false)}
          />

          {/* Bottom Sheet Modal Container with Solid Background */}
          <div
            className="relative w-full bg-[#faf7f2] rounded-t-[28px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 animate-slideup"
            style={{
              background: '#faf7f2',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Sheet Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-[#e2d9cc] bg-[#faf7f2]">
              <h3 className="font-serif text-[18px] font-bold text-charcoal tracking-tight">
                Filter Products
              </h3>
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="p-1.5 text-charcoal/70 hover:text-charcoal active:scale-95 transition-transform"
                aria-label="Close filter sheet"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
              {/* Category Filter Section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#a8864d]">
                  CATEGORY
                </h4>

                {/* Segmented Category Group Switcher: [ SHOP ] [ PLUS SIZE ] */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#ede8df]/80 rounded-2xl border border-[#e2d9cc]">
                  <button
                    type="button"
                    onClick={() => setSelectedGroup('shop')}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center ${
                      selectedGroup === 'shop'
                        ? 'bg-[#1a1a1a] text-white shadow-xs'
                        : 'text-charcoal hover:text-black'
                    }`}
                  >
                    SHOP
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup('plus_size')}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center ${
                      selectedGroup === 'plus_size'
                        ? 'bg-[#1a1a1a] text-white shadow-xs'
                        : 'text-charcoal hover:text-black'
                    }`}
                  >
                    PLUS SIZE
                  </button>
                </div>

                {/* Category List with Clean Dividers */}
                <div className="divide-y divide-[#eae3d9] pt-1">
                  {selectedGroup === 'shop' ? (
                    <>
                      <Link
                        href={buildCategoryUrl(null)}
                        onClick={() => setShowFilterPanel(false)}
                        className={`block py-3 text-[14px] transition-colors ${
                          currentCategorySlug === 'all' || !currentCategorySlug
                            ? 'text-wine font-bold'
                            : 'text-charcoal font-medium hover:text-black'
                        }`}
                      >
                        All Products
                      </Link>
                      {shopCategoriesList.map(cat => (
                        <Link
                          key={cat.id}
                          href={buildCategoryUrl(cat.slug)}
                          onClick={() => setShowFilterPanel(false)}
                          className={`block py-3 text-[14px] transition-colors ${
                            currentCategorySlug === cat.slug
                              ? 'text-wine font-bold'
                              : 'text-charcoal font-medium hover:text-black'
                          }`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      <Link
                        href={buildCategoryUrl('plus-size')}
                        onClick={() => setShowFilterPanel(false)}
                        className={`block py-3 text-[14px] transition-colors ${
                          currentCategorySlug === 'plus-size' || currentCategorySlug === 'all-plus-size'
                            ? 'text-wine font-bold'
                            : 'text-charcoal font-medium hover:text-black'
                        }`}
                      >
                        All Plus Size
                      </Link>
                      {plusSizeCategoriesList.map(cat => (
                        <Link
                          key={cat.id}
                          href={buildCategoryUrl(cat.slug)}
                          onClick={() => setShowFilterPanel(false)}
                          className={`block py-3 text-[14px] transition-colors ${
                            currentCategorySlug === cat.slug
                              ? 'text-wine font-bold'
                              : 'text-charcoal font-medium hover:text-black'
                          }`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned Bottom Action Area */}
            <div className="flex-shrink-0 px-5 pt-3 pb-2 bg-[#faf7f2] border-t border-[#e2d9cc]/60">
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="w-full bg-wine text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-wine-dark active:scale-[0.99] transition-all shadow-sm flex items-center justify-center text-center"
              >
                APPLY FILTERS {productsCount > 0 ? `· ${productsCount} STYLES` : ''}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Mobile Sort Bottom Sheet Modal (Redesigned to Match Filter Sheet) ── */}
      {showSortModal && mounted && typeof document !== 'undefined' && createPortal(
        <div className="sm:hidden fixed inset-0 z-[80] flex flex-col justify-end">
          {/* Solid Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-fadein"
            onClick={() => setShowSortModal(false)}
          />

          {/* Bottom Sheet Modal Container with Solid Background */}
          <div
            className="relative w-full bg-[#faf7f2] rounded-t-[28px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden z-10 animate-slideup"
            style={{
              background: '#faf7f2',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Sheet Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-[#e2d9cc] bg-[#faf7f2]">
              <h3 className="font-serif text-[18px] font-bold text-charcoal tracking-tight">
                Sort By
              </h3>
              <button
                type="button"
                onClick={() => setShowSortModal(false)}
                className="p-1.5 text-charcoal/70 hover:text-charcoal active:scale-95 transition-transform"
                aria-label="Close sort sheet"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Sort Options List */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 divide-y divide-[#eae3d9]">
              {SORT_OPTIONS.map(opt => {
                const isSelected = currentSort === opt.value || (!currentSort && opt.value === 'featured')
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      handleSortChange(opt.value)
                      setShowSortModal(false)
                    }}
                    className="w-full flex items-center justify-between py-4 text-left transition-colors active:bg-[#ede8df]/30 group cursor-pointer"
                  >
                    <span
                      className={`text-[14px] transition-colors ${
                        isSelected
                          ? 'text-wine font-bold'
                          : 'text-charcoal font-medium group-hover:text-black'
                      }`}
                    >
                      {opt.label}
                    </span>

                    {/* Radio Button Indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-wine' : 'border-[#c8bfb3]'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-wine animate-fadein" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Mobile Size Selection Modal / Bottom Sheet ── */}
      {showSizeModal && mounted && typeof document !== 'undefined' && createPortal(
        <div className="sm:hidden fixed inset-0 z-[80] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-fadein"
            onClick={() => setShowSizeModal(false)}
          />

          {/* Bottom Sheet */}
          <div
            className="relative w-full bg-[#faf7f2] rounded-t-[28px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 animate-slideup"
            style={{
              background: '#faf7f2',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-[#e2d9cc] bg-[#faf7f2]">
              <div>
                <h3 className="font-serif text-[18px] font-bold text-charcoal tracking-tight">Select Sizes</h3>
                <p className="text-[11px] text-mid">Choose one or multiple sizes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="p-1.5 text-charcoal/70 hover:text-charcoal active:scale-95 transition-transform"
                aria-label="Close size sheet"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Sizes Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
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
            </div>

            {/* Actions Footer */}
            <div className="flex-shrink-0 px-5 pt-3 pb-2 bg-[#faf7f2] border-t border-[#e2d9cc]/60 flex gap-3">
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
        </div>,
        document.body
      )}
    </>
  )
}

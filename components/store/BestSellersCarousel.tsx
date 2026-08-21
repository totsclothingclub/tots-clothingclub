'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'

interface BestSellersCarouselProps {
  products: Product[]
}

export default function BestSellersCarousel({ products }: BestSellersCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const checkScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    // Check if total content width exceeds visible container width
    const hasOverflow = el.scrollWidth > el.clientWidth + 4
    setIsOverflowing(hasOverflow)
    setCanScrollLeft(el.scrollLeft > 6)
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    // Run initial checks and after layout settles
    checkScroll()
    const timer1 = setTimeout(checkScroll, 100)
    const timer2 = setTimeout(checkScroll, 500)

    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', handleResize)
    }
  }, [checkScroll, products])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const cardEl = el.querySelector('[data-product-card]') as HTMLElement | null
    const cardWidth = cardEl?.offsetWidth ?? 220
    const gap = window.innerWidth < 640 ? 12 : 16
    // On mobile scroll by 1 card step, on desktop scroll by 2 cards step
    const step = window.innerWidth < 640 ? (cardWidth + gap) : (cardWidth + gap) * 2
    const scrollAmount = dir === 'right' ? step : -step
    
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="relative group/carousel w-full max-w-[1600px] mx-auto">

      {/* Left Navigation Arrow (Desktop & Mobile) */}
      {isMounted && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Previous products"
          className="absolute left-2 sm:left-4 top-[40%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-border/80 text-charcoal shadow-md hover:bg-beige hover:border-gold transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronLeft size={18} className="stroke-[2.2]" />
        </button>
      )}

      {/* Right Navigation Arrow (Desktop & Mobile) */}
      {isMounted && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Next products"
          className="absolute right-2 sm:right-4 top-[40%] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-border/80 text-charcoal shadow-md hover:bg-beige hover:border-gold transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronRight size={18} className="stroke-[2.2]" />
        </button>
      )}

      {/* Scrollable Track */}
      <div
        ref={trackRef}
        onScroll={checkScroll}
        className="overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-8 lg:px-12 xl:px-16 scroll-pl-4 scroll-pr-4 sm:scroll-pl-8 sm:scroll-pr-8 snap-x snap-mandatory"
      >
        {/*
          Dynamic centering:
          - If products fit comfortably (no overflow), apply 'justify-center' to center them all with equal side margins.
          - If products overflow, apply 'justify-start' to start cleanly from left:0 and allow horizontal scrolling.
        */}
        <div
          className={`flex gap-2.5 sm:gap-4 min-w-full pb-2 ${
            isMounted && isOverflowing ? 'justify-start' : 'justify-center'
          }`}
        >
          {products.map(product => (
            <div
              key={product.id}
              data-product-card
              /*
               * Mobile  : Exactly 2 cards per view with 16px left/right margins and 10px gap
               *           Width: calc((100vw - 32px padding - 10px gap) / 2) = calc(50vw - 21px)
               * Tablet  : 3 cards: calc((100vw - 64px - 32px) / 3) ≈ calc(33.333vw - 32px)
               * Desktop : Fixed 220px-235px card width, centered or scrollable
               */
              className="flex-shrink-0 snap-start w-[calc(50vw-21px)] sm:w-[calc(33.333vw-32px)] lg:w-[220px] xl:w-[235px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}


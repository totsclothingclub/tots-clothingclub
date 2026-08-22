'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Category } from '@/lib/types'

interface HomeCategoryCarouselProps {
  categories: Category[]
}

export default function HomeCategoryCarousel({ categories }: HomeCategoryCarouselProps) {
  const getCategoryHref = (cat: Category) => {
    if (cat.slug === 'shop') return '/shop'
    if (cat.slug === 'plus-size') return '/shop?category=plus-size'
    if (cat.slug === 'new-arrivals') return '/shop?category=new-arrivals'
    if (cat.slug === 'sale') return '/shop?category=sale'
    return `/shop?category=${cat.slug}`
  }

  // ── Desktop 4 featured cards (Top Navbar categories: New Arrivals, Shop, Plus Size, Sale) ──
  const navbarCategories = categories
    .filter(c => c.nav_location === 'navbar' && c.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const otherActiveCategories = categories
    .filter(c => c.is_active && c.nav_location !== 'navbar')
    .sort((a, b) => a.display_order - b.display_order)

  const desktopCategories = navbarCategories.length >= 4
    ? navbarCategories.slice(0, 4)
    : [...navbarCategories, ...otherActiveCategories].slice(0, 4)

  // ── Mobile Pagination: 4 categories per page (All active categories) ──
  const mobileCategories = [...navbarCategories, ...otherActiveCategories]
  const itemsPerPage = 4
  const totalPages = Math.max(1, Math.ceil(mobileCategories.length / itemsPerPage))
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Touch swipe state
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const nextPage = useCallback(() => {
    setCurrentPage(prev => (prev + 1) % totalPages)
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  // Auto-advance timer (every 3.5 seconds)
  useEffect(() => {
    if (totalPages <= 1 || isPaused) return
    const timer = setInterval(() => {
      nextPage()
    }, 3500)
    return () => clearInterval(timer)
  }, [totalPages, isPaused, nextPage])

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current
      if (distance > 45) {
        // Swiped left -> Next
        nextPage()
      } else if (distance < -45) {
        // Swiped right -> Prev
        prevPage()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
    // Resume auto-slide after brief pause
    setTimeout(() => setIsPaused(false), 2000)
  }

  if (categories.length === 0) return null

  // Slice categories for current page on mobile
  const currentMobileItems = mobileCategories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* ── Section Title ── */}
      <div className="text-center space-y-1 lg:hidden">
        <h2 className="font-serif text-2xl font-bold tracking-wider text-charcoal uppercase">
          SHOP BY CATEGORY
        </h2>
        <div className="w-12 h-0.5 bg-gold mx-auto" />
      </div>

      {/* ── DESKTOP VIEW: 4 Category Cards in 1 Row (New Arrivals, Shop, Plus Size, Sale) ── */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 w-full">
        {desktopCategories.map((cat) => (
          <Link
            key={cat.id}
            href={getCategoryHref(cat)}
            className="group relative bg-[#f5efe6] overflow-hidden border border-[#e8dfd2] flex items-stretch hover:border-gold hover:shadow-xs transition-all duration-300 min-h-[165px] w-full rounded-sm"
          >
            {/* Left section: Text content */}
            <div className="flex-1 p-4 xl:p-5 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-charcoal text-sm xl:text-base uppercase tracking-wider group-hover:text-wine transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-mid leading-relaxed line-clamp-2">
                  {cat.description || 'Explore our latest collection'}
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-charcoal group-hover:text-wine transition-colors">
                  SHOP NOW &rarr;
                </span>
              </div>
            </div>

            {/* Right section: Category image */}
            <div className="w-[44%] flex-shrink-0 bg-transparent flex items-end justify-center relative overflow-hidden">
              <img
                src={cat.image_url || '/images/placeholder.jpg'}
                alt={cat.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 bg-transparent"
                onError={(e: any) => { e.target.src = '/images/placeholder.jpg' }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── MOBILE VIEW: 4 Categories per view with Auto-Swipe & Navigation ── */}
      <div 
        className="lg:hidden relative select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <button
              type="button"
              onClick={prevPage}
              aria-label="Previous categories"
              className="absolute -left-2 top-[38%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-border/80 text-charcoal shadow-md flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronLeft size={16} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={nextPage}
              aria-label="Next categories"
              className="absolute -right-2 top-[38%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-border/80 text-charcoal shadow-md flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronRight size={16} className="stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Dynamic Grid for Mobile: 1 centered, 2 side-by-side, 3 (2 top + 1 centered bottom), 4 in 2x2 */}
        <div className={`grid gap-4 px-3 sm:px-6 transition-opacity duration-300 ${
          currentMobileItems.length === 1 
            ? 'grid-cols-1 max-w-[220px] mx-auto justify-items-center' 
            : 'grid-cols-2'
        }`}>
          {currentMobileItems.map((cat, index) => {
            const isThirdInThree = currentMobileItems.length === 3 && index === 2
            return (
              <div 
                key={cat.id} 
                className={`flex justify-center ${isThirdInThree ? 'col-span-2' : ''}`}
              >
                <Link
                  href={getCategoryHref(cat)}
                  className="group flex flex-col items-center text-center space-y-2.5 cursor-pointer py-1 w-full max-w-[180px]"
                >
                  {/* Circular category portrait card */}
                  <div className="w-32 h-32 xs:w-36 xs:h-36 rounded-full overflow-hidden bg-white p-1 border-2 border-gold/40 group-hover:border-wine group-hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center">
                    <img
                      src={cat.image_url || '/images/placeholder.jpg'}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e: any) => { e.target.src = '/images/placeholder.jpg' }}
                    />
                  </div>
                  <h3 className={`font-serif font-bold text-xs xs:text-sm uppercase tracking-wider transition-colors ${
                    cat.slug.includes('plus-size') ? 'text-wine' : 'text-charcoal group-hover:text-wine'
                  }`}>
                    {cat.name}
                  </h3>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Dot Indicators & Slide Count */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                aria-label={`Go to page ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentPage === idx
                    ? 'w-6 bg-wine'
                    : 'w-1.5 bg-gold/40 hover:bg-gold'
                }`}
              />
            ))}
          </div>
        )}

      </div>

    </section>
  )
}

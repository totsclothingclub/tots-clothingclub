'use client'

import React from 'react'
import Link from 'next/link'
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

  // ── Top Navbar categories (New Arrivals, Shop, Plus Size, Sale) ──
  const navbarCategories = categories
    .filter(c => c.nav_location === 'navbar' && c.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const otherActiveCategories = categories
    .filter(c => c.is_active && c.nav_location !== 'navbar')
    .sort((a, b) => a.display_order - b.display_order)

  // Use the 4 Top Navbar categories for both desktop and mobile
  const topCategories = navbarCategories.length >= 4
    ? navbarCategories.slice(0, 4)
    : [...navbarCategories, ...otherActiveCategories].slice(0, 4)

  if (categories.length === 0 || topCategories.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* ── Section Title ── */}
      <div className="text-center space-y-1 lg:hidden">
        <h2 className="font-heading text-2xl font-bold tracking-wider text-charcoal uppercase">
          SHOP BY CATEGORY
        </h2>
        <div className="w-12 h-0.5 bg-gold mx-auto" />
      </div>

      {/* ── DESKTOP VIEW: 4 Category Cards in 1 Row (New Arrivals, Shop, Plus Size, Sale) ── */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 w-full">
        {topCategories.map((cat) => (
          <Link
            key={cat.id}
            href={getCategoryHref(cat)}
            className="group relative bg-[#f5efe6] overflow-hidden border border-[#e8dfd2] flex items-stretch hover:border-gold hover:shadow-xs transition-all duration-300 min-h-[165px] w-full rounded-sm"
          >
            {/* Left section: Text content */}
            <div className="flex-1 p-4 xl:p-5 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-charcoal text-xs xl:text-sm uppercase tracking-wider group-hover:text-wine transition-colors leading-tight">
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

      {/* ── MOBILE VIEW: Exactly the 4 Top Navbar Categories in a 2x2 Grid (No swipe/carousel needed) ── */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-4 px-3 sm:px-6">
          {topCategories.map((cat) => (
            <div key={cat.id} className="flex justify-center">
              <Link
                href={getCategoryHref(cat)}
                className="group flex flex-col items-center text-center space-y-2.5 cursor-pointer py-1 w-full max-w-[180px]"
              >
                {/* Circular category portrait card */}
                <div className="w-32 h-32 xs:w-36 xs:h-36 rounded-full overflow-hidden bg-white p-1 border-2 border-gold/40 group-hover:border-wine group-hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center">
                  <img
                    src={cat.image_url || '/images/placeholder.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top rounded-full"
                    onError={(e: any) => { e.target.src = '/images/placeholder.jpg' }}
                  />
                </div>
                <h3 className={`font-sans font-bold text-xs xs:text-sm uppercase tracking-wider transition-colors ${
                  cat.slug.includes('plus-size') ? 'text-wine' : 'text-charcoal group-hover:text-wine'
                }`}>
                  {cat.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}


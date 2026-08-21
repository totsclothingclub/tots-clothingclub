'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Instagram,
  Truck
} from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { useWishlist } from '@/lib/context/WishlistContext'
import { getCategories } from '@/lib/supabase/data-service'
import { Category } from '@/lib/types'
import { SearchOverlay } from './SearchOverlay'
import { CartDrawer } from './CartDrawer'

interface HeaderProps {
  initialCategories?: Category[]
}

export function Header({ initialCategories }: HeaderProps) {
  const pathname = usePathname()
  const { totalItemCount, setIsDrawerOpen } = useCart()
  const { wishlistCount } = useWishlist()
  
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Dynamic category fetching from database/Admin
  useEffect(() => {
    getCategories().then(cats => {
      const activeCats = (cats || []).filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)
      setCategories(activeCats)
    })
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#111111] text-cream text-[11px] py-1.5 border-b border-[#222222]">
        {/* Mobile: shipping text centered, Follow Us hidden */}
        <div className="flex sm:hidden items-center justify-center gap-2 font-medium tracking-wide px-4">
          <Truck size={13} className="text-gold flex-shrink-0" />
          <span>Free Shipping on Orders Above ₹999</span>
        </div>

        {/* Desktop: full-width, left = shipping, right = follow us */}
        <div className="hidden sm:flex w-full px-6 lg:px-8 xl:px-12 items-center justify-between">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Truck size={13} className="text-gold" />
            <span>Free Shipping on Orders Above ₹999</span>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <span className="text-[10px] uppercase tracking-wider">Follow us</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={13} />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Header (Black background with Gold accents) ── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-md' : 'bg-[#141414]'
        } border-b border-[#242424]`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-[64px] lg:h-[72px]">
            
            {/* ══════════════════════════════════════════════
                MOBILE VIEW: Hamburger (Left) | TOTS Logo (CENTER) | Wishlist & Cart (Right)
            ══════════════════════════════════════════════ */}
            <div className="flex lg:hidden items-center justify-between w-full">
              {/* Left: Hamburger button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-cream hover:text-gold transition-colors"
                aria-label="Open mobile menu"
              >
                <Menu size={22} />
              </button>

              {/* Center: TOTS Logo in Mobile Screen */}
              <Link href="/" className="flex items-center justify-center py-1">
                <img
                  src="/images/tots-logo.png"
                  alt="TOTS"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>

              {/* Right: Wishlist & Cart */}
              <div className="flex items-center gap-2">
                <Link
                  href="/wishlist"
                  className="relative p-2 text-cream hover:text-gold transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="relative p-2 text-cream hover:text-gold transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingBag size={20} />
                  {totalItemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                DESKTOP VIEW: Logo (LEFT) | Categories (CENTERED) | Icons (RIGHT)
                All vertically centered on the exact same center line
            ══════════════════════════════════════════════ */}
            <div className="hidden lg:flex items-center justify-between w-full">
              
              {/* Desktop Logo (slightly from left edge) */}
              <div className="flex items-center justify-start min-w-[160px] ml-4 lg:ml-8 xl:ml-12">
                <Link href="/" className="flex items-center group">
                  <img
                    src="/images/tots-logo.png"
                    alt="TOTS"
                    className="h-9 xl:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>

              {/* Desktop Centered Category Navigation */}
              <nav className="flex items-center justify-center gap-7 xl:gap-8 mx-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className={`text-xs uppercase tracking-[0.18em] font-medium transition-colors hover:text-gold ${
                      pathname === `/shop?category=${cat.slug}`
                        ? 'text-gold font-semibold'
                        : 'text-cream/90'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}

                {/* Always active clearance sale link if not already in categories */}
                {!categories.some(c => c.slug === 'sale') && (
                  <Link
                    href="/shop?isSale=true"
                    className="text-xs uppercase tracking-[0.18em] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    SALE
                  </Link>
                )}
              </nav>

              {/* Desktop Right Icons (RIGHT) */}
              <div className="flex items-center justify-end gap-5 text-cream min-w-[160px]">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1 hover:text-gold transition-colors flex items-center justify-center"
                  aria-label="Search Catalog"
                >
                  <Search size={18} />
                </button>

                <Link
                  href="/account"
                  className="p-1 hover:text-gold transition-colors flex items-center justify-center"
                  aria-label="Account"
                >
                  <User size={18} />
                </Link>

                <Link
                  href="/wishlist"
                  className="relative p-1 hover:text-gold transition-colors flex items-center justify-center"
                  aria-label="Wishlist"
                >
                  <Heart size={18} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-wine text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="relative p-1 hover:text-gold transition-colors flex items-center justify-center"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag size={18} />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-wine text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {totalItemCount}
                    </span>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Drawer (Uses Dynamic Categories from Admin) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fadein"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#141414] text-cream shadow-2xl animate-slidein flex flex-col border-r border-[#262626]">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#262626]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img
                  src="/images/tots-logo.png"
                  alt="TOTS"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dynamic Category List */}
            <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-3">
                Categories
              </p>
              
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold uppercase tracking-wider text-cream hover:text-gold border-b border-[#222222]"
              >
                All Products
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm font-medium uppercase tracking-wider text-gray-300 hover:text-gold border-b border-[#222222]"
                >
                  {cat.name}
                </Link>
              ))}

              <Link
                href="/shop?isSale=true"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300"
              >
                Sale & Clearance
              </Link>
            </nav>

            {/* Drawer Footer Links */}
            <div className="border-t border-[#262626] px-6 py-5 space-y-3 bg-[#0d0d0d]">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-xs text-gray-300 hover:text-gold"
              >
                <User size={16} /> My Account
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-xs text-gray-300 hover:text-gold"
              >
                <Heart size={16} /> Wishlist ({wishlistCount})
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-xs text-gold hover:underline pt-2 border-t border-[#222222]"
              >
                Admin Control Panel
              </Link>
            </div>

          </div>
        </div>
      )}

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  )
}

export default Header

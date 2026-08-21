'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid2x2, Heart, User, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { useWishlist } from '@/lib/context/WishlistContext'

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()
  const { totalItemCount, setIsDrawerOpen } = useCart()
  const { wishlistCount } = useWishlist()

  const navItems = [
    { label: 'Home',    href: '/',         icon: Home },
    { label: 'Shop',    href: '/shop',     icon: Grid2x2 },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Account', href: '/account',  icon: User },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-stretch"
      style={{ background: '#fff', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(item => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 py-2 relative transition-colors"
            style={{ color: isActive ? 'var(--charcoal)' : 'var(--gray-mid)' }}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {(item.badge ?? 0) > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ fontSize: '9px', background: 'var(--wine)' }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5"
                style={{ background: 'var(--charcoal)' }}
              />
            )}
          </Link>
        )
      })}

      {/* Cart button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-2 relative transition-colors"
        style={{ color: 'var(--gray-mid)' }}
        aria-label="Cart"
      >
        <div className="relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {totalItemCount > 0 && (
            <span
              className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ fontSize: '9px', background: 'var(--charcoal)' }}
            >
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 font-medium">Cart</span>
      </button>
    </nav>
  )
}

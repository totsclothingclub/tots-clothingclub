'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid2x2, User, ShoppingBag, Search } from 'lucide-react'
import { useCart } from '@/lib/context/CartContext'
import { SearchOverlay } from './SearchOverlay'

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname()
  const { totalItemCount, setIsDrawerOpen } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)

  const leftNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Grid2x2 },
  ]

  const rightNavItems = [
    { label: 'Search', onClick: () => setSearchOpen(true), icon: Search },
    { label: 'Account', href: '/account', icon: User },
  ]

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2d9cc] flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)', height: '62px' }}
      >
        {/* Left 2 Items: Home, Shop */}
        {leftNavItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1.5 relative transition-colors"
              style={{ color: isActive ? 'var(--wine)' : 'var(--gray-mid)' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold text-wine' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-wine rounded-full" />
              )}
            </Link>
          )
        })}

        {/* Center Enlarged Floating Cart Button */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-3.5">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-[50px] h-[50px] rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shadow-lg border-2 border-gold active:scale-95 transition-transform hover:bg-[#2c2c2c] relative group"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag size={22} className="text-gold group-hover:scale-110 transition-transform" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                {totalItemCount}
              </span>
            )}
          </button>
          <span className="text-[10px] font-semibold text-charcoal mt-0.5 tracking-tight">
            Cart
          </span>
        </div>

        {/* Right 2 Items: Search, Account */}
        {rightNavItems.map(item => {
          const Icon = item.icon
          const isActive = item.href ? pathname === item.href : false
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1.5 relative transition-colors"
                style={{ color: isActive ? 'var(--wine)' : 'var(--gray-mid)' }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold text-wine' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-wine rounded-full" />
                )}
              </Link>
            )
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center justify-center flex-1 py-1.5 relative transition-colors text-gray-500 hover:text-charcoal"
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={1.6} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Embedded Search Overlay for Mobile Bottom Nav */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

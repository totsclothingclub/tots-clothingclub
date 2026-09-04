'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'
import { validateCoupon, getActiveCoupons } from '@/lib/supabase/data-service'
import { Coupon } from '@/lib/types'

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    isDrawerOpen,
    setIsDrawerOpen,
    appliedCoupon,
    couponCode,
    discount,
    couponMessage,
    applyCoupon,
    removeCoupon
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([])

  const backdropRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const touchStartYRef = useRef<number>(0)

  const shippingFee = 80

  // 1. Fetch active coupons when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      getActiveCoupons().then(list => setActiveCoupons(list || []))
    }
  }, [isDrawerOpen])

  useEffect(() => {
    if (couponCode) {
      setCouponInput(couponCode)
    }
  }, [couponCode])

  // 2. Comprehensive Mobile & Desktop Scroll Lock (iOS Safari + Android Chrome + Desktop)
  useEffect(() => {
    if (!isDrawerOpen) return

    // Capture the exact current scroll position before locking
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

    // Save initial inline styles to restore accurately
    const originalBodyPosition = document.body.style.position
    const originalBodyTop = document.body.style.top
    const originalBodyLeft = document.body.style.left
    const originalBodyRight = document.body.style.right
    const originalBodyWidth = document.body.style.width
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyPaddingRight = document.body.style.paddingRight
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior

    // Lock body and html
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'

    // Handle Escape key to close drawer
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup: Restore scroll position and unlock
    return () => {
      window.removeEventListener('keydown', handleKeyDown)

      document.body.style.position = originalBodyPosition
      document.body.style.top = originalBodyTop
      document.body.style.left = originalBodyLeft
      document.body.style.right = originalBodyRight
      document.body.style.width = originalBodyWidth
      document.body.style.overflow = originalBodyOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll

      // Restore exact scroll position smoothly without layout shift
      window.scrollTo(0, scrollY)
    }
  }, [isDrawerOpen, setIsDrawerOpen])

  // 3. Prevent touchmove propagation from backdrop/non-scrollable elements on mobile
  useEffect(() => {
    if (!isDrawerOpen) return

    const backdropEl = backdropRef.current
    if (!backdropEl) return

    const handleBackdropTouchMove = (e: TouchEvent) => {
      // If the touch target is NOT inside the scrollable cart container, prevent background scrolling
      if (scrollContainerRef.current && !scrollContainerRef.current.contains(e.target as Node)) {
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    }

    backdropEl.addEventListener('touchmove', handleBackdropTouchMove, { passive: false })

    return () => {
      backdropEl.removeEventListener('touchmove', handleBackdropTouchMove)
    }
  }, [isDrawerOpen])

  // 4. Cart Scrollable Container Touch Handling (Prevents iOS rubberband from scrolling background)
  const handleScrollTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleScrollTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current
    if (!el) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartYRef.current
    const isScrollingDown = deltaY > 0
    const isScrollingUp = deltaY < 0

    const isAtTop = el.scrollTop <= 0
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1

    // If the cart content does not overflow (no scroll needed), prevent touch drag
    if (el.scrollHeight <= el.clientHeight) {
      if (e.cancelable) e.preventDefault()
      e.stopPropagation()
      return
    }

    // If at top and trying to drag down, or at bottom and trying to drag up, prevent parent chaining
    if ((isAtTop && isScrollingDown) || (isAtBottom && isScrollingUp)) {
      if (e.cancelable) e.preventDefault()
    }

    e.stopPropagation()
  }

  if (!isDrawerOpen) return null

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    await applyCoupon(couponInput)
  }

  const finalTotal = Math.max(0, subtotal - discount + shippingFee)

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) {
          setIsDrawerOpen(false)
        }
      }}
      className="fixed inset-0 z-[70] overflow-hidden bg-black/60 backdrop-blur-xs animate-fadein flex justify-end h-[100dvh] max-h-[100dvh] w-full touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-screen sm:max-w-md h-[100dvh] max-h-[100dvh] bg-tots-cream shadow-2xl flex flex-col sm:border-l border-tots-gold/30 overflow-hidden max-w-full min-w-0 animate-slidein-right touch-auto select-auto"
      >
        
        {/* Drawer Header — Fixed at top of cart */}
        <div
          className="p-4 sm:p-5 border-b border-tots-border bg-tots-dark text-white flex items-center justify-between flex-shrink-0 select-none"
          style={{ touchAction: 'none' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-tots-gold" />
            <h2 className="font-serif text-lg sm:text-xl font-semibold tracking-wide">Your Shopping Cart</h2>
            <span className="bg-tots-wine text-xs px-2 py-0.5 rounded-full font-sans font-medium text-white">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="text-gray-300 hover:text-white transition-colors p-1"
            aria-label="Close Shopping Cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items List — Strictly isolated scroll container */}
        <div
          ref={scrollContainerRef}
          onTouchStart={handleScrollTouchStart}
          onTouchMove={handleScrollTouchMove}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-3 sm:space-y-4 min-w-0 w-full overscroll-contain"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-tots-gray space-y-4 py-8">
              <ShoppingBag className="w-16 h-16 text-tots-gold/40 stroke-1" />
              <div>
                <h3 className="font-serif text-xl font-medium text-tots-dark mb-1">Your cart is empty</h3>
                <p className="text-xs text-tots-gray">Discover beautiful inclusive fashion designed for every body.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="bg-tots-wine text-white text-xs uppercase tracking-wider font-semibold px-6 py-3 rounded-xl hover:bg-tots-wine-hover transition-colors shadow-md"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 sm:gap-4 p-3 bg-white rounded-xl border border-tots-border shadow-xs min-w-0 w-full items-stretch">
                <img
                  src={item.product.primary_image}
                  alt={item.product.name}
                  className="w-16 sm:w-20 h-20 sm:h-24 object-cover rounded-lg border border-tots-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-serif font-semibold text-tots-dark text-sm sm:text-base truncate">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-tots-gray hover:text-tots-wine transition-colors p-1 flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-tots-gray mt-0.5 truncate">
                      Size: <span className="font-semibold text-tots-dark">{item.variant.size}</span> | Color: <span className="font-semibold text-tots-dark">{item.variant.color}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2 gap-2">
                    <div className="flex items-center border border-tots-border rounded-lg bg-tots-beige flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-tots-dark hover:bg-tots-border rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold text-tots-dark">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-tots-dark hover:bg-tots-border rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-tots-wine text-sm sm:text-base whitespace-nowrap">
                        ₹{(item.product.sale_price ?? item.product.regular_price) * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary — Fixed at bottom of cart */}
        {items.length > 0 && (
          <div
            className="p-4 sm:p-5 bg-white border-t border-tots-border shadow-lg space-y-3 flex-shrink-0 min-w-0 w-full select-none"
          >
            {/* Coupon Input - Only displayed when valid active coupons exist */}
            {activeCoupons.length > 0 && (
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2 min-w-0 w-full">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Coupon Code"
                    className="flex-1 min-w-0 text-xs px-3 py-2 border border-tots-border rounded-lg uppercase tracking-wider focus:outline-none focus:border-tots-gold bg-tots-cream placeholder:normal-case placeholder:tracking-normal"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 bg-tots-dark text-tots-cream text-xs px-4 py-2 rounded-lg hover:bg-tots-gold hover:text-white transition-colors font-semibold uppercase tracking-wider whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <div className="flex items-center justify-between text-xs">
                    <p className={discount > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                      {couponMessage}
                    </p>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1 text-xs text-tots-gray pt-1.5 border-t border-tots-border/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-tots-dark">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-tots-dark">₹{shippingFee}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-tots-dark pt-1.5 border-t border-tots-border">
                <span>Estimated Total</span>
                <span className="text-tots-wine font-serif text-lg sm:text-xl">₹{finalTotal}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full bg-tots-wine text-white text-xs sm:text-sm font-semibold py-3 sm:py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-tots-wine-hover transition-colors shadow-md text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-tots-gray text-[10px] pt-0.5 text-center flex-wrap">
              <ShieldCheck className="w-3.5 h-3.5 text-tots-gold flex-shrink-0" />
              <span>100% Secure Checkout | Encrypted Payment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

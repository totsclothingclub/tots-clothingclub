'use client'

import React, { useState } from 'react'
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'
import { validateCoupon } from '@/lib/supabase/data-service'

export const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotal, isDrawerOpen, setIsDrawerOpen } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [discountMsg, setDiscountMsg] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  if (!isDrawerOpen) return null

  const freeShippingThreshold = 999
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    const res = await validateCoupon(couponInput, subtotal)
    setDiscountMsg(res.message)
    if (res.valid) {
      setDiscountAmount(res.discount)
    } else {
      setDiscountAmount(0)
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in flex justify-end">
      <div className="w-full sm:w-screen sm:max-w-md h-full max-h-screen bg-tots-cream shadow-2xl flex flex-col sm:border-l border-tots-gold/30 overflow-hidden max-w-full min-w-0">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-tots-border bg-tots-dark text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-tots-gold" />
            <h2 className="font-serif text-lg sm:text-xl font-semibold tracking-wide">Your Shopping Cart</h2>
            <span className="bg-tots-wine text-xs px-2 py-0.5 rounded-full font-sans font-medium text-white">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-gray-300 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-tots-beige p-3 text-xs border-b border-tots-border text-center flex-shrink-0">
          {remainingForFreeShipping > 0 ? (
            <p className="text-tots-dark font-medium mb-1.5 text-xs">
              Add <span className="font-bold text-tots-wine">₹{remainingForFreeShipping}</span> more for <span className="font-bold text-tots-gold-dark">FREE Shipping</span>!
            </p>
          ) : (
            <p className="text-emerald-700 font-bold mb-1.5 flex items-center justify-center gap-1 text-xs">
              🎉 Congratulations! You unlocked FREE Shipping
            </p>
          )}
          <div className="w-full bg-tots-cream-dark h-2 rounded-full overflow-hidden border border-tots-border/50">
            <div
              className="bg-gradient-to-r from-tots-gold to-tots-wine h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List — only scrolls vertically when content overflows */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-3 sm:space-y-4 min-w-0 w-full">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-tots-gray space-y-4 py-8">
              <ShoppingBag className="w-16 h-16 text-tots-gold/40 stroke-1" />
              <div>
                <h3 className="font-serif text-xl font-medium text-tots-dark mb-1">Your cart is empty</h3>
                <p className="text-xs text-tots-gray">Discover beautiful inclusive fashion designed for every body.</p>
              </div>
              <button
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-tots-dark hover:bg-tots-border rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold text-tots-dark">{item.quantity}</span>
                      <button
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

        {/* Drawer Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-tots-border shadow-lg space-y-3 flex-shrink-0 min-w-0 w-full">
            {/* Coupon Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 min-w-0 w-full">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                placeholder="Coupon Code (e.g. TOTS10)"
                className="flex-1 min-w-0 text-xs px-3 py-2 border border-tots-border rounded-lg uppercase tracking-wider focus:outline-none focus:border-tots-gold bg-tots-cream placeholder:normal-case placeholder:tracking-normal"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-tots-dark text-tots-cream text-xs px-4 py-2 rounded-lg hover:bg-tots-gold hover:text-white transition-colors font-semibold uppercase tracking-wider whitespace-nowrap"
              >
                Apply
              </button>
            </form>
            {discountMsg && (
              <p className={`text-xs ${discountAmount > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                {discountMsg}
              </p>
            )}

            <div className="space-y-1 text-xs text-tots-gray pt-1.5 border-t border-tots-border/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-tots-dark">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{remainingForFreeShipping === 0 ? <strong className="text-emerald-700">FREE</strong> : '₹99'}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-tots-dark pt-1.5 border-t border-tots-border">
                <span>Estimated Total</span>
                <span className="text-tots-wine font-serif text-lg sm:text-xl">₹{finalTotal + (remainingForFreeShipping === 0 ? 0 : 99)}</span>
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
              <span>100% Secure Checkout | 7-Day Hassle-Free Returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

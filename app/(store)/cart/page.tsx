'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { useCart } from '@/lib/context/CartContext'
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const shippingFee = 80

  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 pb-24">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-tots-dark tracking-tight">
          Your Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-tots-border p-8 space-y-4">
            <ShoppingBag className="w-16 h-16 text-tots-gold mx-auto stroke-1" />
            <h2 className="font-serif text-2xl font-semibold text-tots-dark">Your cart is currently empty</h2>
            <p className="text-xs text-tots-gray max-w-sm mx-auto">
              Explore our luxury inclusive fashion collection designed for sizes XS to 7XL.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-tots-wine text-white text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xl hover:bg-tots-wine-hover transition-colors"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map(item => (
                <div key={item.id} className="p-4 bg-white rounded-2xl border border-tots-border shadow-xs flex gap-4 min-w-0 w-full items-stretch">
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-xl border border-tots-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <Link href={`/products/${item.product.slug}`} className="min-w-0 flex-1">
                          <h3 className="font-serif font-semibold text-tots-dark text-base hover:text-tots-wine transition-colors truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-tots-gray hover:text-tots-wine transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-tots-gray mt-1">
                        Size: <strong className="text-tots-dark">{item.variant.size}</strong> | Color: <strong className="text-tots-dark">{item.variant.color}</strong>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-tots-border rounded-xl bg-tots-beige">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 font-bold text-sm text-tots-dark hover:bg-tots-border rounded-l-xl"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-tots-dark">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 font-bold text-sm text-tots-dark hover:bg-tots-border rounded-r-xl"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif font-bold text-tots-wine text-lg">
                        ₹{(item.product.sale_price ?? item.product.regular_price) * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Side Box */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-tots-border shadow-md space-y-4">
              <h3 className="font-serif text-xl font-bold text-tots-dark border-b border-tots-border pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-tots-gray">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-tots-dark">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-tots-dark">₹{shippingFee}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-tots-dark pt-3 border-t border-tots-border">
                  <span>Total Amount</span>
                  <span className="text-tots-wine font-serif text-2xl">
                    ₹{subtotal + shippingFee}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-tots-wine text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xl hover:bg-tots-wine-hover transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-tots-gray text-[11px] pt-2">
                <ShieldCheck className="w-4 h-4 text-tots-gold" />
                <span>100% Encrypted & Safe Order Processing</span>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

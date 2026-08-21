'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { useCart } from '@/lib/context/CartContext'
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Truck } from 'lucide-react'
import { validateCoupon } from '@/lib/supabase/data-service'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()

  const [formData, setFormData] = useState({
    full_name: 'Simran Kaur',
    email: 'simran.k@example.com',
    phone: '+91 98765 12345',
    street: '42 Lotus Boulevard, Sector 128',
    apartment: 'Apt 402',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201304',
    country: 'India'
  })

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'UPI' | 'COD'>('Razorpay')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  const shippingFee = subtotal >= 999 ? 0 : 99
  const tax = Math.round((subtotal - discount) * 0.05)
  const grandTotal = Math.max(0, subtotal - discount + shippingFee + tax)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    const res = await validateCoupon(couponCode, subtotal)
    setCouponMessage(res.message)
    if (res.valid) {
      setDiscount(res.discount)
    } else {
      setDiscount(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // 1. Create order on server
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          couponCode,
          shippingAddress: formData
        })
      })
      const createData = await createRes.json()

      // 2. Simulate Razorpay / UPI / COD Payment Verification
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: createData.orderId,
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10)}`,
          razorpay_signature: 'valid_signature',
          customerDetails: formData,
          items,
          subtotal,
          discount,
          shippingFee,
          tax,
          total: grandTotal,
          paymentMethod
        })
      })

      const verifyData = await verifyRes.json()

      if (verifyData.success) {
        setCompletedOrder({
          orderNumber: verifyData.orderNumber,
          total: grandTotal,
          email: formData.email,
          phone: formData.phone
        })
        clearCart()
      }
    } catch (err) {
      console.error(err)
      alert('Order placement failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (completedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-tots-cream">
        <Header />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-tots-dark">Order Confirmed!</h1>
            <p className="text-sm text-tots-gray">
              Thank you for shopping with <strong>TOTS</strong>. We are preparing your inclusive fashion fit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-md space-y-3 text-left text-xs">
            <div className="flex justify-between border-b border-tots-border pb-2">
              <span className="text-tots-gray">Order Number:</span>
              <strong className="text-tots-wine text-sm">{completedOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between border-b border-tots-border pb-2">
              <span className="text-tots-gray">Payment Method:</span>
              <strong className="text-tots-dark">{paymentMethod}</strong>
            </div>
            <div className="flex justify-between border-b border-tots-border pb-2">
              <span className="text-tots-gray">Total Paid:</span>
              <strong className="text-tots-wine font-serif text-base">₹{completedOrder.total}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-tots-gray">Confirmation Email:</span>
              <strong className="text-tots-dark">{completedOrder.email}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/account/orders"
              className="flex-1 bg-tots-dark text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-tots-gold transition-colors"
            >
              Track Order Status
            </Link>
            <Link
              href="/shop"
              className="flex-1 bg-tots-beige text-tots-dark text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl border border-tots-border hover:bg-tots-cream transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-tots-cream">
        <Header />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-tots-dark">Your cart is empty</h2>
          <p className="text-xs text-tots-gray">Please add items to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="inline-block bg-tots-wine text-white text-xs font-bold uppercase px-6 py-3 rounded-xl"
          >
            Explore Collection
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-12 py-8 space-y-8 pb-24">
        <h1 className="font-serif text-3xl font-bold text-tots-dark">Express Checkout</h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Customer & Shipping Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Contact Info Box */}
            <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-xs space-y-4">
              <h2 className="font-serif text-xl font-bold text-tots-dark border-b border-tots-border pb-3">
                1. Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-tots-dark block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Box */}
            <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-xs space-y-4">
              <h2 className="font-serif text-xl font-bold text-tots-dark border-b border-tots-border pb-3">
                2. Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-tots-dark block mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">Apartment / Suite / Landmark</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
                <div>
                  <label className="font-semibold text-tots-dark block mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tots-border bg-tots-cream"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-xs space-y-4">
              <h2 className="font-serif text-xl font-bold text-tots-dark border-b border-tots-border pb-3">
                3. Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'Razorpay', label: 'Razorpay Online (Cards, NetBanking, Wallet)', sub: 'Fast & Encrypted' },
                  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm / BHIM)', sub: 'Instant Zero Fee' },
                  { id: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay upon delivery' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.id ? 'border-tots-wine bg-rose-50/50 shadow-xs' : 'border-tots-border bg-tots-cream hover:bg-tots-beige'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id as any)}
                        className="accent-tots-wine w-4 h-4"
                      />
                      <div>
                        <span className="font-serif font-bold text-sm text-tots-dark block">{opt.label}</span>
                        <span className="text-[11px] text-tots-gray">{opt.sub}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-tots-border shadow-md space-y-5">
            <h3 className="font-serif text-xl font-bold text-tots-dark border-b border-tots-border pb-3">
              Order Items ({items.length})
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img src={item.product.primary_image} alt="" className="w-12 h-16 object-cover rounded-lg border border-tots-border" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-tots-dark line-clamp-1">{item.product.name}</h4>
                    <p className="text-tots-gray text-[11px]">Size: {item.variant.size} • Qty: {item.quantity}</p>
                    <p className="font-semibold text-tots-wine mt-1">₹{(item.product.sale_price || item.product.regular_price) * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-tots-border space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Coupon Code (TOTS10)"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-tots-border uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-tots-dark text-white text-xs px-4 py-2.5 rounded-lg font-bold uppercase"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs ${discount > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-tots-gray pt-3 border-t border-tots-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-tots-dark">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="font-semibold text-tots-dark">₹{tax}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-tots-dark pt-3 border-t border-tots-border">
                <span>Grand Total</span>
                <span className="text-tots-wine font-serif text-2xl">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-tots-wine text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xl hover:bg-tots-wine-hover transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing Secure Payment...' : `PAY ₹${grandTotal} & PLACE ORDER`}
            </button>

            <div className="flex items-center justify-center gap-2 text-tots-gray text-[11px] pt-1">
              <Lock className="w-4 h-4 text-tots-gold" />
              <span>256-Bit SSL Encrypted Payment Gateways</span>
            </div>
          </div>

        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

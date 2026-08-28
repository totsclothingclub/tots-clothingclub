'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { useCart } from '@/lib/context/CartContext'
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Truck, AlertCircle } from 'lucide-react'
import { validateCoupon } from '@/lib/supabase/data-service'

// Helper function to load Razorpay Standard Web Checkout script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()

  const [formData, setFormData] = useState({
    full_name: 'Simran Kaur',
    email: 'simran.k@example.com',
    phone: '+91 85940 41490',
    street: '42 Lotus Boulevard, Sector 128',
    apartment: 'Apt 402',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201304',
    country: 'India'
  })

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'UPI'>('Razorpay')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  const shippingFee = 80
  const tax = Math.round((subtotal - discount) * 0.05)
  const grandTotal = Math.max(0, subtotal - discount + shippingFee + tax)

  useEffect(() => {
    loadRazorpayScript()
  }, [])

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
    setErrorMessage('')

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checkout.')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.')
      }

      // 2. Call backend to create Razorpay Order
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          couponCode,
          shippingAddress: formData,
        }),
      })

      const createData = await createRes.json()

      if (!createRes.ok || !createData.success || (!createData.orderId && !createData.order_id)) {
        throw new Error(createData.error || 'Failed to initialize payment order with gateway.')
      }

      const orderId = createData.orderId || createData.order_id
      const razorpayKey = createData.keyId || createData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      // 3. Configure Razorpay Standard Web Checkout Modal
      const options = {
        key: razorpayKey,
        amount: createData.amount, // in paise
        currency: createData.currency || 'INR',
        name: 'TOTS Clothing Club',
        description: `Order for ${items.length} item(s)`,
        image: '/images/tots-logo.png',
        order_id: orderId,
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          try {
            setIsProcessing(true)
            // 4. Send payment signature to backend verification endpoint
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerDetails: formData,
                items,
                subtotal,
                discount,
                shippingFee,
                tax,
                total: grandTotal,
                paymentMethod,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              setCompletedOrder({
                orderNumber: verifyData.orderNumber,
                paymentId: response.razorpay_payment_id,
                total: grandTotal,
                email: formData.email,
                phone: formData.phone,
              })
              clearCart()
            } else {
              setErrorMessage(
                verifyData.error || 'Payment verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id
              )
            }
          } catch (err: any) {
            console.error('Verification error:', err)
            setErrorMessage('Payment verification error. If money was deducted, our team will verify your order.')
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: formData.full_name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          shipping_address: `${formData.street}, ${formData.apartment ? formData.apartment + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: '#7b1f35', // TOTS Wine brand color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)

      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false)
        setErrorMessage(resp.error?.description || 'Payment Failed. Please try another card/UPI mode.')
      })

      rzp.open()
    } catch (err: any) {
      console.error('Checkout error:', err)
      setIsProcessing(false)
      setErrorMessage(err?.message || 'Could not launch payment gateway. Please try again.')
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
              Thank you for shopping with <strong>TOTS</strong>. Your payment was verified securely.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-md space-y-3 text-left text-xs">
            <div className="flex justify-between border-b border-tots-border pb-2">
              <span className="text-tots-gray">Order Number:</span>
              <strong className="text-tots-wine text-sm">{completedOrder.orderNumber}</strong>
            </div>
            {completedOrder.paymentId && (
              <div className="flex justify-between border-b border-tots-border pb-2">
                <span className="text-tots-gray">Razorpay Payment ID:</span>
                <code className="bg-[#faf7f2] px-1.5 py-0.5 rounded text-charcoal border border-border">{completedOrder.paymentId}</code>
              </div>
            )}
            <div className="flex justify-between border-b border-tots-border pb-2">
              <span className="text-tots-gray">Payment Method:</span>
              <strong className="text-tots-dark">Razorpay Online Payment</strong>
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
              href="/track-order"
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

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment Notification</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

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
              <div className="border-b border-tots-border pb-3 flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-tots-dark">
                  3. Payment Method
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Online Payment Only
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'Razorpay', label: 'Razorpay Online (UPI, Cards, NetBanking, Wallets)', sub: 'Fast, Encrypted & Instant Confirmation' },
                  { id: 'UPI', label: 'UPI Direct (GPay / PhonePe / Paytm / BHIM)', sub: 'Zero Payment Surcharge' },
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

              {/* Notice on COD & Unboxing Video */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>ℹ️ Payment & Return Notice:</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-normal">
                  • <strong>Cash on Delivery (COD)</strong> is currently not available.<br />
                  • Remember: An unedited <strong>opening/unboxing video</strong> is mandatory for any return or damage claims upon delivery.
                </p>
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
                <span className="font-semibold text-tots-dark">₹{shippingFee}</span>
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
              className="w-full bg-tots-wine text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xl hover:bg-tots-wine-hover transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Secure Payment...' : `PAY ₹${grandTotal} WITH RAZORPAY`}
            </button>

            <div className="flex items-center justify-center gap-2 text-tots-gray text-[11px] pt-1">
              <Lock className="w-4 h-4 text-tots-gold" />
              <span>256-Bit SSL Encrypted Razorpay Checkout</span>
            </div>
          </div>

        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

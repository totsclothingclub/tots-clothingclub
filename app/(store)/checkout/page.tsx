'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Truck, AlertCircle, MapPin, Building2, Home as HomeIcon } from 'lucide-react'
import { validateCoupon, getActiveCoupons } from '@/lib/supabase/data-service'
import { Coupon } from '@/lib/types'

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
  const {
    items,
    subtotal,
    clearCart,
    appliedCoupon,
    couponCode,
    discount,
    couponMessage,
    applyCoupon,
    removeCoupon
  } = useCart()
  const { user, isAuthenticated, addresses } = useAuth()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  // Pre-fill user data & default saved address
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
      if (defaultAddr) {
        setFormData({
          full_name: defaultAddr.full_name || user.full_name || '',
          email: user.email || '',
          phone: defaultAddr.phone || user.phone || '',
          street: defaultAddr.street || '',
          apartment: defaultAddr.apartment || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          pincode: defaultAddr.pincode || '',
          country: defaultAddr.country || 'India',
        })
      } else {
        setFormData(prev => ({
          ...prev,
          full_name: user.full_name || prev.full_name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }))
      }
    }
  }, [isAuthenticated, user, addresses])

  const paymentMethod = 'Razorpay'
  const [inputCoupon, setInputCoupon] = useState('')
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedOrder, setCompletedOrder] = useState<any>(null)

  const shippingFee = 80
  const tax = Math.round((subtotal - discount) * 0.05)
  const grandTotal = Math.max(0, subtotal - discount + shippingFee + tax)

  useEffect(() => {
    loadRazorpayScript()
    getActiveCoupons().then(list => setActiveCoupons(list || []))
  }, [])

  useEffect(() => {
    if (couponCode) {
      setInputCoupon(couponCode)
    }
  }, [couponCode])

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCoupon.trim()) return
    await applyCoupon(inputCoupon)
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
          couponCode: appliedCoupon?.code || couponCode || inputCoupon,
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tots-border pb-3">
                <h2 className="font-serif text-xl font-bold text-tots-dark">
                  2. Shipping Address
                </h2>
                {isAuthenticated && (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Logged In as {user?.full_name?.split(' ')[0]}
                  </span>
                )}
              </div>

              {/* Saved Address Quick Selector */}
              {isAuthenticated && addresses.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-beige-light border border-border/70">
                  <span className="text-[10px] uppercase font-bold text-mid tracking-wider block">
                    Choose from saved addresses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {addresses.map(addr => {
                      const isSelected =
                        formData.street === addr.street && formData.pincode === addr.pincode
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              full_name: addr.full_name,
                              phone: addr.phone,
                              street: addr.street,
                              apartment: addr.apartment || '',
                              city: addr.city,
                              state: addr.state,
                              pincode: addr.pincode,
                            }))
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-wine text-white border-wine shadow-xs font-bold'
                              : 'bg-white text-charcoal border-border hover:border-gold font-medium'
                          }`}
                        >
                          <span>{addr.label === 'Office' ? '🏢' : '🏠'}</span>
                          <span>{addr.label || 'Address'}</span>
                          <span className="opacity-70 text-[10px]">({addr.city})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

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

            {/* Coupon Code Input - Only displayed if valid active coupons exist in store */}
            {activeCoupons.length > 0 && (
              <div className="pt-2 border-t border-tots-border space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={e => setInputCoupon(e.target.value)}
                    placeholder="Coupon Code"
                    className="flex-1 text-xs p-2.5 rounded-lg border border-tots-border uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-tots-dark text-white text-xs px-4 py-2.5 rounded-lg font-bold uppercase hover:bg-tots-gold hover:text-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
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

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-tots-gray pt-3 border-t border-tots-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-tots-dark">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
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

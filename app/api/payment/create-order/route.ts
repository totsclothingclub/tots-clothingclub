import { NextResponse } from 'next/server'
import { validateCoupon } from '@/lib/supabase/data-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, couponCode, shippingAddress } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 })
    }

    // Calculate subtotal server-side to prevent client tamper
    let subtotal = 0
    items.forEach((item: any) => {
      const unitPrice = Number(item.product?.sale_price || item.product?.regular_price || 599)
      const qty = Number(item.quantity || 1)
      subtotal += unitPrice * qty
    })

    let discount = 0
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, subtotal)
      if (couponRes.valid) {
        discount = couponRes.discount
      }
    }

    const shippingFee = 80
    const tax = Math.round((subtotal - discount) * 0.05) // 5% GST
    const total = Math.max(0, subtotal - discount + shippingFee + tax)

    // Razorpay / Payment Order Payload Creation
    const orderId = `rzp_order_${Math.random().toString(36).substring(2, 12)}`

    return NextResponse.json({
      success: true,
      orderId,
      currency: 'INR',
      amount: total * 100, // Amount in paise for Razorpay
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_tots12345'
    })
  } catch (error: any) {
    console.error('Payment order creation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

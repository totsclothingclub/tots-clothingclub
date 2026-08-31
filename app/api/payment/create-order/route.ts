import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { validateCoupon, createOrder } from '@/lib/supabase/data-service'

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing in environment variables')
      return NextResponse.json(
        { error: 'Payment gateway configuration missing' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { items, couponCode, shippingAddress } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 })
    }

    // 1. Calculate subtotal server-side to prevent tampering
    let subtotal = 0
    items.forEach((item: any) => {
      const unitPrice = Number(item.product?.sale_price || item.product?.regular_price || 599)
      const qty = Number(item.quantity || 1)
      subtotal += unitPrice * qty
    })

    // 2. Validate coupon if provided
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
    const amountInPaise = Math.round(total * 100)

    // Validate minimum amount (Razorpay requires at least 100 paise = ₹1)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: 'Order amount must be at least ₹1.00 (100 paise)' },
        { status: 400 }
      )
    }

    // 3. Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // 4. Create Order with Razorpay API
    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`
    
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        customer_name: shippingAddress?.full_name || 'Customer',
        customer_phone: shippingAddress?.phone || '',
        customer_email: shippingAddress?.email || '',
        item_count: items.length.toString(),
      },
    })

    // 5. Pre-create pending order in DB for reconciliation (if customer drops connection)
    const orderItems = items.map((i: any) => ({
      id: `oi-${Math.random().toString(36).substring(2, 9)}`,
      order_id: '',
      product_id: i.product?.id || 'prod-custom',
      variant_id: i.variant?.id || 'var-custom',
      product_name: i.product?.name || 'Product',
      size: i.variant?.size || 'Standard',
      color: i.variant?.color || 'Standard',
      price: Number(i.product?.sale_price || i.product?.regular_price || 0),
      quantity: Number(i.quantity || 1),
      image_url: i.product?.primary_image || '/images/placeholder.jpg',
    }))

    let pendingOrder: any = null
    try {
      pendingOrder = await createOrder({
        customer_name: shippingAddress?.full_name || 'Customer',
        customer_email: shippingAddress?.email || 'customer@example.com',
        customer_phone: shippingAddress?.phone || '+91 85940 41490',
        shipping_address: shippingAddress || {},
        subtotal,
        discount,
        shipping_fee: shippingFee,
        tax,
        total,
        order_status: 'Pending',
        payment_status: 'Pending',
        payment_method: 'Razorpay',
        razorpay_order_id: razorpayOrder.id,
        items: orderItems,
      })
    } catch (dbErr) {
      console.warn('Failed to pre-create pending order record:', dbErr)
    }

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      orderId: razorpayOrder.id, // compatibility alias
      db_order_id: pendingOrder?.id,
      order_number: pendingOrder?.order_number,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      key_id: keyId,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    const statusCode = error?.statusCode || error?.status || 500
    const message = error?.error?.description || error?.message || 'Failed to create Razorpay order'
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createOrder, getOrderByRazorpayOrderId, markOrderAsPaid } from '@/lib/supabase/data-service'

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET missing in environment variables')
      return NextResponse.json(
        { error: 'Payment verification configuration missing' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      paymentMethod,
    } = body

    // 1. Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment confirmation fields' },
        { status: 400 }
      )
    }

    // 2. Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    // 3. Compare generated signature with razorpay_signature
    const isSignatureValid =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      )

    if (!isSignatureValid) {
      console.error('Razorpay signature mismatch:', {
        generatedSignature,
        receivedSignature: razorpay_signature,
      })
      return NextResponse.json(
        { error: 'Payment signature verification failed. Transaction cannot be verified.' },
        { status: 400 }
      )
    }

    // 4. Reconcile / Save verified order in database
    const existingOrder = await getOrderByRazorpayOrderId(razorpay_order_id)

    let finalOrderNumber = ''
    let finalOrderId = ''

    if (existingOrder) {
      if (existingOrder.payment_status === 'Paid') {
        // Already marked as paid (e.g. by webhook)
        finalOrderNumber = existingOrder.order_number
        finalOrderId = existingOrder.id
      } else {
        const updated = await markOrderAsPaid({
          razorpay_order_id,
          payment_id: razorpay_payment_id,
          payment_method: paymentMethod || 'Razorpay',
        })
        finalOrderNumber = updated?.order_number || existingOrder.order_number
        finalOrderId = updated?.id || existingOrder.id
      }
    } else {
      // Fallback: create order if not pre-created
      const orderItems = (items || []).map((i: any) => ({
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

      const created = await createOrder({
        customer_name: customerDetails?.full_name || 'Customer',
        customer_email: customerDetails?.email || 'customer@example.com',
        customer_phone: customerDetails?.phone || '+91 85940 41490',
        shipping_address: customerDetails,
        subtotal: subtotal || 0,
        discount: discount || 0,
        shipping_fee: shippingFee || 80,
        tax: tax || 0,
        total: total || 0,
        order_status: 'Processing',
        payment_status: 'Paid',
        payment_method: paymentMethod || 'Razorpay',
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        items: orderItems,
      })
      finalOrderNumber = created.order_number
      finalOrderId = created.id
    }

    return NextResponse.json({
      success: true,
      orderNumber: finalOrderNumber,
      orderId: finalOrderId,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully and order confirmed.',
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error?.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}

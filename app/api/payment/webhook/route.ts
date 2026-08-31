import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  getOrderByRazorpayOrderId,
  markOrderAsPaid,
  markOrderAsFailed,
  createOrder,
} from '@/lib/supabase/data-service'

/**
 * Razorpay Webhook Handler
 * 
 * Handles server-to-server notifications from Razorpay gateway.
 * Crucial for cases where a user makes payment but closes the tab / drops connection
 * before the client-side JavaScript handler can call /api/payment/verify.
 */
export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured in environment variables')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // 1. Read raw body text for HMAC signature verification
    const rawBody = await req.text()
    const receivedSignature = req.headers.get('x-razorpay-signature')

    if (!receivedSignature) {
      console.warn('Webhook received without x-razorpay-signature header')
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      )
    }

    // 2. Compute HMAC SHA-256 with RAZORPAY_WEBHOOK_SECRET
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    const isSignatureValid =
      expectedSignature.length === receivedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(receivedSignature)
      )

    if (!isSignatureValid) {
      console.error('Razorpay webhook signature verification failed!')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // 3. Parse JSON event payload
    const event = JSON.parse(rawBody)
    const eventType = event.event

    console.log(`[Razorpay Webhook] Received verified event: ${eventType} (ID: ${event.id || 'N/A'})`)

    // 4. Handle specific Razorpay webhook events
    switch (eventType) {
      case 'order.paid': {
        const orderEntity = event.payload?.order?.entity
        const paymentEntity = event.payload?.payment?.entity

        const razorpayOrderId = orderEntity?.id
        const razorpayPaymentId = paymentEntity?.id
        const paymentMethod = paymentEntity?.method || 'Razorpay'

        if (!razorpayOrderId) {
          console.warn('[Razorpay Webhook] order.paid event missing order ID')
          break
        }

        console.log(`[Razorpay Webhook] Processing order.paid for RZP Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`)

        const existingOrder = await getOrderByRazorpayOrderId(razorpayOrderId)

        if (existingOrder) {
          if (existingOrder.payment_status === 'Paid') {
            console.log(`[Razorpay Webhook] Order ${existingOrder.order_number} is already marked as Paid.`)
          } else {
            await markOrderAsPaid({
              razorpay_order_id: razorpayOrderId,
              payment_id: razorpayPaymentId || `pay_${Date.now()}`,
              payment_method: paymentMethod,
            })
            console.log(`[Razorpay Webhook] Order ${existingOrder.order_number} successfully reconciled & marked as Paid.`)
          }
        } else {
          // If pending order record was missing, construct it from webhook payload
          console.warn(`[Razorpay Webhook] No existing order found for ${razorpayOrderId}. Creating from webhook payload...`)
          const totalAmount = Number((orderEntity?.amount || paymentEntity?.amount || 0) / 100)
          const customerNotes = orderEntity?.notes || paymentEntity?.notes || {}

          await createOrder({
            customer_name: customerNotes.customer_name || paymentEntity?.email || 'Customer',
            customer_email: customerNotes.customer_email || paymentEntity?.email || 'customer@example.com',
            customer_phone: customerNotes.customer_phone || paymentEntity?.contact || '+91 85940 41490',
            shipping_address: {
              full_name: customerNotes.customer_name || 'Customer',
              phone: customerNotes.customer_phone || paymentEntity?.contact || '',
              street: 'Order details captured via Webhook',
              city: '',
              state: '',
              pincode: '',
              country: 'India',
            },
            subtotal: totalAmount,
            discount: 0,
            shipping_fee: 0,
            tax: 0,
            total: totalAmount,
            order_status: 'Processing',
            payment_status: 'Paid',
            payment_method: paymentMethod,
            payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId,
            notes: 'Order auto-recovered via Razorpay Webhook',
            items: [],
          })
        }
        break
      }

      case 'payment.captured': {
        const paymentEntity = event.payload?.payment?.entity
        const razorpayOrderId = paymentEntity?.order_id
        const razorpayPaymentId = paymentEntity?.id
        const paymentMethod = paymentEntity?.method || 'Razorpay'

        if (razorpayOrderId) {
          console.log(`[Razorpay Webhook] Processing payment.captured for Order: ${razorpayOrderId}`)
          const existingOrder = await getOrderByRazorpayOrderId(razorpayOrderId)

          if (existingOrder && existingOrder.payment_status !== 'Paid') {
            await markOrderAsPaid({
              razorpay_order_id: razorpayOrderId,
              payment_id: razorpayPaymentId,
              payment_method: paymentMethod,
            })
            console.log(`[Razorpay Webhook] Order ${existingOrder.order_number} marked as Paid via payment.captured`)
          }
        }
        break
      }

      case 'payment.failed': {
        const paymentEntity = event.payload?.payment?.entity
        const razorpayOrderId = paymentEntity?.order_id
        const failureReason = paymentEntity?.error_description || paymentEntity?.error_reason || 'Payment failed on gateway'

        if (razorpayOrderId) {
          console.log(`[Razorpay Webhook] Processing payment.failed for Order: ${razorpayOrderId} (${failureReason})`)
          await markOrderAsFailed({
            razorpay_order_id: razorpayOrderId,
            notes: failureReason,
          })
        }
        break
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`)
    }

    // Always respond with 200 OK to Razorpay to prevent webhook retry flooding
    return NextResponse.json({ status: 'ok', received: true })
  } catch (error: any) {
    console.error('[Razorpay Webhook] Internal server error:', error)
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  createOrder,
  getOrderByRazorpayOrderId,
  markOrderAsPaid,
  getStoreSettings,
  calculateShippingFee,
  isValidUUID,
  reduceProductStock
} from '@/lib/supabase/data-service'
import { createAdminClient } from '@/lib/supabase/server'

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

      // If existing order had no items attached, ensure items are stored and stock reduced
      if ((!existingOrder.items || existingOrder.items.length === 0) && items && items.length > 0) {
        try {
          const supabase = createAdminClient()
          const itemRows = items.map((i: any) => ({
            order_id: existingOrder.id,
            product_id: isValidUUID(i.product?.id || i.product_id || i.id) ? (i.product?.id || i.product_id || i.id) : null,
            variant_id: isValidUUID(i.variant?.id) ? i.variant.id : null,
            product_name: i.product?.name || i.product_name || 'Product',
            size: i.variant?.size || i.size || 'Standard',
            color: i.variant?.color || i.color || 'Standard',
            price: Number(i.product?.sale_price || i.product?.regular_price || i.price || 0),
            quantity: Math.max(1, Number(i.quantity) || 1),
            image_url: i.product?.primary_image || i.image_url || null,
          }))
          await supabase.from('order_items').insert(itemRows)
          await reduceProductStock(itemRows as any)
        } catch (err) {
          console.warn('Failed to insert fallback items for existing order:', err)
        }
      }
    } else {
      // Fallback: create order if not pre-created (verify prices from DB)
      const supabase = createAdminClient()
      const productIds = (items || []).map((i: any) => i.product?.id || i.product_id || i.id).filter(Boolean)
      let dbProducts: any[] = []
      if (productIds.length > 0) {
        const { data } = await supabase.from('products').select('id, name, regular_price, sale_price, primary_image').in('id', productIds)
        if (data) dbProducts = data
      }

      let calculatedSubtotal = 0
      const orderItems = (items || []).map((i: any) => {
        const pId = i.product?.id || i.product_id || i.id
        const dbProd = dbProducts.find((p: any) => p.id === pId)
        const unitPrice = dbProd
          ? (dbProd.sale_price !== null && dbProd.sale_price !== undefined && Number(dbProd.sale_price) > 0 ? Number(dbProd.sale_price) : Number(dbProd.regular_price))
          : Number(i.product?.sale_price || i.product?.regular_price || 0)

        const qty = Number(i.quantity || 1)
        calculatedSubtotal += unitPrice * qty

        return {
          id: `oi-${Math.random().toString(36).substring(2, 9)}`,
          order_id: '',
          product_id: dbProd?.id || pId || 'prod-custom',
          variant_id: i.variant?.id || 'var-custom',
          product_name: dbProd?.name || i.product?.name || 'Product',
          size: i.variant?.size || 'Standard',
          color: i.variant?.color || 'Standard',
          price: unitPrice,
          quantity: qty,
          image_url: dbProd?.primary_image || i.product?.primary_image || '/images/placeholder.jpg',
        }
      })

      const settings = await getStoreSettings()
      const baseShippingFee = settings?.standard_shipping_fee !== undefined && settings?.standard_shipping_fee !== null
        ? Number(settings.standard_shipping_fee)
        : 80
      const totalQuantity = (items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0)
      const calculatedShippingFee = calculateShippingFee(totalQuantity, baseShippingFee)
      const finalShippingFee = shippingFee !== undefined ? Number(shippingFee) : calculatedShippingFee

      const finalSubtotal = subtotal || calculatedSubtotal
      const finalTotal = total || Math.max(0, finalSubtotal - (discount || 0) + finalShippingFee)

      const created = await createOrder({
        customer_name: customerDetails?.full_name || 'Customer',
        customer_email: customerDetails?.email || 'customer@example.com',
        customer_phone: customerDetails?.phone || '+91 85940 41490',
        shipping_address: customerDetails,
        subtotal: finalSubtotal,
        discount: discount || 0,
        shipping_fee: finalShippingFee,
        tax: 0,
        total: finalTotal,
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

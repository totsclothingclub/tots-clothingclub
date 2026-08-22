import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllAdminProducts, saveProduct, deleteProduct, getProductById } from '@/lib/supabase/data-service'

export async function GET() {
  try {
    const prods = await getAllAdminProducts()
    return NextResponse.json(prods)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const productData = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const primaryImg =
      productData.primary_image ||
      (productData.images && productData.images[0]?.image_url) ||
      '/images/placeholder.jpg'

    const slug = (productData.slug || productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let result: any = null

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const productPayload: any = {
        name: productData.name || 'New Product',
        slug: slug,
        description: productData.description || '',
        short_description: productData.short_description || '',
        category_id: productData.category_id || null,
        category_ids: productData.category_ids || [],
        brand: productData.brand || 'TOTS',
        sku: productData.sku || `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        regular_price: Number(productData.regular_price) || 999,
        sale_price: productData.sale_price ? Number(productData.sale_price) : null,
        discount_percent: productData.discount_percent || 0,
        tax_percent: productData.tax_percent || 5.0,
        status: productData.status || 'published',
        is_featured: productData.is_featured ?? false,
        is_new_arrival: productData.is_new_arrival ?? true,
        is_best_seller: productData.is_best_seller ?? false,
        is_sale: productData.is_sale ?? false,
        is_plus_size: productData.is_plus_size ?? true,
        primary_image: primaryImg,
        available_sizes: productData.available_sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
        rating_avg: productData.rating_avg || 5.0,
        review_count: productData.review_count || 48
      }

      let savedId = productData.id

      if (productData.id && !productData.id.startsWith('prod-')) {
        let { data, error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productData.id)
          .select()
          .single()
        
        if (error) {
          // If error occurs because category_ids column does not exist yet in Supabase, retry without category_ids
          delete productPayload.category_ids
          const retry = await supabase
            .from('products')
            .update(productPayload)
            .eq('id', productData.id)
            .select()
            .single()
          data = retry.data
          error = retry.error
        }

        if (!error && data) savedId = data.id
        else if (error) {
          console.error('Supabase update product error:', JSON.stringify(error))
          return NextResponse.json({ error: `Update failed: ${error.message}`, details: error }, { status: 400 })
        }
      } else {
        let { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single()

        if (error) {
          // If error occurs because category_ids column does not exist yet in Supabase, retry without category_ids
          delete productPayload.category_ids
          const retry = await supabase
            .from('products')
            .insert([productPayload])
            .select()
            .single()
          data = retry.data
          error = retry.error
        }

        if (!error && data) savedId = data.id
        else if (error) {
          console.error('Supabase insert product error:', JSON.stringify(error))
          return NextResponse.json({ error: `Insert failed: ${error.message}`, details: error }, { status: 400 })
        }
      }

      if (savedId) {
        // Sync images
        if (productData.images && productData.images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', savedId)
          const imgRows = productData.images.map((img: any, idx: number) => ({
            product_id: savedId,
            image_url: img.image_url,
            is_primary: img.is_primary ?? idx === 0,
            display_order: idx + 1
          }))
          await supabase.from('product_images').insert(imgRows)
        }

        // Sync variants
        if (productData.variants && productData.variants.length > 0) {
          await supabase.from('product_variants').delete().eq('product_id', savedId)
          const varRows = productData.variants.map((v: any) => ({
            product_id: savedId,
            size: v.size,
            color: v.color || 'Standard',
            color_hex: v.color_hex || '#1a1a1a',
            sku: v.sku || `${productPayload.sku}-${v.size}`,
            price: Number(v.price) || Number(productPayload.regular_price),
            stock_quantity: Number(v.stock_quantity) || 10
          }))
          await supabase.from('product_variants').insert(varRows)
        }

        result = await getProductById(savedId)
      }
    }

    if (!result) {
      result = await saveProduct(productData)
    }

    // Revalidate store pages
    try {
      revalidatePath('/')
      revalidatePath('/shop')
      revalidatePath('/admin/products')
    } catch (e) {
      console.warn('Revalidation error:', e)
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('API save product error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      await supabase.from('products').delete().eq('id', id)
    }

    await deleteProduct(id)

    try {
      revalidatePath('/')
      revalidatePath('/shop')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/products')
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

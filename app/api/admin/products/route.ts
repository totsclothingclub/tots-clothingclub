import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllAdminProducts, saveProduct, deleteProduct, getProductById } from '@/lib/supabase/data-service'
import { deleteImageByUrlFromCloudinary } from '@/lib/cloudinary'

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

    const regPrice = Number(productData.regular_price)
    if (!regPrice || isNaN(regPrice) || regPrice <= 0) {
      return NextResponse.json({ error: 'Product regular_price must be a positive number' }, { status: 400 })
    }

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
      const stockQty = typeof productData.stock_quantity === 'number' ? Number(productData.stock_quantity) : 25

      const productPayload: any = {
        name: productData.name || 'New Product',
        slug: slug,
        description: productData.description || '',
        short_description: productData.short_description || '',
        category_id: productData.category_id || null,
        category_ids: productData.category_ids || [],
        brand: productData.brand || 'TOTS',
        sku: productData.sku || `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        regular_price: regPrice,
        sale_price: productData.sale_price ? Number(productData.sale_price) : null,
        discount_percent: productData.discount_percent || 0,
        tax_percent: productData.tax_percent || 5.0,
        stock_quantity: stockQty,
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
          // If error occurs because category_ids or stock_quantity column does not exist yet, retry
          delete productPayload.category_ids
          if (error.message?.includes('stock_quantity')) delete productPayload.stock_quantity
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
          // If error occurs because category_ids or stock_quantity column does not exist yet, retry
          delete productPayload.category_ids
          if (error.message?.includes('stock_quantity')) delete productPayload.stock_quantity
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

      // Fetch images to delete from Cloudinary
      const { data: prodData } = await supabase.from('products').select('primary_image').eq('id', id).single()
      const { data: prodImages } = await supabase.from('product_images').select('image_url').eq('id', id)

      const imageUrls: string[] = []
      if (prodData?.primary_image) imageUrls.push(prodData.primary_image)
      if (prodImages) {
        prodImages.forEach((img: any) => {
          if (img.image_url) imageUrls.push(img.image_url)
        })
      }

      // Delete product row from database
      await supabase.from('products').delete().eq('id', id)

      // Delete images from Cloudinary
      for (const imgUrl of imageUrls) {
        try {
          await deleteImageByUrlFromCloudinary(imgUrl)
        } catch (cErr) {
          console.warn('Failed to delete product image from Cloudinary:', imgUrl, cErr)
        }
      }
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

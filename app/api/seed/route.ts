import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import {
  INITIAL_SETTINGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS
} from '@/lib/supabase/mock-data'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder')) {
      return NextResponse.json({
        status: 'notice',
        message: 'Supabase URL/Key environment variables are not connected yet. Operating smoothly in local reactive data mode!',
        productsCount: INITIAL_PRODUCTS.length,
        bannersCount: INITIAL_BANNERS.length,
        categoriesCount: INITIAL_CATEGORIES.length
      })
    }

    const supabase = createClient()

    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await supabase.from('categories').upsert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_url: cat.image_url,
        display_order: cat.display_order,
        is_active: cat.is_active
      })
    }

    // 2. Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      await supabase.from('products').upsert({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        short_description: prod.short_description,
        category_id: prod.category_id,
        brand: prod.brand,
        sku: prod.sku,
        regular_price: prod.regular_price,
        sale_price: prod.sale_price,
        discount_percent: prod.discount_percent,
        tax_percent: prod.tax_percent,
        status: prod.status,
        is_featured: prod.is_featured,
        is_new_arrival: prod.is_new_arrival,
        is_best_seller: prod.is_best_seller,
        is_sale: prod.is_sale,
        is_plus_size: prod.is_plus_size
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase Database Seeded successfully with TOTS brand dataset!'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

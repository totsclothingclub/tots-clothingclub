import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/supabase/data-service'
import { deleteImageByUrlFromCloudinary } from '@/lib/cloudinary'

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const categoryData = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const slug = (categoryData.slug || categoryData.name || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let result: any = null

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const catPayload: any = {
        name: categoryData.name || 'New Category',
        slug: slug,
        description: categoryData.description || '',
        image_url: categoryData.image_url || '/images/placeholder.jpg',
        display_order: Number(categoryData.display_order) || 1,
        is_active: categoryData.is_active ?? true,
        nav_location: categoryData.nav_location || 'shop_dropdown',
        is_dropdown: categoryData.is_dropdown ?? false,
        parent_id: categoryData.parent_id || null
      }

      if (categoryData.id && !categoryData.id.startsWith('cat-')) {
        let { data, error } = await supabase
          .from('categories')
          .update(catPayload)
          .eq('id', categoryData.id)
          .select()
          .single()
        
        if (error) {
          console.warn('Supabase update category error with new fields, attempting fallback:', error)
          delete catPayload.nav_location
          delete catPayload.is_dropdown
          delete catPayload.parent_id
          const fallbackRes = await supabase
            .from('categories')
            .update(catPayload)
            .eq('id', categoryData.id)
            .select()
            .single()
          if (!fallbackRes.error && fallbackRes.data) data = fallbackRes.data
        }
        if (data) result = data
      } else {
        let { data, error } = await supabase
          .from('categories')
          .insert([catPayload])
          .select()
          .single()

        if (error) {
          console.warn('Supabase insert category error with new fields, attempting fallback:', error)
          delete catPayload.nav_location
          delete catPayload.is_dropdown
          delete catPayload.parent_id
          const fallbackRes = await supabase
            .from('categories')
            .insert([catPayload])
            .select()
            .single()
          if (!fallbackRes.error && fallbackRes.data) data = fallbackRes.data
        }
        if (data) result = data
      }
    }

    if (!result) {
      result = await saveCategory(categoryData)
    }

    // Revalidate frontend and shop pages
    try {
      revalidatePath('/')
      revalidatePath('/shop')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/categories')
    } catch (e) {
      console.warn('Revalidation error:', e)
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('API save category error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing category ID' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const { data: catData } = await supabase.from('categories').select('image_url').eq('id', id).single()

      await supabase.from('categories').delete().eq('id', id)

      if (catData?.image_url) {
        try {
          await deleteImageByUrlFromCloudinary(catData.image_url)
        } catch (cErr) {
          console.warn('Failed to delete category image from Cloudinary:', cErr)
        }
      }
    }

    await deleteCategory(id)

    try {
      revalidatePath('/')
      revalidatePath('/shop')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/categories')
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/supabase/data-service'

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
      const catPayload = {
        name: categoryData.name || 'New Category',
        slug: slug,
        description: categoryData.description || '',
        image_url: categoryData.image_url || '/images/placeholder.jpg',
        display_order: Number(categoryData.display_order) || 1,
        is_active: categoryData.is_active ?? true
      }

      if (categoryData.id && !categoryData.id.startsWith('cat-')) {
        const { data, error } = await supabase
          .from('categories')
          .update(catPayload)
          .eq('id', categoryData.id)
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase update category error:', error)
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([catPayload])
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase insert category error:', error)
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
      await supabase.from('categories').delete().eq('id', id)
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

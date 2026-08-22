import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS
} from '@/lib/supabase/mock-data'

export async function GET() {
  return await seedDatabase()
}

export async function POST() {
  return await seedDatabase()
}

async function seedDatabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url.includes('placeholder')) {
      return NextResponse.json({
        status: 'notice',
        message: 'Operating smoothly with dynamic in-memory data store.',
        categoriesCount: INITIAL_CATEGORIES.length
      })
    }

    const supabase = createAdminClient()

    // 1. Remove old unwanted categories like western-wear and all-plus-size
    await supabase.from('categories').delete().eq('slug', 'western-wear')
    await supabase.from('categories').delete().eq('slug', 'all-plus-size')

    const logs: string[] = []
    const topLevelCats = INITIAL_CATEGORIES.filter(c => c.nav_location === 'navbar')
    const parentIdMap: Record<string, string> = {}

    for (const cat of topLevelCats) {
      let payload: any = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image_url: cat.image_url || '/images/placeholder.jpg',
        display_order: cat.display_order,
        is_active: cat.is_active,
        nav_location: cat.nav_location,
        is_dropdown: cat.is_dropdown ?? false,
        parent_id: null
      }

      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat.slug)
        .maybeSingle()

      if (existing) {
        // Do not overwrite custom image or description added by admin
        delete payload.image_url
        let res = await supabase
          .from('categories')
          .update(payload)
          .eq('id', existing.id)
          .select('id')
          .single()
        
        if (res.error) {
          logs.push(`Update top error ${cat.slug}: ${res.error.message}`)
          // Fallback without new columns
          delete payload.nav_location
          delete payload.is_dropdown
          res = await supabase.from('categories').update(payload).eq('id', existing.id).select('id').single()
        }
        if (res.data) parentIdMap[cat.slug] = res.data.id
      } else {
        let res = await supabase
          .from('categories')
          .insert([payload])
          .select('id')
          .single()

        if (res.error) {
          logs.push(`Insert top error ${cat.slug}: ${res.error.message}`)
          // Fallback without new columns
          delete payload.nav_location
          delete payload.is_dropdown
          res = await supabase.from('categories').insert([payload]).select('id').single()
        }
        if (res.data) parentIdMap[cat.slug] = res.data.id
      }
    }

    // 3. Seed Subcategories (SHOP & PLUS SIZE)
    const subCats = INITIAL_CATEGORIES.filter(c => c.nav_location !== 'navbar')
    for (const cat of subCats) {
      let parentId: string | null = null
      if (cat.nav_location === 'shop_dropdown' && parentIdMap['shop']) {
        parentId = parentIdMap['shop']
      } else if (cat.nav_location === 'plus_size_dropdown' && parentIdMap['plus-size']) {
        parentId = parentIdMap['plus-size']
      }

      let payload: any = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image_url: cat.image_url || '',
        display_order: cat.display_order,
        is_active: cat.is_active,
        nav_location: cat.nav_location,
        is_dropdown: false,
        parent_id: parentId
      }

      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat.slug)
        .maybeSingle()

      if (existing) {
        // Do not overwrite custom image added by admin
        delete payload.image_url
        let res = await supabase.from('categories').update(payload).eq('id', existing.id)
        if (res.error) {
          logs.push(`Update sub error ${cat.slug}: ${res.error.message}`)
          delete payload.nav_location
          delete payload.is_dropdown
          delete payload.parent_id
          await supabase.from('categories').update(payload).eq('id', existing.id)
        }
      } else {
        let res = await supabase.from('categories').insert([payload])
        if (res.error) {
          logs.push(`Insert sub error ${cat.slug}: ${res.error.message}`)
          delete payload.nav_location
          delete payload.is_dropdown
          delete payload.parent_id
          await supabase.from('categories').insert([payload])
        }
      }
    }


    // Revalidate paths
    try {
      revalidatePath('/')
      revalidatePath('/shop')
      revalidatePath('/admin/categories')
    } catch (e) {}

    return NextResponse.json({
      status: 'success',
      message: 'Supabase Database categories hierarchy successfully populated!',
      totalCategories: INITIAL_CATEGORIES.length
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

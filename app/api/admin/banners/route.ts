import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllBanners, saveBanner, deleteBanner } from '@/lib/supabase/data-service'
import { deleteImageByUrlFromCloudinary } from '@/lib/cloudinary'

export async function GET() {
  try {
    const banners = await getAllBanners()
    return NextResponse.json(banners)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const bannerData = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let result: any = null

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const bannerPayload = {
        title: bannerData.title || 'NEW BANNER',
        subtitle: bannerData.subtitle || '',
        button_text: bannerData.button_text || 'SHOP NOW',
        button_url: bannerData.button_url || '/shop',
        desktop_image_url: bannerData.desktop_image_url || '/images/placeholder.jpg',
        mobile_image_url: bannerData.mobile_image_url || bannerData.desktop_image_url || '/images/placeholder.jpg',
        is_active: bannerData.is_active ?? true,
        display_order: Number(bannerData.display_order) || 1
      }

      if (bannerData.id && !bannerData.id.startsWith('banner-')) {
        const { data, error } = await supabase
          .from('banners')
          .update(bannerPayload)
          .eq('id', bannerData.id)
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase update banner error:', error)
      } else {
        const { data, error } = await supabase
          .from('banners')
          .insert([bannerPayload])
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase insert banner error:', error)
      }
    }

    if (!result) {
      result = await saveBanner(bannerData)
    }

    // Revalidate frontend pages immediately
    try {
      revalidatePath('/')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/banners')
    } catch (e) {
      console.warn('Revalidation error:', e)
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('API save banner error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing banner ID' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const { data: bData } = await supabase.from('banners').select('desktop_image_url, mobile_image_url').eq('id', id).single()

      await supabase.from('banners').delete().eq('id', id)

      if (bData) {
        if (bData.desktop_image_url) {
          try { await deleteImageByUrlFromCloudinary(bData.desktop_image_url) } catch (e) {}
        }
        if (bData.mobile_image_url && bData.mobile_image_url !== bData.desktop_image_url) {
          try { await deleteImageByUrlFromCloudinary(bData.mobile_image_url) } catch (e) {}
        }
      }
    }

    await deleteBanner(id)

    try {
      revalidatePath('/')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/banners')
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

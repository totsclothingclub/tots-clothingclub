import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllInstagramPosts, saveInstagramPost, deleteInstagramPost } from '@/lib/supabase/data-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await getAllInstagramPosts()
    return NextResponse.json(posts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const postData = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let result: any = null

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const payload = {
        image_url: postData.image_url || '/images/placeholder.jpg',
        tag: postData.tag || null,
        post_url: postData.post_url || 'https://instagram.com/tots_clothingclub',
        display_order: Number(postData.display_order) || 1,
        is_active: postData.is_active ?? true
      }

      if (postData.id && !postData.id.startsWith('ig-')) {
        const { data, error } = await supabase
          .from('instagram_posts')
          .update(payload)
          .eq('id', postData.id)
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase update instagram post error:', error)
      } else {
        const { data, error } = await supabase
          .from('instagram_posts')
          .insert([payload])
          .select()
          .single()
        if (!error && data) result = data
        else if (error) console.error('Supabase insert instagram post error:', error)
      }
    }

    if (!result) {
      result = await saveInstagramPost(postData)
    }

    try {
      revalidatePath('/')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/instagram')
    } catch (e) {}

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      await supabase.from('instagram_posts').delete().eq('id', id)
    }

    await deleteInstagramPost(id)

    try {
      revalidatePath('/')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/instagram')
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

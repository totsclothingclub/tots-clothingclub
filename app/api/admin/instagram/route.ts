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

    // Must have at least a video URL or image thumbnail
    if (!postData.video_url && !postData.image_url) {
      return NextResponse.json({ error: 'Please upload a video file or cover thumbnail image.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    let result: any = null

    const payload: any = {
      image_url: postData.image_url || '/images/placeholder.jpg',
      video_url: postData.video_url || null,
      caption: postData.caption || '',
      tag: postData.tag || null,
      author_name: postData.author_name || 'tots_clothingclub',
      post_url: postData.post_url || 'https://instagram.com/tots_clothingclub',
      display_order: Number(postData.display_order) || 1,
      is_active: postData.is_active ?? true
    }

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createAdminClient()

      if (postData.id && !postData.id.startsWith('ig-')) {
        let { data, error } = await supabase
          .from('instagram_posts')
          .update(payload)
          .eq('id', postData.id)
          .select()
          .single()

        if (error && (error.message?.includes('video_url') || error.message?.includes('caption'))) {
          // Retry without new columns if DB migration is pending
          const { video_url, caption, ...basicPayload } = payload
          const retry = await supabase
            .from('instagram_posts')
            .update(basicPayload)
            .eq('id', postData.id)
            .select()
            .single()
          data = retry.data
          error = retry.error
        }

        if (!error && data) result = data
        else if (error) console.error('Supabase update instagram post error:', error)
      } else {
        let { data, error } = await supabase
          .from('instagram_posts')
          .insert([payload])
          .select()
          .single()

        if (error && (error.message?.includes('video_url') || error.message?.includes('caption'))) {
          // Retry without new columns if DB migration is pending
          const { video_url, caption, ...basicPayload } = payload
          const retry = await supabase
            .from('instagram_posts')
            .insert([basicPayload])
            .select()
            .single()
          data = retry.data
          error = retry.error
        }

        if (!error && data) result = data
        else if (error) console.error('Supabase insert instagram post error:', error)
      }
    }

    if (!result) {
      result = await saveInstagramPost({
        ...payload,
        id: postData.id
      })
    }

    try {
      revalidatePath('/')
      revalidatePath('/(store)', 'layout')
      revalidatePath('/admin/instagram')
    } catch (e) {}

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Save Instagram Video error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
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

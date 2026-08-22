import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllPromoCards, savePromoCard, deletePromoCard } from '@/lib/supabase/data-service'

export async function GET() {
  try {
    const cards = await getAllPromoCards()
    return NextResponse.json(cards)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cardData = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let result: any = null

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      const payload: any = {
        label: cardData.label || '',
        title: cardData.title || '',
        description: cardData.description || '',
        button_text: cardData.button_text || 'SHOP NOW',
        button_url: cardData.button_url || '/shop',
        image_url: cardData.image_url || '',
        bg_color: cardData.bg_color || 'cream',
        text_color: cardData.text_color || 'dark',
        display_order: Number(cardData.display_order) || 0,
        is_active: cardData.is_active ?? true
      }

      if (cardData.id && !cardData.id.startsWith('promo-')) {
        const { data, error } = await supabase
          .from('promo_cards')
          .update(payload)
          .eq('id', cardData.id)
          .select()
          .single()
        if (!error && data) result = data
        else if (error) {
          console.error('Supabase update promo_card error:', JSON.stringify(error))
          return NextResponse.json({ error: `Update failed: ${error.message}` }, { status: 400 })
        }
      } else {
        const { data, error } = await supabase
          .from('promo_cards')
          .insert([payload])
          .select()
          .single()
        if (!error && data) result = data
        else if (error) {
          console.error('Supabase insert promo_card error:', JSON.stringify(error))
          return NextResponse.json({ error: `Insert failed: ${error.message}` }, { status: 400 })
        }
      }
    }

    if (!result) {
      result = await savePromoCard(cardData)
    }

    try {
      revalidatePath('/')
      revalidatePath('/admin/promo-cards')
    } catch (e) {}

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('API promo card save error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing promo card ID' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key && !url.includes('placeholder')) {
      const supabase = createAdminClient()
      await supabase.from('promo_cards').delete().eq('id', id)
    }

    await deletePromoCard(id)

    try {
      revalidatePath('/')
      revalidatePath('/admin/promo-cards')
    } catch (e) {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sanitizeInstagramUrl, generateInstagramBlockquote } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUrl = searchParams.get('url')

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL is required', valid: false }, { status: 400 })
    }

    const sanitized = sanitizeInstagramUrl(rawUrl)
    if (!sanitized) {
      return NextResponse.json({ error: 'Invalid Instagram URL format', valid: false }, { status: 400 })
    }

    const { shortcode, canonicalUrl } = sanitized
    const token = process.env.INSTAGRAM_OEMBED_ACCESS_TOKEN?.trim()

    // 1. Try Meta Graph oEmbed API if token is configured
    if (token) {
      try {
        const graphUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(canonicalUrl)}&access_token=${token}&omitscript=true`
        const graphRes = await fetch(graphUrl, {
          headers: { Accept: 'application/json' },
          next: { revalidate: 86400 }
        })
        if (graphRes.ok) {
          const data = await graphRes.json()
          return NextResponse.json({
            valid: true,
            shortcode,
            canonical_url: canonicalUrl,
            thumbnail_url: data.thumbnail_url || `https://www.instagram.com/p/${shortcode}/media/?size=l`,
            author_name: data.author_name || 'tots_clothingclub',
            title: data.title || '',
            html: data.html || generateInstagramBlockquote(canonicalUrl, data.author_name || 'tots_clothingclub'),
            width: data.width || 320
          })
        }
      } catch (e) {
        console.warn('Meta Graph oEmbed fetch failed', e)
      }
    }

    // 2. Try public Instagram oEmbed endpoint
    try {
      const publicUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(canonicalUrl)}&omitscript=true`
      const oembedRes = await fetch(publicUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TotsBot/1.0)',
          Accept: 'application/json'
        },
        next: { revalidate: 86400 }
      })
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        return NextResponse.json({
          valid: true,
          shortcode,
          canonical_url: canonicalUrl,
          thumbnail_url: data.thumbnail_url || `https://www.instagram.com/p/${shortcode}/media/?size=l`,
          author_name: data.author_name || 'tots_clothingclub',
          title: data.title || '',
          html: data.html || generateInstagramBlockquote(canonicalUrl, data.author_name || 'tots_clothingclub'),
          width: data.width || 320
        })
      }
    } catch (e) {
      console.warn('Public Instagram oEmbed failed', e)
    }

    // 3. Fallback: blockquote + media thumbnail
    return NextResponse.json({
      valid: true,
      shortcode,
      canonical_url: canonicalUrl,
      thumbnail_url: `https://www.instagram.com/p/${shortcode}/media/?size=l`,
      author_name: 'tots_clothingclub',
      title: '',
      html: generateInstagramBlockquote(canonicalUrl, 'tots_clothingclub'),
      width: 320
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, valid: false }, { status: 500 })
  }
}

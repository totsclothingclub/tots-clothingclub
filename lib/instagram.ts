/**
 * Instagram URL utilities — shared between API routes and components.
 * These are server-safe and can be used in both API routes and server components.
 */

/** Sanitizes and extracts shortcode from any Instagram Reel/Post URL */
export function sanitizeInstagramUrl(rawUrl: string): { shortcode: string; canonicalUrl: string } | null {
  if (!rawUrl) return null
  const clean = rawUrl.trim()
  const match = clean.match(/(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i)
  if (!match?.[1]) return null
  const shortcode = match[1]
  const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`
  return { shortcode, canonicalUrl }
}

/** Generates a standard Instagram blockquote that embed.js can hydrate */
export function generateInstagramBlockquote(canonicalUrl: string, authorName = 'tots_clothingclub'): string {
  return `<blockquote class="instagram-media" data-instgrm-permalink="${canonicalUrl}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"><a href="${canonicalUrl}" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">View Reel on Instagram (@${authorName})</a></div></blockquote>`
}

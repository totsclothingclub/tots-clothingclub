/**
 * Cloudinary Universal URL Builder & Transformation Utilities
 * Generates deterministic, cache-optimized URLs with f_auto, q_auto, and responsive dimensions.
 */

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'crop' | 'thumb'
  gravity?: 'auto' | 'face' | 'center' | string
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  dpr?: number | string
}

/**
 * Parses a Cloudinary URL into its base components and rebuilds it with
 * optimal transformations (f_auto, q_auto, width/height capping, crop).
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url || typeof url !== 'string') return ''

  // If not a Cloudinary delivery URL, return as-is
  if (!url.includes('cloudinary.com') || !url.includes('/image/upload/')) {
    return url
  }

  // Preserve SVG vectors without rasterizing
  if (url.endsWith('.svg') || url.includes('.svg?')) {
    return url
  }

  const {
    width,
    height,
    crop = 'limit',
    gravity,
    quality = 'auto',
    format = 'auto',
    dpr
  } = options

  // Build the transformation segment
  const transforms: string[] = []

  // Automatic modern format negotiation (WebP / AVIF)
  transforms.push(`f_${format}`)

  // Perceptual quality compression
  transforms.push(`q_${quality}`)

  // Dimensions & Cropping
  // When crop is 'limit' (default), Cloudinary scales proportionally without cropping or zooming
  if (width && height) {
    transforms.push(`w_${Math.round(width)}`)
    transforms.push(`h_${Math.round(height)}`)
    transforms.push(`c_${crop}`)
    if ((crop === 'fill' || crop === 'thumb') && gravity) {
      transforms.push(`g_${gravity}`)
    }
  } else if (width) {
    transforms.push(`w_${Math.round(width)}`)
    transforms.push(`c_${crop}`)
    if ((crop === 'fill' || crop === 'thumb') && gravity) {
      transforms.push(`g_${gravity}`)
    }
  } else if (height) {
    transforms.push(`h_${Math.round(height)}`)
    transforms.push(`c_${crop}`)
    if ((crop === 'fill' || crop === 'thumb') && gravity) {
      transforms.push(`g_${gravity}`)
    }
  }

  // Device Pixel Ratio if specified
  if (dpr) {
    transforms.push(`dpr_${dpr}`)
  }

  const transformStr = transforms.join(',')

  // Extract base URL before '/image/upload/' and the public path after
  const uploadIndex = url.indexOf('/image/upload/')
  if (uploadIndex === -1) return url

  const prefix = url.substring(0, uploadIndex + '/image/upload/'.length)
  let rest = url.substring(uploadIndex + '/image/upload/'.length)

  // Check if existing URL already has transformation segment (e.g. /image/upload/v12345/ or /image/upload/w_300/...)
  // If the first segment doesn't start with 'v' followed by digits, it might be an existing transform
  const firstSlash = rest.indexOf('/')
  if (firstSlash !== -1) {
    const firstSegment = rest.substring(0, firstSlash)
    // If it's an existing transform segment (e.g. contains f_ or w_ or c_), strip it out
    if (/^[a-z]_[a-z0-9_:,]+$/i.test(firstSegment) || firstSegment.includes('f_auto') || firstSegment.includes('w_')) {
      rest = rest.substring(firstSlash + 1)
    }
  }

  return `${prefix}${transformStr}/${rest}`
}

/**
 * Generates a responsive srcset string with multiple width descriptors
 */
export function getCloudinarySrcSet(
  url: string | null | undefined,
  widths: number[] = [360, 480, 720, 1080],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return ''

  return widths
    .map(w => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ')
}

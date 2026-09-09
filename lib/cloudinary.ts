import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default cloudinary

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width?: number
  height?: number
  format?: string
  bytes?: number
}

/**
 * Extract Cloudinary public_id from a full Cloudinary URL
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null
  }
  try {
    const uploadIndex = url.indexOf('/upload/')
    if (uploadIndex === -1) return null

    let publicIdWithExt = url.substring(uploadIndex + 8)
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '')

    const parts = publicIdWithExt.split('/')
    let cleanParts = parts
    if (parts[0] && (parts[0].includes('_') || parts[0].includes(','))) {
      cleanParts = parts.slice(1)
      if (cleanParts[0] && /^v\d+$/.test(cleanParts[0])) {
        cleanParts = cleanParts.slice(1)
      }
    }

    const pathWithoutTransformations = cleanParts.join('/')
    const lastDotIndex = pathWithoutTransformations.lastIndexOf('.')
    if (lastDotIndex !== -1) {
      return pathWithoutTransformations.substring(0, lastDotIndex)
    }
    return pathWithoutTransformations
  } catch (e) {
    console.warn('Failed to extract Cloudinary public_id from URL:', url, e)
    return null
  }
}

/**
 * Delete image from Cloudinary using public_id
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
      if (error) {
        console.error('Cloudinary deletion error for public_id:', publicId, error)
        resolve(false)
      } else {
        console.log('Cloudinary image deleted successfully:', publicId, result)
        resolve(true)
      }
    })
  })
}

/**
 * Delete image from Cloudinary by full image URL
 */
export async function deleteImageByUrlFromCloudinary(url: string): Promise<boolean> {
  const publicId = extractCloudinaryPublicId(url)
  if (!publicId) return false
  return await deleteImageFromCloudinary(publicId)
}

/**
 * Upload a base64 data URI or Buffer to Cloudinary
 */
export async function uploadImageToCloudinary(
  fileData: string | Buffer,
  folder = 'products'
): Promise<CloudinaryUploadResult> {
  const isBanner = folder.includes('banner') || folder.includes('hero')

  const uploadOptions: any = {
    folder: `tots_clothing/${folder}`,
    resource_type: 'auto'
  }

  if (isBanner) {
    // Preserves crisp visual clarity for hero banners
    uploadOptions.quality = 'auto:best'
    uploadOptions.fetch_format = 'auto'
  } else {
    // Automatically compresses product/category images to save free tier bandwidth
    uploadOptions.quality = 'auto'
    uploadOptions.fetch_format = 'auto'
  }

  return new Promise((resolve, reject) => {
    if (typeof fileData === 'string') {
      cloudinary.uploader.upload(
        fileData,
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            return reject(error)
          }
          if (!result) return reject(new Error('Cloudinary upload returned empty response'))
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          })
        }
      )
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error)
            return reject(error)
          }
          if (!result) return reject(new Error('Cloudinary upload returned empty response'))
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          })
        }
      )
      uploadStream.end(fileData)
    }
  })
}

/**
 * Utility to generate optimized image URLs for Cloudinary assets.
 * - 'hero': Preserves ultra-high resolution & clarity (q_auto:best).
 * - 'product': Auto format + auto quality + width capping (f_auto,q_auto,w_800,c_limit) to conserve free tier bandwidth.
 * - 'thumb': Small thumbnail optimization (f_auto,q_auto,w_350,c_limit).
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  type: 'hero' | 'product' | 'thumb' = 'product'
): string {
  if (!url || typeof url !== 'string') return '/images/placeholder.jpg'
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) return url

  // If URL already has transformation flags, return as is
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/upload/w_')) return url

  let transformation = 'f_auto,q_auto'
  if (type === 'hero') {
    transformation = 'f_auto,q_auto:best'
  } else if (type === 'product') {
    transformation = 'f_auto,q_auto,w_800,c_limit'
  } else if (type === 'thumb') {
    transformation = 'f_auto,q_auto,w_350,c_limit'
  }

  return url.replace('/upload/', `/upload/${transformation}/`)
}



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
 * Upload a base64 data URI or Buffer to Cloudinary
 */
export async function uploadImageToCloudinary(
  fileData: string | Buffer,
  folder = 'tots'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    if (typeof fileData === 'string') {
      cloudinary.uploader.upload(
        fileData,
        {
          folder: `tots_clothing/${folder}`,
          resource_type: 'image'
        },
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
        {
          folder: `tots_clothing/${folder}`,
          resource_type: 'image'
        },
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

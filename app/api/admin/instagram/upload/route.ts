import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    // Strictly validate image MIME type - NO VIDEOS ALLOWED
    if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return NextResponse.json(
        { error: 'Videos are not supported. Please upload an image file (JPG, PNG, WebP).' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload JPG, PNG, or WebP image.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Direct upload to Cloudinary only - no Supabase storage or base64 fallbacks
    const cloudinaryResult = await uploadImageToCloudinary(buffer, 'instagram')

    if (!cloudinaryResult?.secure_url) {
      throw new Error('Cloudinary upload returned an empty URL')
    }

    return NextResponse.json({
      success: true,
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
      storage: 'cloudinary'
    })
  } catch (err: any) {
    console.error('Instagram Cloudinary upload error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to upload image to Cloudinary.' },
      { status: 500 }
    )
  }
}

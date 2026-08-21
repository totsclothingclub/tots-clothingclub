import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // 1. Handle Multipart / FormData uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const folder = (formData.get('folder') as string) || 'products'

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const result = await uploadImageToCloudinary(buffer, folder)

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      })
    }

    // 2. Handle JSON base64 / URL payloads
    const body = await req.json()
    const { file, folder = 'products' } = body

    if (!file) {
      return NextResponse.json({ error: 'Missing "file" field in JSON body' }, { status: 400 })
    }

    const result = await uploadImageToCloudinary(file, folder)

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })
  } catch (err: any) {
    console.error('API Upload error:', err)
    return NextResponse.json(
      {
        error: err.message || 'Image upload to Cloudinary failed',
        details: err
      },
      { status: 500 }
    )
  }
}

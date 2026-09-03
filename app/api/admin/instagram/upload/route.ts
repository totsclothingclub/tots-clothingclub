import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 1. Try Supabase Storage upload
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createAdminClient()
        const bucketName = 'instagram'
        const ext = file.name.split('.').pop() || 'jpg'
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${Date.now()}-${cleanName}`

        // Try uploading to Supabase Storage bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true
          })

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName)

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              storage: 'supabase'
            })
          }
        } else if (uploadError) {
          console.warn('Supabase storage upload error, trying fallback:', uploadError.message)
        }
      } catch (storageErr) {
        console.warn('Supabase storage exception:', storageErr)
      }
    }

    // 2. Fallback to Cloudinary or base64 if Supabase storage is unavailable
    try {
      const cloudinaryResult = await uploadImageToCloudinary(buffer, 'instagram')
      if (cloudinaryResult?.secure_url) {
        return NextResponse.json({
          success: true,
          url: cloudinaryResult.secure_url,
          storage: 'cloudinary'
        })
      }
    } catch (cErr) {
      console.warn('Cloudinary upload fallback exception:', cErr)
    }

    // 3. Fallback to base64 Data URI if no remote storage is configured
    const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`
    return NextResponse.json({
      success: true,
      url: base64,
      storage: 'base64'
    })
  } catch (err: any) {
    console.error('Instagram image upload error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to upload image.' },
      { status: 500 }
    )
  }
}

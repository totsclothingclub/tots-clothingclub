import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Ensure Cloudinary is initialized
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const folder = body.folder ? `tots_clothing/${body.folder}` : 'tots_clothing/general'
    const timestamp = Math.round(new Date().getTime() / 1000)

    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const apiKey = process.env.CLOUDINARY_API_KEY
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are not properly configured on server' },
        { status: 500 }
      )
    }

    const paramsToSign = {
      folder,
      timestamp
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder
    })
  } catch (err: any) {
    console.error('Cloudinary signature error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}

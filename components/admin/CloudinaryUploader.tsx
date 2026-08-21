'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, X } from 'lucide-react'

interface CloudinaryUploaderProps {
  onUploadSuccess: (url: string) => void
  folder?: 'products' | 'banners' | 'categories' | 'general'
  label?: string
  acceptMultiple?: boolean
  className?: string
  aspectRatioLabel?: string
}

export default function CloudinaryUploader({
  onUploadSuccess,
  folder = 'products',
  label = 'Upload Image to Cloudinary',
  acceptMultiple = false,
  className = '',
  aspectRatioLabel
}: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setErrorMsg(null)
    setSuccessCount(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const data = await res.json()

        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Failed to upload image to Cloudinary')
        }

        onUploadSuccess(data.url)
        setSuccessCount(prev => prev + 1)
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err)
      setErrorMsg(err.message || 'Image upload failed. Please verify Cloudinary credentials.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => setSuccessCount(0), 4000)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-semibold text-xs text-charcoal flex items-center gap-1.5">
            <UploadCloud size={14} className="text-gold" />
            <span>{label}</span>
          </label>
          {aspectRatioLabel && (
            <span className="text-[10px] text-mid font-medium">{aspectRatioLabel}</span>
          )}
        </div>
      )}

      <div
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-gold bg-gold/10 scale-[0.99]'
            : isUploading
            ? 'border-border bg-gray-50 opacity-80 cursor-wait'
            : 'border-border hover:border-gold/80 bg-[#faf7f2] hover:bg-white shadow-2xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          multiple={acceptMultiple}
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <>
              <Loader2 size={24} className="text-gold animate-spin" />
              <span className="text-xs font-semibold text-charcoal">
                Optimizing & Uploading to Cloudinary CDN...
              </span>
              <span className="text-[10px] text-mid">Auto formatting (WebP/AVIF) & lossless compression</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-charcoal group-hover:scale-110 transition-transform">
                <UploadCloud size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal">
                  Click to browse or drag & drop image{acceptMultiple ? 's' : ''}
                </p>
                <p className="text-[10px] text-mid mt-0.5">
                  JPG, PNG, WEBP • Uploads directly to Cloudinary & saves in Supabase
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success alert */}
      {successCount > 0 && (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs animate-fadein">
          <CheckCircle2 size={14} />
          <span>Successfully uploaded {successCount} image{successCount > 1 ? 's' : ''} to Cloudinary!</span>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-start justify-between gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs animate-fadein">
          <div className="flex items-start gap-1.5">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

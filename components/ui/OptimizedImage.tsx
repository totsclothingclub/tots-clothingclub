'use client'

import React, { useState } from 'react'
import { getOptimizedImageUrl, getCloudinarySrcSet, CloudinaryTransformOptions } from '@/lib/cloudinary-utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb'
  priority?: boolean
  srcSetWidths?: number[]
  sizes?: string
  fallbackSrc?: string
  containerClassName?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  crop = 'fill',
  priority = false,
  srcSetWidths,
  sizes,
  className = '',
  fallbackSrc = '/images/placeholder.svg',
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const optimizedSrc = getOptimizedImageUrl(imgSrc, {
    width,
    height,
    crop,
    format: 'auto',
    quality: 'auto'
  })

  const srcSet = srcSetWidths
    ? getCloudinarySrcSet(imgSrc, srcSetWidths, { height, crop, format: 'auto', quality: 'auto' })
    : undefined

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
    if (onError) onError(e)
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={handleError}
      className={className}
      {...props}
    />
  )
}

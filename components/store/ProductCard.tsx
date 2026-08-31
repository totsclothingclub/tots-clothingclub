'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { Product } from '@/lib/types'
import { useWishlist } from '@/lib/context/WishlistContext'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const [hovered, setHovered] = useState(false)

  const hasSecondary = product.images && product.images.length > 1
  // Resolve the best available image: primary_image → first product_image → placeholder
  const resolvedPrimary =
    (product.primary_image && product.primary_image !== '/images/placeholder.jpg' && product.primary_image) ||
    product.images?.[0]?.image_url ||
    '/images/placeholder.jpg'

  const img = hovered && hasSecondary ? (product.images![1].image_url || resolvedPrimary) : resolvedPrimary

  const regular = product.regular_price
  const sale    = product.sale_price
  const discount = product.discount_percent || (sale ? Math.round(((regular - sale) / regular) * 100) : 0)

  const displayPrice = sale ?? regular

  return (
    <div
      className="product-card group relative bg-white rounded-lg border border-[#f0ebe0] overflow-hidden hover:shadow-2xs transition-all duration-300 flex flex-col justify-between"
    >
      {/* ── Product Image ── */}
      <div
        className="relative aspect-[3/4] bg-[#f5efe6] overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={img || '/images/placeholder.jpg'}
            alt={product.name}
            className="product-img w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges in Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_new_arrival && (
            <span className="bg-amber-400 text-charcoal text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow-2xs">
              NEW
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-amber-500 text-white text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow-2xs">
              BEST SELLER
            </span>
          )}
          {product.is_sale && discount > 0 && (
            <span className="bg-wine text-white text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow-2xs">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle in Top Right */}
        <button
          onClick={e => {
            e.preventDefault()
            toggleWishlist(product)
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-transform active:scale-90 z-10 ${
            isWishlisted
              ? 'bg-wine text-white shadow-md'
              : 'bg-white/80 text-charcoal hover:bg-white hover:text-wine shadow-2xs'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Product Details ── */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-white space-y-1.5">
        <div className="space-y-1">
          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3
              className="font-sans font-semibold text-charcoal text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-wine transition-colors"
            >
              {product.name}
            </h3>
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="currentColor" stroke="none" />
              ))}
            </div>
            <span className="text-[10px] text-mid font-medium">({product.review_count || 48})</span>
          </div>
        </div>

        {/* Price & Size info (No divider border-t) */}
        <div className="flex flex-col pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-bold text-wine text-sm sm:text-base">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {sale && (
              <span className="text-[11px] line-through text-mid font-medium">
                ₹{regular.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Size pills */}
          {product.available_sizes && product.available_sizes.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {product.available_sizes.slice(0, 4).map(size => (
                <span
                  key={size}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f5efe6] text-charcoal border border-border/70"
                >
                  {size}
                </span>
              ))}
              {product.available_sizes.length > 4 && (
                <span className="text-[9px] text-mid font-medium">
                  +{product.available_sizes.length - 4}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-mid font-medium mt-0.5">
              XS to 7XL
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard

'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { ProductCard } from '@/components/store/ProductCard'
import { useWishlist } from '@/lib/context/WishlistContext'
import { getProducts } from '@/lib/supabase/data-service'
import { Product } from '@/lib/types'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { wishlistProductIds } = useWishlist()
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(all => {
      setWishlistProducts(all.filter(p => wishlistProductIds.includes(p.id)))
    })
  }, [wishlistProductIds])

  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-12 py-8 space-y-6 pb-24">
        <div className="flex items-center gap-3 border-b border-tots-border pb-4">
          <Heart className="w-8 h-8 text-tots-wine fill-tots-wine/20" />
          <h1 className="font-serif text-3xl font-bold text-tots-dark">My Saved Wishlist</h1>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-tots-border p-8 space-y-4">
            <Heart className="w-16 h-16 text-tots-gold mx-auto stroke-1" />
            <h2 className="font-serif text-2xl font-semibold text-tots-dark">Your wishlist is empty</h2>
            <p className="text-xs text-tots-gray max-w-sm mx-auto">
              Save your favorite dresses and kurta sets to revisit anytime.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-tots-wine text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-tots-wine-hover transition-colors"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

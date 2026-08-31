import React from 'react'
import { notFound } from 'next/navigation'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { getProductBySlug, getProductReviews } from '@/lib/supabase/data-service'
import { ProductDetailClient } from '@/components/store/ProductDetailClient'

export const revalidate = 0

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const reviews = await getProductReviews(product.id)

  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-12 pt-2 sm:pt-3 lg:pt-4 pb-16">
        <ProductDetailClient product={product} initialReviews={reviews} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

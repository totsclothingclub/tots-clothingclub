'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface SortSelectProps {
  currentSort: string
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('sort', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="border px-3 py-1.5 text-xs outline-none bg-white cursor-pointer"
      style={{ borderColor: 'var(--border)', color: 'var(--charcoal)' }}
      aria-label="Sort products"
    >
      <option value="featured">Featured</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="newest">Newest First</option>
      <option value="rating">Highest Rated</option>
    </select>
  )
}

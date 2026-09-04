'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'rating',     label: 'Highest Rated' },
]

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
    <div className="relative inline-flex items-center">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-white border border-border text-charcoal pl-3 pr-8 py-1.5 rounded-lg cursor-pointer outline-none hover:border-gold transition-colors text-xs"
        style={{ fontFamily: 'inherit', fontWeight: 600, minWidth: 148 }}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/50"
      />
    </div>
  )
}

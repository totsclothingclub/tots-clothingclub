'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/supabase/data-service'
import { Product } from '@/lib/types'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length > 1) {
      getProducts({ searchQuery: query }).then(res => setResults(res.slice(0, 5)))
    } else {
      setResults([])
    }
  }, [query])

  if (!isOpen) return null

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center pt-16 px-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-tots-cream rounded-2xl p-6 shadow-2xl relative border border-tots-gold/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-tots-dark hover:text-tots-wine transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="font-serif text-2xl font-semibold text-tots-dark mb-4">Search TOTS Collection</h3>

        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dresses, kurtas, plus size, tops..."
            className="w-full py-3.5 pl-12 pr-12 rounded-xl bg-white border border-tots-border text-tots-dark placeholder-tots-gray focus:outline-none focus:border-tots-gold text-base"
            autoFocus
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-tots-gold" />
          {query && (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-tots-wine text-white p-2 rounded-lg hover:bg-tots-wine-hover transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Live Search Quick Results */}
        {results.length > 0 && (
          <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            <p className="text-xs uppercase font-semibold text-tots-gray tracking-wider">Top Results</p>
            {results.map(prod => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-tots-beige transition-colors group"
              >
                <img
                  src={prod.primary_image}
                  alt={prod.name}
                  className="w-14 h-16 object-cover rounded-lg border border-tots-border"
                />
                <div className="flex-1">
                  <h4 className="font-serif font-medium text-tots-dark group-hover:text-tots-wine text-base">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-tots-gray">{prod.category?.name} • XS to 7XL</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-tots-wine">₹{prod.sale_price || prod.regular_price}</p>
                  {prod.sale_price && (
                    <p className="text-xs line-through text-tots-gray">₹{prod.regular_price}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Popular Tags */}
        <div>
          <p className="text-xs uppercase font-semibold text-tots-gray tracking-wider mb-2">Trending Searches</p>
          <div className="flex flex-wrap gap-2">
            {['Plus Size Dresses', 'Floral Maxi', 'Embroidered Kurta', 'Rayon Sets', 'Modest Abaya'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag)
                  router.push(`/shop?search=${encodeURIComponent(tag)}`)
                  onClose()
                }}
                className="text-xs bg-tots-beige text-tots-dark px-3 py-1.5 rounded-full hover:bg-tots-gold hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

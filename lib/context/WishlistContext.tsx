'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '../types'

interface WishlistContextType {
  wishlistProductIds: string[]
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tots_wishlist')
      if (saved) {
        setWishlistProductIds(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load wishlist from localStorage', e)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('tots_wishlist', JSON.stringify(wishlistProductIds))
      } catch (e) {
        console.warn('Failed to save wishlist to localStorage', e)
      }
    }
  }, [wishlistProductIds, isHydrated])

  const toggleWishlist = (product: Product) => {
    setWishlistProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id)
      } else {
        return [...prev, product.id]
      }
    })
  }

  const isInWishlist = (productId: string) => {
    return wishlistProductIds.includes(productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistProductIds.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

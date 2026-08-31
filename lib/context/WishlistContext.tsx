'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '../types'
import { useAuth } from './AuthContext'

interface WishlistContextType {
  wishlistProductIds: string[]
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load wishlist for current user
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      try {
        const saved = localStorage.getItem(`tots_wishlist_${user.id}`)
        if (saved) {
          setWishlistProductIds(JSON.parse(saved))
        } else {
          setWishlistProductIds([])
        }
      } catch (e) {
        console.warn('Failed to load wishlist from localStorage', e)
      }
    } else {
      setWishlistProductIds([])
    }
    setIsHydrated(true)
  }, [user?.id, isAuthenticated])

  // Save wishlist per user
  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.id) {
      try {
        localStorage.setItem(`tots_wishlist_${user.id}`, JSON.stringify(wishlistProductIds))
      } catch (e) {
        console.warn('Failed to save wishlist to localStorage', e)
      }
    }
  }, [wishlistProductIds, isHydrated, user?.id, isAuthenticated])

  const toggleWishlist = (product: Product) => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create an account to save dresses to your wishlist.')
      return
    }

    setWishlistProductIds(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id)
      } else {
        return [...prev, product.id]
      }
    })
  }

  const isInWishlist = (productId: string) => {
    return isAuthenticated && wishlistProductIds.includes(productId)
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

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product, ProductVariant } from '../types'

export interface CartLineItem {
  id: string
  product: Product
  variant: ProductVariant
  quantity: number
}

interface CartContextType {
  items: CartLineItem[]
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  totalItemCount: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartLineItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tots_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('tots_cart', JSON.stringify(items))
      } catch (e) {
        console.warn('Failed to save cart to localStorage', e)
      }
    }
  }, [items, isHydrated])

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.variant.id === variant.id)
      if (existingIndex > -1) {
        const next = [...prev]
        next[existingIndex].quantity += quantity
        return next
      } else {
        return [
          ...prev,
          {
            id: `${product.id}-${variant.id}`,
            product,
            variant,
            quantity
          }
        ]
      }
    })
    setIsDrawerOpen(true)
  }

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product.sale_price ?? item.product.regular_price) * item.quantity, 0)
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemCount,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

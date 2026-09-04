'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product, ProductVariant, Coupon } from '../types'
import { validateCoupon } from '../supabase/data-service'

export interface CartLineItem {
  id: string
  product: Product
  variant: ProductVariant
  quantity: number
}

interface CartContextType {
  items: CartLineItem[]
  addItem: (product: Product, variant: ProductVariant, quantity?: number, openDrawer?: boolean) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  totalItemCount: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  appliedCoupon: Coupon | null
  couponCode: string
  discount: number
  couponMessage: string
  applyCoupon: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartLineItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tots_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
      const savedCoupon = localStorage.getItem('tots_applied_coupon')
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon)
        setAppliedCoupon(parsed.coupon || null)
        setCouponCode(parsed.code || '')
        setDiscount(parsed.discount || 0)
        setCouponMessage(parsed.message || '')
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

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.sale_price ?? item.product.regular_price) * item.quantity,
    0
  )
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (isHydrated && appliedCoupon) {
      if (subtotal < appliedCoupon.min_order_amount) {
        setDiscount(0)
        setCouponMessage(`Minimum order amount for ${appliedCoupon.code} is ₹${appliedCoupon.min_order_amount}`)
      } else {
        let disc = 0
        if (appliedCoupon.discount_type === 'percentage') {
          disc = (subtotal * appliedCoupon.discount_value) / 100
          if (appliedCoupon.max_discount && disc > appliedCoupon.max_discount) {
            disc = appliedCoupon.max_discount
          }
        } else {
          disc = appliedCoupon.discount_value
        }
        const finalDisc = Math.round(disc)
        setDiscount(finalDisc)
        setCouponMessage(`Coupon ${appliedCoupon.code} applied successfully!`)
        try {
          localStorage.setItem(
            'tots_applied_coupon',
            JSON.stringify({ coupon: appliedCoupon, code: appliedCoupon.code, discount: finalDisc, message: `Coupon ${appliedCoupon.code} applied successfully!` })
          )
        } catch (e) {}
      }
    }
  }, [subtotal, appliedCoupon, isHydrated])

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      removeCoupon()
      return { valid: false, discount: 0, message: 'Please enter a coupon code.' }
    }
    const res = await validateCoupon(trimmed, subtotal)
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon)
      setCouponCode(res.coupon.code)
      setDiscount(res.discount)
      setCouponMessage(res.message)
      try {
        localStorage.setItem(
          'tots_applied_coupon',
          JSON.stringify({ coupon: res.coupon, code: res.coupon.code, discount: res.discount, message: res.message })
        )
      } catch (e) {}
    } else {
      setAppliedCoupon(null)
      setDiscount(0)
      setCouponMessage(res.message)
      try {
        localStorage.removeItem('tots_applied_coupon')
      } catch (e) {}
    }
    return res
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setDiscount(0)
    setCouponMessage('')
    try {
      localStorage.removeItem('tots_applied_coupon')
    } catch (e) {}
  }

  const addItem = (product: Product, variant: ProductVariant, quantity = 1, openDrawer = true) => {
    const addQty = Math.max(1, Number(quantity) || 1)
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.variant.id === variant.id
      )
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + addQty } : item
        )
      } else {
        return [
          ...prev,
          {
            id: `${product.id}-${variant.id}`,
            product,
            variant,
            quantity: addQty
          }
        ]
      }
    })
    if (openDrawer) {
      setIsDrawerOpen(true)
    }
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
    removeCoupon()
  }

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
        setIsDrawerOpen,
        appliedCoupon,
        couponCode,
        discount,
        couponMessage,
        applyCoupon,
        removeCoupon
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

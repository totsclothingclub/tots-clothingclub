import { createClient } from './client'
import {
  INITIAL_SETTINGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BANNERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS
} from './mock-data'
import {
  Product,
  Category,
  Banner,
  Announcement,
  Coupon,
  Review,
  StoreSettings,
  Order,
  DashboardStats
} from '../types'

// In-memory reactive state fallback store
let storeSettings: StoreSettings = { ...INITIAL_SETTINGS }
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS]
let banners: Banner[] = [...INITIAL_BANNERS]
let categories: Category[] = [...INITIAL_CATEGORIES]
let products: Product[] = [...INITIAL_PRODUCTS]
let coupons: Coupon[] = [...INITIAL_COUPONS]
let reviews: Review[] = [...INITIAL_REVIEWS]
let orders: Order[] = [...INITIAL_ORDERS]

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder')
}

// -------------------------------------------------------------
// STORE SETTINGS & ANNOUNCEMENTS
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('store_settings').select('*').single()
      if (!error && data) return data as StoreSettings
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to data service', e)
    }
  }
  return storeSettings
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('store_settings')
        .update(newSettings)
        .eq('id', storeSettings.id)
        .select()
        .single()
      if (!error && data) return data as StoreSettings
    } catch (e) {
      console.warn('Supabase update failed', e)
    }
  }
  storeSettings = { ...storeSettings, ...newSettings }
  return storeSettings
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true)
      if (!error && data) return data as Announcement[]
    } catch (e) {
      console.warn(e)
    }
  }
  return announcements.filter(a => a.is_active)
}

// -------------------------------------------------------------
// BANNERS
// -------------------------------------------------------------
export async function getActiveBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('display_order', { ascending: true })
      if (!error && data) return data as Banner[]
    } catch (e) {
      console.warn(e)
    }
  }
  return banners.filter(b => b.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllBanners(): Promise<Banner[]> {
  return banners.sort((a, b) => a.display_order - b.display_order)
}

export async function saveBanner(bannerData: Partial<Banner>): Promise<Banner> {
  if (bannerData.id) {
    banners = banners.map(b => (b.id === bannerData.id ? { ...b, ...bannerData } as Banner : b))
    return banners.find(b => b.id === bannerData.id)!
  } else {
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: bannerData.title || 'NEW BANNER',
      subtitle: bannerData.subtitle || '',
      button_text: bannerData.button_text || 'SHOP NOW',
      button_url: bannerData.button_url || '/shop',
      desktop_image_url: bannerData.desktop_image_url || '/images/placeholder.jpg',
      mobile_image_url: bannerData.mobile_image_url || '/images/placeholder.jpg',
      is_active: bannerData.is_active ?? true,
      display_order: bannerData.display_order || banners.length + 1
    }
    banners.push(newBanner)
    return newBanner
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  banners = banners.filter(b => b.id !== id)
  return true
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true })
      if (!error && data) return data as Category[]
    } catch (e) {
      console.warn(e)
    }
  }
  return categories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllCategories(): Promise<Category[]> {
  return categories.sort((a, b) => a.display_order - b.display_order)
}

export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  if (categoryData.id) {
    categories = categories.map(c => (c.id === categoryData.id ? { ...c, ...categoryData } as Category : c))
    return categories.find(c => c.id === categoryData.id)!
  } else {
    const slug = (categoryData.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug: categoryData.slug || slug,
      description: categoryData.description || '',
      image_url: categoryData.image_url || '/images/placeholder.jpg',
      display_order: categoryData.display_order || categories.length + 1,
      is_active: categoryData.is_active ?? true
    }
    categories.push(newCategory)
    return newCategory
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  categories = categories.filter(c => c.id !== id)
  return true
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
export interface ProductFilterOptions {
  categorySlug?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  isPlusSize?: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  isSale?: boolean
  searchQuery?: string
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating'
}

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  let result = [...products].filter(p => p.status === 'published')

  if (options.categorySlug && options.categorySlug !== 'all') {
    result = result.filter(p => p.category?.slug === options.categorySlug)
  }

  if (options.size && options.size !== 'all') {
    const selectedSizes = options.size.split(',')
    result = result.filter(p => p.available_sizes?.some(sz => selectedSizes.includes(sz)))
  }

  if (options.color && options.color !== 'all') {
    result = result.filter(p => p.variants?.some(v => v.color.toLowerCase().includes(options.color!.toLowerCase())))
  }

  if (options.minPrice !== undefined) {
    result = result.filter(p => (p.sale_price ?? p.regular_price) >= options.minPrice!)
  }

  if (options.maxPrice !== undefined) {
    result = result.filter(p => (p.sale_price ?? p.regular_price) <= options.maxPrice!)
  }

  if (options.isPlusSize) {
    result = result.filter(p => p.is_plus_size)
  }

  if (options.isNewArrival) {
    result = result.filter(p => p.is_new_arrival)
  }

  if (options.isBestSeller) {
    result = result.filter(p => p.is_best_seller)
  }

  if (options.isSale) {
    result = result.filter(p => p.is_sale)
  }

  if (options.searchQuery && options.searchQuery.trim() !== '') {
    const q = options.searchQuery.toLowerCase().trim()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    )
  }

  // Sorting
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price))
        break
      case 'price-high':
        result.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price))
        break
      case 'newest':
        result.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0))
        break
      case 'rating':
        result.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
        break
      default:
        // featured
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    }
  }

  return result
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const found = products.find(p => p.slug === slug)
  return found || null
}

export async function getProductById(id: string): Promise<Product | null> {
  const found = products.find(p => p.id === id)
  return found || null
}

export async function getAllAdminProducts(): Promise<Product[]> {
  return products
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  if (productData.id) {
    products = products.map(p => (p.id === productData.id ? { ...p, ...productData, updated_at: new Date().toISOString() } as Product : p))
    return products.find(p => p.id === productData.id)!
  } else {
    const slug = (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Product',
      slug: productData.slug || slug,
      description: productData.description || '',
      short_description: productData.short_description || '',
      category_id: productData.category_id,
      category: categories.find(c => c.id === productData.category_id),
      brand: 'TOTS',
      sku: productData.sku || `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      regular_price: Number(productData.regular_price) || 999,
      sale_price: productData.sale_price ? Number(productData.sale_price) : undefined,
      discount_percent: productData.discount_percent || 0,
      tax_percent: 5.00,
      status: productData.status || 'published',
      is_featured: productData.is_featured ?? false,
      is_new_arrival: productData.is_new_arrival ?? true,
      is_best_seller: productData.is_best_seller ?? false,
      is_sale: productData.is_sale ?? false,
      is_plus_size: productData.is_plus_size ?? true,
      primary_image: productData.primary_image || '/images/placeholder.jpg',
      rating_avg: 5.0,
      review_count: 1,
      available_sizes: productData.available_sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
      variants: productData.variants || [
        {
          id: `var-${Date.now()}-1`,
          product_id: `prod-${Date.now()}`,
          size: '3XL',
          color: 'Standard',
          color_hex: '#1a1a1a',
          sku: `${productData.sku || 'TOTS'}-3XL`,
          price: Number(productData.sale_price || productData.regular_price || 999),
          stock_quantity: 10
        }
      ],
      images: productData.images || [
        {
          id: `img-${Date.now()}-1`,
          product_id: `prod-${Date.now()}`,
          image_url: productData.primary_image || '/images/placeholder.jpg',
          is_primary: true,
          display_order: 1
        }
      ],
      created_at: new Date().toISOString()
    }
    products.unshift(newProduct)
    return newProduct
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  products = products.filter(p => p.id !== id)
  return true
}

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------
export async function validateCoupon(code: string, cartSubtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.is_active)
  if (!found) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' }
  }

  if (cartSubtotal < found.min_order_amount) {
    return { valid: false, discount: 0, message: `Minimum order amount for code ${found.code} is ₹${found.min_order_amount}.` }
  }

  let discount = 0
  if (found.discount_type === 'percentage') {
    discount = (cartSubtotal * found.discount_value) / 100
    if (found.max_discount && discount > found.max_discount) {
      discount = found.max_discount
    }
  } else {
    discount = found.discount_value
  }

  return { valid: true, coupon: found, discount: Math.round(discount), message: `Coupon ${found.code} applied successfully!` }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  return coupons
}

export async function saveCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  if (couponData.id) {
    coupons = coupons.map(c => (c.id === couponData.id ? { ...c, ...couponData } as Coupon : c))
    return coupons.find(c => c.id === couponData.id)!
  } else {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: (couponData.code || 'TOTS10').toUpperCase(),
      discount_type: couponData.discount_type || 'percentage',
      discount_value: Number(couponData.discount_value) || 10,
      min_order_amount: Number(couponData.min_order_amount) || 499,
      usage_limit: 1000,
      used_count: 0,
      is_active: couponData.is_active ?? true
    }
    coupons.push(newCoupon)
    return newCoupon
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  coupons = coupons.filter(c => c.id !== id)
  return true
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
export async function getProductReviews(productId: string): Promise<Review[]> {
  return reviews.filter(r => r.product_id === productId && r.is_approved)
}

export async function submitReview(reviewData: { productId: string; name: string; rating: number; title: string; comment: string }): Promise<Review> {
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    product_id: reviewData.productId,
    customer_name: reviewData.name,
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    is_verified_purchase: true,
    is_approved: true,
    created_at: new Date().toISOString()
  }
  reviews.unshift(newReview)
  return newReview
}

// -------------------------------------------------------------
// ORDERS & CHECKOUT
// -------------------------------------------------------------
export async function createOrder(orderPayload: Partial<Order>): Promise<Order> {
  const orderNumber = `TOTS-${Math.floor(10000 + Math.random() * 90000)}`
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    customer_name: orderPayload.customer_name || 'Valued Customer',
    customer_email: orderPayload.customer_email || 'customer@example.com',
    customer_phone: orderPayload.customer_phone || '+91 98765 43210',
    shipping_address: orderPayload.shipping_address!,
    subtotal: orderPayload.subtotal || 0,
    discount: orderPayload.discount || 0,
    shipping_fee: orderPayload.shipping_fee || 0,
    tax: orderPayload.tax || 0,
    total: orderPayload.total || 0,
    order_status: 'Processing',
    payment_status: 'Paid',
    payment_method: orderPayload.payment_method || 'Razorpay',
    payment_id: orderPayload.payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`,
    tracking_number: `TOTS-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    items: orderPayload.items || [],
    created_at: new Date().toISOString()
  }
  orders.unshift(newOrder)
  return newOrder
}

export async function getAllOrders(): Promise<Order[]> {
  return orders
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<Order | null> {
  orders = orders.map(o => (o.id === orderId ? { ...o, order_status: status } : o))
  return orders.find(o => o.id === orderId) || null
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'Paid' ? o.total : 0), 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const totalCustomers = new Set(orders.map(o => o.customer_email)).size + 24
  const pendingOrders = orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Processing').length
  const lowStockProducts = products.filter(p => p.variants?.some(v => v.stock_quantity <= 3)).length

  return {
    totalSales: Math.round(totalSales),
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
    todaySales: 2840,
    monthSales: Math.round(totalSales)
  }
}

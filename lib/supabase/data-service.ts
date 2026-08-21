import { createClient } from './client'
import {
  Product,
  Category,
  Banner,
  Announcement,
  Coupon,
  Review,
  StoreSettings,
  Order,
  DashboardStats,
  ProductImage,
  ProductVariant
} from '../types'

// Dynamic default state
const DEFAULT_SETTINGS: StoreSettings = {
  id: 'store-settings-1',
  store_name: 'TOTS',
  logo_url: '/images/tots-logo.png',
  support_email: 'care@tots.in',
  support_phone: '+91 98765 43210',
  currency: '₹',
  free_shipping_threshold: 999.0,
  standard_shipping_fee: 99.0,
  instagram_handle: '@tots_clothingclub'
}

let storeSettings: StoreSettings = { ...DEFAULT_SETTINGS }
let announcements: Announcement[] = []
let banners: Banner[] = []
let categories: Category[] = []
let products: Product[] = []
let coupons: Coupon[] = []
let reviews: Review[] = []
let orders: Order[] = []

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder') && !key.includes('placeholder')
}

// -------------------------------------------------------------
// STORE SETTINGS & ANNOUNCEMENTS
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).single()
      if (!error && data) {
        storeSettings = data as StoreSettings
        return storeSettings
      }
    } catch (e) {
      console.warn('Supabase fetch store settings failed', e)
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
        .upsert({ ...storeSettings, ...newSettings })
        .select()
        .single()
      if (!error && data) {
        storeSettings = data as StoreSettings
        return storeSettings
      }
    } catch (e) {
      console.warn('Supabase update store settings failed', e)
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
      console.warn('Supabase fetch announcements failed', e)
    }
  }
  return announcements.filter(a => a.is_active)
}

// -------------------------------------------------------------
// BANNERS (Cloudinary + Supabase)
// -------------------------------------------------------------
export async function getActiveBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (!error && data) return data as Banner[]
    } catch (e) {
      console.warn('Supabase getActiveBanners failed', e)
    }
  }
  return banners.filter(b => b.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error && data) {
        banners = data as Banner[]
        return banners
      }
    } catch (e) {
      console.warn('Supabase getAllBanners failed', e)
    }
  }
  return banners.sort((a, b) => a.display_order - b.display_order)
}

export async function saveBanner(bannerData: Partial<Banner>): Promise<Banner> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const bannerPayload = {
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || '',
        button_text: bannerData.button_text || 'SHOP NOW',
        button_url: bannerData.button_url || '/shop',
        desktop_image_url: bannerData.desktop_image_url || '/images/placeholder.jpg',
        mobile_image_url: bannerData.mobile_image_url || bannerData.desktop_image_url || '/images/placeholder.jpg',
        is_active: bannerData.is_active ?? true,
        display_order: Number(bannerData.display_order) || 1
      }

      if (bannerData.id && !bannerData.id.startsWith('banner-')) {
        const { data, error } = await supabase
          .from('banners')
          .update(bannerPayload)
          .eq('id', bannerData.id)
          .select()
          .single()
        if (!error && data) {
          banners = banners.map(b => (b.id === data.id ? (data as Banner) : b))
          return data as Banner
        }
      } else {
        const { data, error } = await supabase
          .from('banners')
          .insert([bannerPayload])
          .select()
          .single()
        if (!error && data) {
          banners.unshift(data as Banner)
          return data as Banner
        }
      }
    } catch (e) {
      console.warn('Supabase saveBanner failed', e)
    }
  }

  // Fallback in-memory
  if (bannerData.id) {
    banners = banners.map(b => (b.id === bannerData.id ? ({ ...b, ...bannerData } as Banner) : b))
    return banners.find(b => b.id === bannerData.id)!
  } else {
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: bannerData.title || '',
      subtitle: bannerData.subtitle || '',
      button_text: bannerData.button_text || 'SHOP NOW',
      button_url: bannerData.button_url || '/shop',
      desktop_image_url: bannerData.desktop_image_url || '/images/placeholder.jpg',
      mobile_image_url: bannerData.mobile_image_url || bannerData.desktop_image_url || '/images/placeholder.jpg',
      is_active: bannerData.is_active ?? true,
      display_order: Number(bannerData.display_order) || banners.length + 1
    }
    banners.push(newBanner)
    return newBanner
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('banners').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase deleteBanner failed', e)
    }
  }
  banners = banners.filter(b => b.id !== id)
  return true
}

// -------------------------------------------------------------
// CATEGORIES (Cloudinary + Supabase)
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (!error && data) return data as Category[]
    } catch (e) {
      console.warn('Supabase getCategories failed', e)
    }
  }
  return categories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error && data) {
        categories = data as Category[]
        return categories
      }
    } catch (e) {
      console.warn('Supabase getAllCategories failed', e)
    }
  }
  return categories.sort((a, b) => a.display_order - b.display_order)
}

export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  const slug = (categoryData.slug || categoryData.name || 'category')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const catPayload = {
        name: categoryData.name || 'New Category',
        slug: slug,
        description: categoryData.description || '',
        image_url: categoryData.image_url || '/images/placeholder.jpg',
        display_order: Number(categoryData.display_order) || 1,
        is_active: categoryData.is_active ?? true
      }

      if (categoryData.id && !categoryData.id.startsWith('cat-')) {
        const { data, error } = await supabase
          .from('categories')
          .update(catPayload)
          .eq('id', categoryData.id)
          .select()
          .single()
        if (!error && data) {
          categories = categories.map(c => (c.id === data.id ? (data as Category) : c))
          return data as Category
        }
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([catPayload])
          .select()
          .single()
        if (!error && data) {
          categories.push(data as Category)
          return data as Category
        }
      }
    } catch (e) {
      console.warn('Supabase saveCategory failed', e)
    }
  }

  // Fallback in-memory
  if (categoryData.id) {
    categories = categories.map(c => (c.id === categoryData.id ? ({ ...c, ...categoryData } as Category) : c))
    return categories.find(c => c.id === categoryData.id)!
  } else {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug: slug,
      description: categoryData.description || '',
      image_url: categoryData.image_url || '/images/placeholder.jpg',
      display_order: Number(categoryData.display_order) || categories.length + 1,
      is_active: categoryData.is_active ?? true
    }
    categories.push(newCategory)
    return newCategory
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('categories').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase deleteCategory failed', e)
    }
  }
  categories = categories.filter(c => c.id !== id)
  return true
}

// -------------------------------------------------------------
// PRODUCTS (Cloudinary URLs + Supabase Database Sync)
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('status', 'published')

      if (options.isPlusSize) query = query.eq('is_plus_size', true)
      if (options.isNewArrival) query = query.eq('is_new_arrival', true)
      if (options.isBestSeller) query = query.eq('is_best_seller', true)
      if (options.isSale) query = query.eq('is_sale', true)

      const { data, error } = await query
      if (!error && data) {
        let list = data as Product[]
        if (options.categorySlug && options.categorySlug !== 'all') {
          list = list.filter(p => p.category?.slug === options.categorySlug)
        }
        if (options.searchQuery && options.searchQuery.trim()) {
          const q = options.searchQuery.toLowerCase().trim()
          list = list.filter(
            p =>
              p.name?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q) ||
              p.sku?.toLowerCase().includes(q)
          )
        }
        return list
      }
    } catch (e) {
      console.warn('Supabase getProducts failed, using in-memory', e)
    }
  }

  // Fallback in-memory
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
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
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
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    }
  }

  return result
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .single()
      if (!error && data) return data as Product
    } catch (e) {
      console.warn('Supabase getProductBySlug failed', e)
    }
  }
  const found = products.find(p => p.slug === slug)
  return found || null
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('id', id)
        .single()
      if (!error && data) return data as Product
    } catch (e) {
      console.warn('Supabase getProductById failed', e)
    }
  }
  const found = products.find(p => p.id === id)
  return found || null
}

export async function getAllAdminProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false })
      if (!error && data) {
        products = data as Product[]
        return products
      }
    } catch (e) {
      console.warn('Supabase getAllAdminProducts failed', e)
    }
  }
  return products
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const primaryImg =
    productData.primary_image ||
    (productData.images && productData.images[0]?.image_url) ||
    '/images/placeholder.jpg'

  const slug = (productData.slug || productData.name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const productPayload: any = {
        name: productData.name || 'New Product',
        slug: slug,
        description: productData.description || '',
        short_description: productData.short_description || '',
        category_id: productData.category_id || null,
        brand: productData.brand || 'TOTS',
        sku: productData.sku || `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        regular_price: Number(productData.regular_price) || 999,
        sale_price: productData.sale_price ? Number(productData.sale_price) : null,
        discount_percent: productData.discount_percent || 0,
        tax_percent: productData.tax_percent || 5.0,
        status: productData.status || 'published',
        is_featured: productData.is_featured ?? false,
        is_new_arrival: productData.is_new_arrival ?? true,
        is_best_seller: productData.is_best_seller ?? false,
        is_sale: productData.is_sale ?? false,
        is_plus_size: productData.is_plus_size ?? true,
        primary_image: primaryImg
      }

      let savedProduct: any = null

      if (productData.id && !productData.id.startsWith('prod-')) {
        const { data, error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productData.id)
          .select()
          .single()
        if (!error && data) savedProduct = data
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single()
        if (!error && data) savedProduct = data
      }

      if (savedProduct) {
        // Sync images to product_images table
        if (productData.images && productData.images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', savedProduct.id)
          const imgRows = productData.images.map((img, idx) => ({
            product_id: savedProduct.id,
            image_url: img.image_url,
            is_primary: img.is_primary ?? idx === 0,
            display_order: idx + 1
          }))
          await supabase.from('product_images').insert(imgRows)
        }

        // Sync variants to product_variants table
        if (productData.variants && productData.variants.length > 0) {
          await supabase.from('product_variants').delete().eq('product_id', savedProduct.id)
          const varRows = productData.variants.map(v => ({
            product_id: savedProduct.id,
            size: v.size,
            color: v.color || 'Standard',
            color_hex: v.color_hex || '#1a1a1a',
            sku: v.sku || `${savedProduct.sku}-${v.size}`,
            price: Number(v.price) || Number(savedProduct.regular_price),
            stock_quantity: Number(v.stock_quantity) || 10
          }))
          await supabase.from('product_variants').insert(varRows)
        }

        const completeProduct = await getProductById(savedProduct.id)
        if (completeProduct) {
          products = products.filter(p => p.id !== completeProduct.id)
          products.unshift(completeProduct)
          return completeProduct
        }
      }
    } catch (e) {
      console.warn('Supabase saveProduct failed, writing to fallback memory', e)
    }
  }

  // Fallback in-memory
  if (productData.id) {
    products = products.map(p =>
      p.id === productData.id
        ? ({ ...p, ...productData, primary_image: primaryImg, updated_at: new Date().toISOString() } as Product)
        : p
    )
    return products.find(p => p.id === productData.id)!
  } else {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Product',
      slug: slug,
      description: productData.description || '',
      short_description: productData.short_description || '',
      category_id: productData.category_id,
      category: categories.find(c => c.id === productData.category_id),
      brand: 'TOTS',
      sku: productData.sku || `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      regular_price: Number(productData.regular_price) || 999,
      sale_price: productData.sale_price ? Number(productData.sale_price) : undefined,
      discount_percent: productData.discount_percent || 0,
      tax_percent: 5.0,
      status: productData.status || 'published',
      is_featured: productData.is_featured ?? false,
      is_new_arrival: productData.is_new_arrival ?? true,
      is_best_seller: productData.is_best_seller ?? false,
      is_sale: productData.is_sale ?? false,
      is_plus_size: productData.is_plus_size ?? true,
      primary_image: primaryImg,
      rating_avg: 5.0,
      review_count: 0,
      available_sizes: productData.available_sizes || [
        'XS',
        'S',
        'M',
        'L',
        'XL',
        '2XL',
        '3XL',
        '4XL',
        '5XL',
        '6XL',
        '7XL'
      ],
      variants: productData.variants || [],
      images: productData.images || [
        {
          id: `img-${Date.now()}-1`,
          product_id: `prod-${Date.now()}`,
          image_url: primaryImg,
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('products').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase deleteProduct failed', e)
    }
  }
  products = products.filter(p => p.id !== id)
  return true
}

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------
export async function validateCoupon(
  code: string,
  cartSubtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  let activeCoupons: Coupon[] = []
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('coupons').select('*').eq('is_active', true)
      if (!error && data) activeCoupons = data as Coupon[]
    } catch (e) {}
  }
  if (activeCoupons.length === 0) activeCoupons = coupons.filter(c => c.is_active)

  const found = activeCoupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim())
  if (!found) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' }
  }

  if (cartSubtotal < found.min_order_amount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount for code ${found.code} is ₹${found.min_order_amount}.`
    }
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

  return {
    valid: true,
    coupon: found,
    discount: Math.round(discount),
    message: `Coupon ${found.code} applied successfully!`
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        coupons = data as Coupon[]
        return coupons
      }
    } catch (e) {}
  }
  return coupons
}

export async function saveCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  const code = (couponData.code || 'TOTS10').toUpperCase().trim()

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const payload = {
        code,
        discount_type: couponData.discount_type || 'percentage',
        discount_value: Number(couponData.discount_value) || 10,
        min_order_amount: Number(couponData.min_order_amount) || 499,
        max_discount: couponData.max_discount ? Number(couponData.max_discount) : null,
        usage_limit: Number(couponData.usage_limit) || 1000,
        used_count: Number(couponData.used_count) || 0,
        is_active: couponData.is_active ?? true
      }

      if (couponData.id && !couponData.id.startsWith('coup-')) {
        const { data, error } = await supabase.from('coupons').update(payload).eq('id', couponData.id).select().single()
        if (!error && data) return data as Coupon
      } else {
        const { data, error } = await supabase.from('coupons').insert([payload]).select().single()
        if (!error && data) return data as Coupon
      }
    } catch (e) {}
  }

  if (couponData.id) {
    coupons = coupons.map(c => (c.id === couponData.id ? ({ ...c, ...couponData, code } as Coupon) : c))
    return coupons.find(c => c.id === couponData.id)!
  } else {
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code,
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('coupons').delete().eq('id', id)
    } catch (e) {}
  }
  coupons = coupons.filter(c => c.id !== id)
  return true
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
export async function getProductReviews(productId: string): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      if (!error && data) return data as Review[]
    } catch (e) {}
  }
  return reviews.filter(r => r.product_id === productId && r.is_approved)
}

export async function getAllReviews(): Promise<Review[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        reviews = data as Review[]
        return reviews
      }
    } catch (e) {}
  }
  return reviews
}

export async function submitReview(reviewData: {
  productId: string
  name: string
  rating: number
  title: string
  comment: string
}): Promise<Review> {
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.productId,
          customer_name: reviewData.name,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          is_verified_purchase: true,
          is_approved: true
        }])
        .select()
        .single()
      if (!error && data) return data as Review
    } catch (e) {}
  }

  reviews.unshift(newReview)
  return newReview
}

export async function updateReviewStatus(id: string, is_approved: boolean): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('reviews').update({ is_approved }).eq('id', id)
    } catch (e) {}
  }
  reviews = reviews.map(r => (r.id === id ? { ...r, is_approved } : r))
  return true
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('reviews').delete().eq('id', id)
    } catch (e) {}
  }
  reviews = reviews.filter(r => r.id !== id)
  return true
}

// -------------------------------------------------------------
// ORDERS & CHECKOUT
// -------------------------------------------------------------
export async function createOrder(orderPayload: Partial<Order>): Promise<Order> {
  const orderNumber = `TOTS-${Math.floor(10000 + Math.random() * 90000)}`
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    customer_name: orderPayload.customer_name || 'Customer',
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          shipping_address: newOrder.shipping_address,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          shipping_fee: newOrder.shipping_fee,
          tax: newOrder.tax,
          total: newOrder.total,
          order_status: newOrder.order_status,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
          payment_id: newOrder.payment_id,
          tracking_number: newOrder.tracking_number
        }])
        .select()
        .single()

      if (!error && data && newOrder.items && newOrder.items.length > 0) {
        const itemRows = newOrder.items.map(item => ({
          order_id: data.id,
          product_id: item.product_id || null,
          variant_id: item.variant_id || null,
          product_name: item.product_name,
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url
        }))
        await supabase.from('order_items').insert(itemRows)
        return { ...newOrder, id: data.id }
      }
    } catch (e) {
      console.warn('Supabase createOrder failed', e)
    }
  }

  orders.unshift(newOrder)
  return newOrder
}

export async function getAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false })
      if (!error && data) {
        orders = data as Order[]
        return orders
      }
    } catch (e) {
      console.warn('Supabase getAllOrders failed', e)
    }
  }
  return orders
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('orders').update({ order_status: status }).eq('id', orderId)
    } catch (e) {}
  }
  orders = orders.map(o => (o.id === orderId ? { ...o, order_status: status } : o))
  return orders.find(o => o.id === orderId) || null
}

// -------------------------------------------------------------
// DASHBOARD STATS (100% Dynamic from Real Orders and Products)
// -------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const allOrders = await getAllOrders()
  const allProds = await getAllAdminProducts()

  const paidOrders = allOrders.filter(o => o.payment_status === 'Paid')
  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const totalOrders = allOrders.length
  const totalProducts = allProds.length
  const totalCustomers = new Set(allOrders.map(o => o.customer_email).filter(Boolean)).size
  const pendingOrders = allOrders.filter(o => o.order_status === 'Pending' || o.order_status === 'Processing').length
  const lowStockProducts = allProds.filter(p => p.variants?.some(v => Number(v.stock_quantity) <= 3)).length

  // Calculate today's sales
  const todayStr = new Date().toISOString().slice(0, 10)
  const todaySales = paidOrders
    .filter(o => (o.created_at || '').startsWith(todayStr))
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  return {
    totalSales: Math.round(totalSales),
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    lowStockProducts,
    todaySales: Math.round(todaySales),
    monthSales: Math.round(totalSales)
  }
}

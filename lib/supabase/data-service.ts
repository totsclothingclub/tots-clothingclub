import { createClient } from './client'
import {
  Product,
  Category,
  NavLocation,
  Banner,
  Announcement,
  Coupon,
  Review,
  StoreSettings,
  Order,
  DashboardStats,
  ProductImage,
  ProductVariant,
  InstagramPost,
  PromoCard
} from '../types'
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './mock-data'

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
let instagramPosts: InstagramPost[] = []
let categories: Category[] = [...INITIAL_CATEGORIES]
let products: Product[] = [...INITIAL_PRODUCTS]
let coupons: Coupon[] = []
let reviews: Review[] = []
let orders: Order[] = []

let promoCards: PromoCard[] = [
  { id: 'promo-1', label: 'SPECIAL DROP', title: 'STYLE UNDER ₹499', description: 'Everything you love. Nothing over ₹499.', button_text: 'SHOP NOW', button_url: '/shop?maxPrice=499', image_url: '', bg_color: 'wine', text_color: 'white', display_order: 1, is_active: true },
  { id: 'promo-2', label: 'XS TO 7XL', title: 'PLUS SIZE COLLECTION', description: 'Fashion that fits beautifully and feels amazing.', button_text: 'EXPLORE NOW', button_url: '/shop?category=plus-size', image_url: '', bg_color: 'cream', text_color: 'dark', display_order: 2, is_active: true },
  { id: 'promo-3', label: 'NEW SEASON', title: 'NEW ARRIVALS', description: 'Fresh styles. Just for you.', button_text: 'SHOP NOW', button_url: '/shop?category=new-arrivals', image_url: '', bg_color: 'cream', text_color: 'dark', display_order: 3, is_active: true },
]

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
// INSTAGRAM GALLERY (Cloudinary + Supabase)
// -------------------------------------------------------------
export async function getInstagramPosts(): Promise<InstagramPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (!error && data) return data as InstagramPost[]
    } catch (e) {
      console.warn('Supabase getInstagramPosts failed', e)
    }
  }
  return instagramPosts.filter(p => p.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllInstagramPosts(): Promise<InstagramPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error && data) {
        instagramPosts = data as InstagramPost[]
        return instagramPosts
      }
    } catch (e) {
      console.warn('Supabase getAllInstagramPosts failed', e)
    }
  }
  return instagramPosts.sort((a, b) => a.display_order - b.display_order)
}

export async function saveInstagramPost(postData: Partial<InstagramPost>): Promise<InstagramPost> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const payload = {
        image_url: postData.image_url || '/images/placeholder.jpg',
        tag: postData.tag || null,
        post_url: postData.post_url || 'https://instagram.com/tots_clothingclub',
        display_order: Number(postData.display_order) || 1,
        is_active: postData.is_active ?? true
      }

      if (postData.id && !postData.id.startsWith('ig-')) {
        const { data, error } = await supabase
          .from('instagram_posts')
          .update(payload)
          .eq('id', postData.id)
          .select()
          .single()
        if (!error && data) {
          instagramPosts = instagramPosts.map(p => (p.id === data.id ? (data as InstagramPost) : p))
          return data as InstagramPost
        }
      } else {
        const { data, error } = await supabase
          .from('instagram_posts')
          .insert([payload])
          .select()
          .single()
        if (!error && data) {
          instagramPosts.push(data as InstagramPost)
          return data as InstagramPost
        }
      }
    } catch (e) {
      console.warn('Supabase saveInstagramPost failed', e)
    }
  }

  // Fallback in-memory
  if (postData.id) {
    instagramPosts = instagramPosts.map(p => (p.id === postData.id ? ({ ...p, ...postData } as InstagramPost) : p))
    return instagramPosts.find(p => p.id === postData.id)!
  } else {
    const newPost: InstagramPost = {
      id: `ig-${Date.now()}`,
      image_url: postData.image_url || '/images/placeholder.jpg',
      tag: postData.tag,
      post_url: postData.post_url || 'https://instagram.com/tots_clothingclub',
      display_order: Number(postData.display_order) || instagramPosts.length + 1,
      is_active: postData.is_active ?? true
    }
    instagramPosts.push(newPost)
    return newPost
  }
}

export async function deleteInstagramPost(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('instagram_posts').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase deleteInstagramPost failed', e)
    }
  }
  instagramPosts = instagramPosts.filter(p => p.id !== id)
  return true
}

export function normalizeCategory(cat: Category, allCats: Category[]): Category {
  let nav_location: NavLocation = cat.nav_location || 'shop_dropdown'
  let parent_id = cat.parent_id || null

  const shopCat = allCats.find(c => c.slug === 'shop')
  const plusCat = allCats.find(c => c.slug === 'plus-size')

  // Top navbar categories
  if (['new-arrivals', 'shop', 'plus-size', 'sale'].includes(cat.slug)) {
    nav_location = 'navbar'
    parent_id = null
  }
  // Plus size subcategories (including Salwar)
  else if (
    ['modest-wear', 'salwar', 'daily-wear', 'plus-size-bottoms'].includes(cat.slug) ||
    (cat.slug === 'salwar' && cat.name.toLowerCase() !== 'salwar sets') ||
    (plusCat && parent_id === plusCat.id) ||
    parent_id === 'cat-plus-size' ||
    cat.nav_location === 'plus_size_dropdown'
  ) {
    nav_location = 'plus_size_dropdown'
    if (!parent_id && plusCat) parent_id = plusCat.id
  }
  // Shop dropdown categories
  else if (
    ['under-199', 'under-499', '99-store', 'salwar-sets', 'chikankari', 'hijabs', 'bottoms'].includes(cat.slug) ||
    (shopCat && parent_id === shopCat.id) ||
    parent_id === 'cat-shop' ||
    cat.nav_location === 'shop_dropdown'
  ) {
    nav_location = 'shop_dropdown'
    if (!parent_id && shopCat) parent_id = shopCat.id
  }

  return {
    ...cat,
    image_url: cat.image_url || '',
    nav_location,
    parent_id
  }
}

// -------------------------------------------------------------
// CATEGORIES (Cloudinary + Supabase)
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  let list: Category[] = []
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .neq('slug', 'all-plus-size')
        .order('display_order', { ascending: true })
      if (!error && data && data.length > 0) {
        list = data as Category[]
      }
    } catch (e) {
      console.warn('Supabase getCategories failed', e)
    }
  }

  if (list.length === 0) {
    list = categories.filter(c => c.is_active && c.slug !== 'all-plus-size')
  }

  const filtered = list.filter(c => c.slug !== 'all-plus-size')
  const normalized = filtered.map(c => normalizeCategory(c, filtered))
  return normalized.sort((a, b) => a.display_order - b.display_order)
}

export async function getAllCategories(): Promise<Category[]> {
  let list: Category[] = []
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .neq('slug', 'all-plus-size')
        .order('display_order', { ascending: true })
      if (!error && data && data.length > 0) {
        list = data as Category[]
      }
    } catch (e) {
      console.warn('Supabase getAllCategories failed', e)
    }
  }

  if (list.length === 0) {
    list = categories.filter(c => c.slug !== 'all-plus-size')
  }

  const filtered = list.filter(c => c.slug !== 'all-plus-size')
  const normalized = filtered.map(c => normalizeCategory(c, filtered))
  return normalized.sort((a, b) => a.display_order - b.display_order)
}


export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  const slug = (categoryData.slug || categoryData.name || 'category')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const catPayload: any = {
        name: categoryData.name || 'New Category',
        slug: slug,
        description: categoryData.description || '',
        image_url: categoryData.image_url || '/images/placeholder.jpg',
        display_order: Number(categoryData.display_order) || 1,
        is_active: categoryData.is_active ?? true,
        nav_location: categoryData.nav_location || 'shop_dropdown',
        is_dropdown: categoryData.is_dropdown ?? false,
        parent_id: categoryData.parent_id || null
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
    categories = categories.map(c => (c.id === categoryData.id ? ({ ...c, ...categoryData, slug } as Category) : c))
    return categories.find(c => c.id === categoryData.id)!
  } else {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug: slug,
      description: categoryData.description || '',
      image_url: categoryData.image_url || '/images/placeholder.jpg',
      display_order: Number(categoryData.display_order) || categories.length + 1,
      is_active: categoryData.is_active ?? true,
      nav_location: categoryData.nav_location || 'shop_dropdown',
      is_dropdown: categoryData.is_dropdown ?? false,
      parent_id: categoryData.parent_id || null
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

function matchesCategory(product: Product, slug: string, allCats: Category[] = categories): boolean {
  if (!slug || slug === 'all') return true

  // 1. Direct match on primary category
  if (product.category?.slug === slug || product.category?.id === slug || product.category_id === slug) return true

  // 2. Resolve target category from slug
  const targetCategory = allCats.find(c => c.slug === slug || c.id === slug)
  const targetName = targetCategory ? targetCategory.name.toLowerCase().trim() : slug.replace(/-/g, ' ').toLowerCase().trim()
  const targetSlug = slug.toLowerCase().trim()

  // 3. Multi-category check (checks ID, UUID, Slug, or Category Name)
  const catIds = (product as any).category_ids || []
  if (Array.isArray(catIds) && catIds.length > 0) {
    const isMatched = catIds.some((item: string) => {
      if (!item) return false
      const itemClean = String(item).toLowerCase().trim()
      
      // Direct match on slug, UUID, or ID
      if (itemClean === targetSlug || item === targetCategory?.id) return true

      // Match on resolved category in allCats
      const cat = allCats.find(c => c.id === item || c.slug === item || c.name.toLowerCase() === itemClean)
      if (cat) {
        if (cat.slug === targetSlug || cat.id === targetSlug || cat.id === targetCategory?.id) return true
        if (cat.name.toLowerCase() === targetName) return true
      }

      // Name comparison (e.g. "salwar sets" === "salwar sets", "under ₹499" === "under ₹499", "under 499" === "under 499")
      if (itemClean === targetName) return true
      if (itemClean.replace(/[^a-z0-9]/g, '') === targetName.replace(/[^a-z0-9]/g, '')) return true

      return false
    })

    if (isMatched) return true
  }

  // 4. Plus Size collection broad matching
  if (targetSlug === 'plus-size' || targetSlug === 'all-plus-size') {
    const isTaggedPlus = catIds.some((item: string) => {
      const itemClean = String(item).toLowerCase()
      const cat = allCats.find(c => c.id === item || c.slug === item || c.name.toLowerCase() === itemClean)
      return (cat && (cat.nav_location === 'plus_size_dropdown' || cat.parent_id === 'cat-plus-size' || cat.slug.includes('plus'))) || itemClean.includes('plus')
    })
    return Boolean(
      product.is_plus_size ||
      product.category?.slug === 'plus-size' ||
      product.category?.nav_location === 'plus_size_dropdown' ||
      isTaggedPlus
    )
  }

  // 5. Special categories
  if (targetSlug === 'sale') return Boolean(product.is_sale || product.category?.slug === 'sale')
  if (targetSlug === 'new-arrivals') return Boolean(product.is_new_arrival || product.category?.slug === 'new-arrivals')
  if (targetSlug === 'under-199') {
    return (product.sale_price ?? product.regular_price) <= 199 || product.category?.slug === 'under-199'
  }
  if (targetSlug === 'under-499') {
    return (product.sale_price ?? product.regular_price) <= 499 || product.category?.slug === 'under-499'
  }
  if (targetSlug === '99-store') {
    return (product.sale_price ?? product.regular_price) <= 99 || product.category?.slug === '99-store'
  }

  // 6. Subcategory fallbacks
  const name = product.name?.toLowerCase() || ''
  const desc = product.description?.toLowerCase() || ''
  if (slug === 'modest-wear' || slug === 'plus-size-modest-wear') {
    return (product.is_plus_size || product.category?.nav_location === 'plus_size_dropdown') &&
      (name.includes('maxi') || name.includes('dress') || name.includes('abaya') || desc.includes('modest'))
  }
  if (slug === 'salwar' || slug === 'plus-size-salwar' || slug === 'salwar-sets') {
    return name.includes('kurta') || name.includes('salwar') || desc.includes('kurta')
  }
  if (slug === 'daily-wear' || slug === 'plus-size-daily-wear') {
    return (product.is_plus_size || product.category?.nav_location === 'plus_size_dropdown') &&
      (name.includes('shirt') || name.includes('top') || name.includes('casual') || name.includes('cotton'))
  }
  if (slug === 'bottoms' || slug === 'plus-size-bottoms') {
    return name.includes('bottom') || name.includes('pant') || name.includes('trouser') || desc.includes('trousers')
  }
  if (slug === 'chikankari') {
    return name.includes('chikankari') || desc.includes('chikankari') || name.includes('embroidered')
  }
  if (slug === 'hijabs') {
    return name.includes('hijab') || desc.includes('hijab') || name.includes('abaya')
  }

  return false
}

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  const currentCategories = await getCategories()

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
          list = list.filter(p => matchesCategory(p, options.categorySlug!, currentCategories))
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
    result = result.filter(p => matchesCategory(p, options.categorySlug!, currentCategories))
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
        primary_image: primaryImg,
        available_sizes: productData.available_sizes || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL']
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

// -------------------------------------------------------------
// PROMO CARDS
// -------------------------------------------------------------
export async function getActivePromoCards(): Promise<PromoCard[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('promo_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (!error && data) return data as PromoCard[]
    } catch (e) {
      console.warn('Supabase getActivePromoCards failed', e)
    }
  }
  return promoCards.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order)
}

export async function getAllPromoCards(): Promise<PromoCard[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('promo_cards')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error && data) return data as PromoCard[]
    } catch (e) {
      console.warn('Supabase getAllPromoCards failed', e)
    }
  }
  return promoCards.sort((a, b) => a.display_order - b.display_order)
}

export async function savePromoCard(cardData: Partial<PromoCard>): Promise<PromoCard> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const payload: any = {
        label: cardData.label || '',
        title: cardData.title || '',
        description: cardData.description || '',
        button_text: cardData.button_text || 'SHOP NOW',
        button_url: cardData.button_url || '/shop',
        image_url: cardData.image_url || '',
        bg_color: cardData.bg_color || 'cream',
        text_color: cardData.text_color || 'dark',
        display_order: cardData.display_order ?? 0,
        is_active: cardData.is_active ?? true
      }

      if (cardData.id && !cardData.id.startsWith('promo-')) {
        const { data, error } = await supabase
          .from('promo_cards')
          .update(payload)
          .eq('id', cardData.id)
          .select()
          .single()
        if (!error && data) return data as PromoCard
      } else {
        const { data, error } = await supabase
          .from('promo_cards')
          .insert([payload])
          .select()
          .single()
        if (!error && data) return data as PromoCard
      }
    } catch (e) {
      console.warn('Supabase savePromoCard failed', e)
    }
  }

  // Fallback in-memory
  if (cardData.id) {
    promoCards = promoCards.map(c =>
      c.id === cardData.id ? { ...c, ...cardData } as PromoCard : c
    )
    return promoCards.find(c => c.id === cardData.id)!
  } else {
    const newCard: PromoCard = {
      id: `promo-${Date.now()}`,
      label: cardData.label || '',
      title: cardData.title || '',
      description: cardData.description || '',
      button_text: cardData.button_text || 'SHOP NOW',
      button_url: cardData.button_url || '/shop',
      image_url: cardData.image_url || '',
      bg_color: cardData.bg_color || 'cream',
      text_color: cardData.text_color || 'dark',
      display_order: cardData.display_order ?? promoCards.length + 1,
      is_active: cardData.is_active ?? true,
      created_at: new Date().toISOString()
    }
    promoCards.push(newCard)
    return newCard
  }
}

export async function deletePromoCard(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.from('promo_cards').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase deletePromoCard failed', e)
    }
  }
  promoCards = promoCards.filter(c => c.id !== id)
  return true
}

export type NavLocation = 'navbar' | 'shop_dropdown' | 'plus_size_dropdown' | 'none'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
  is_active: boolean
  parent_id?: string | null
  nav_location?: NavLocation
  is_dropdown?: boolean
  created_at?: string
  children?: Category[]
}


export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_hex?: string
  sku: string
  price: number
  stock_quantity: number
  image_url?: string
  created_at?: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  display_order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description?: string
  category_id?: string
  category?: Category
  brand: string
  sku: string
  regular_price: number
  sale_price?: number
  discount_percent?: number
  tax_percent?: number
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  is_new_arrival: boolean
  is_best_seller: boolean
  is_sale: boolean
  is_plus_size: boolean
  meta_title?: string
  meta_description?: string
  variants?: ProductVariant[]
  images?: ProductImage[]
  primary_image?: string
  rating_avg?: number
  review_count?: number
  available_sizes?: string[]
  created_at?: string
  updated_at?: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  button_text?: string
  button_url?: string
  desktop_image_url: string
  mobile_image_url: string
  is_active: boolean
  display_order: number
  created_at?: string
}

export interface Announcement {
  id: string
  text: string
  link?: string
  is_active: boolean
}

export interface CartItem {
  id: string
  cart_id: string
  variant_id: string
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface Address {
  id?: string
  user_id?: string
  label?: 'Home' | 'Office' | 'Other' | string
  full_name: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  pincode: string
  country: string
  is_default?: boolean
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  role?: 'customer' | 'admin'
  created_at?: string
  addresses?: Address[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  size: string
  color: string
  price: number
  quantity: number
  image_url?: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: Address
  subtotal: number
  discount: number
  shipping_fee: number
  tax: number
  total: number
  order_status: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded'
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
  payment_method: string
  payment_id?: string
  razorpay_order_id?: string
  tracking_number?: string
  notes?: string
  items?: OrderItem[]
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount?: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  start_date?: string
  end_date?: string
}

export interface Review {
  id: string
  product_id: string
  user_id?: string
  customer_name: string
  rating: number
  title?: string
  comment: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
}

export interface StoreSettings {
  id: string
  store_name: string
  logo_url?: string
  support_email: string
  support_phone: string
  currency: string
  free_shipping_threshold: number
  standard_shipping_fee: number
  instagram_handle: string
}

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
  todaySales: number
  monthSales: number
}

export interface InstagramPost {
  id: string
  image_url: string
  tag?: string
  post_url?: string
  display_order: number
  is_active: boolean
  created_at?: string
}

export interface PromoCard {
  id: string
  label: string          // e.g. "SPECIAL DROP"
  title: string          // e.g. "STYLE UNDER ₹499"
  description?: string   // e.g. "Everything you love.\nNothing over ₹499."
  button_text?: string   // e.g. "SHOP NOW"
  button_url?: string    // e.g. "/shop?maxPrice=499"
  image_url?: string     // card image
  bg_color?: string      // e.g. "wine" | "cream" | hex
  text_color?: string    // "white" | "dark"
  display_order: number
  is_active: boolean
  created_at?: string
}

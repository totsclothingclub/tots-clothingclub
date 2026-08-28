import { Category, Product, Banner, Announcement, Coupon, Review, StoreSettings, Order } from '../types'

export const INITIAL_SETTINGS: StoreSettings = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  store_name: 'TOTS',
  logo_url: '/images/tots-logo.png',
  support_email: 'support@totsclothingclub.com',
  support_phone: '+91 85940 41490',
  currency: '₹',
  free_shipping_threshold: 999.00,
  standard_shipping_fee: 80.00,
  instagram_handle: '@tots_clothingclub'
}

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    text: '🚚 Free Shipping on Orders Above ₹999 | Use Code: TOTS10 for 10% Off',
    link: '/shop',
    is_active: true
  }
]

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'FASHION THAT FITS YOU',
    subtitle: 'STYLE HAS NO SIZE.',
    button_text: 'SHOP NEW ARRIVALS',
    button_url: '/shop?category=new-arrivals',
    desktop_image_url: '/images/placeholder.jpg',
    mobile_image_url: '/images/placeholder.jpg',
    is_active: true,
    display_order: 1
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    title: 'PLUS SIZE COLLECTION',
    subtitle: 'XS to 7XL — Designed for every body and every occasion.',
    button_text: 'EXPLORE PLUS SIZE',
    button_url: '/shop?category=plus-size',
    desktop_image_url: '/images/placeholder.jpg',
    mobile_image_url: '/images/placeholder.jpg',
    is_active: true,
    display_order: 2
  }
]

export const INITIAL_CATEGORIES: Category[] = [
  // ── Top Level Navbar Navigation ──
  {
    id: 'cat-new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Fresh styles and newest season luxury drops.',
    image_url: '',
    display_order: 1,
    is_active: true,
    nav_location: 'navbar',
    is_dropdown: false,
    parent_id: null
  },
  {
    id: 'cat-shop',
    name: 'Shop',
    slug: 'shop',
    description: 'Explore our complete ready-to-wear and budget collections.',
    image_url: '',
    display_order: 2,
    is_active: true,
    nav_location: 'navbar',
    is_dropdown: true,
    parent_id: null
  },
  {
    id: 'cat-plus-size',
    name: 'Plus Size',
    slug: 'plus-size',
    description: 'XS to 7XL — Size inclusive fashion crafted for every body.',
    image_url: '',
    display_order: 3,
    is_active: true,
    nav_location: 'navbar',
    is_dropdown: true,
    parent_id: null
  },
  {
    id: 'cat-sale',
    name: 'Sale',
    slug: 'sale',
    description: 'Exclusive clearance offers, deals and festive discounts.',
    image_url: '',
    display_order: 4,
    is_active: true,
    nav_location: 'navbar',
    is_dropdown: false,
    parent_id: null
  },

  // ── SHOP Dropdown Categories ──
  {
    id: 'cat-under-199',
    name: 'Under ₹199',
    slug: 'under-199',
    description: 'Budget-friendly styles and essentials under ₹199.',
    image_url: '',
    display_order: 1,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-under-499',
    name: 'Under ₹499',
    slug: 'under-499',
    description: 'Best-selling fashion and tops under ₹499.',
    image_url: '',
    display_order: 2,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-99-store',
    name: '99 Store',
    slug: '99-store',
    description: 'Steal deals starting at just ₹99.',
    image_url: '',
    display_order: 3,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-salwar-sets',
    name: 'Salwar Sets',
    slug: 'salwar-sets',
    description: 'Elegant stitched and unstitched salwar suits.',
    image_url: '',
    display_order: 4,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-chikankari',
    name: 'Chikankari',
    slug: 'chikankari',
    description: 'Authentic Lucknowi handcrafted Chikankari kurtas.',
    image_url: '',
    display_order: 5,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-hijabs',
    name: 'Hijabs',
    slug: 'hijabs',
    description: 'Premium georgette, chiffon, and cotton modal hijabs.',
    image_url: '',
    display_order: 6,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },
  {
    id: 'cat-bottoms',
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Trousers, palazzos, leggings, and comfort pants.',
    image_url: '',
    display_order: 7,
    is_active: true,
    nav_location: 'shop_dropdown',
    parent_id: 'cat-shop'
  },

  // ── PLUS SIZE Dropdown & Page Subcategories ──
  {
    id: 'cat-ps-modest',
    name: 'Modest Wear',
    slug: 'modest-wear',
    description: 'Modest dresses, abayas, and full-coverage sets.',
    image_url: '',
    display_order: 1,
    is_active: true,
    nav_location: 'plus_size_dropdown',
    parent_id: 'cat-plus-size'
  },
  {
    id: 'cat-ps-salwar',
    name: 'Salwar',
    slug: 'salwar',
    description: 'Plus size ethnic salwar suits and kurta sets.',
    image_url: '',
    display_order: 2,
    is_active: true,
    nav_location: 'plus_size_dropdown',
    parent_id: 'cat-plus-size'
  },
  {
    id: 'cat-ps-daily',
    name: 'Daily Wear',
    slug: 'daily-wear',
    description: 'Comfortable everyday tops, kurtis, and tunics.',
    image_url: '',
    display_order: 3,
    is_active: true,
    nav_location: 'plus_size_dropdown',
    parent_id: 'cat-plus-size'
  },
  {
    id: 'cat-ps-bottoms',
    name: 'Bottoms',
    slug: 'plus-size-bottoms',
    description: 'Stretchable and plus size tailored bottoms.',
    image_url: '',
    display_order: 4,
    is_active: true,
    nav_location: 'plus_size_dropdown',
    parent_id: 'cat-plus-size'
  }
]


export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Floral Printed Maxi Dress',
    slug: 'floral-printed-maxi-dress',
    description: 'Elevate your wardrobe with our signature Floral Printed Maxi Dress. Crafted from lightweight, breathable rayon chiffon with a flattering cinched waist and flowy modest skirt. Perfect for casual wear, festive gatherings, and evening outings.',
    short_description: 'Comfortable, flowy floral maxi dress designed for all-day comfort.',
    category_id: 'cat-2',
    category: INITIAL_CATEGORIES[1],
    brand: 'TOTS',
    sku: 'TOTS-DR-001',
    regular_price: 799.00,
    sale_price: 599.00,
    discount_percent: 25,
    tax_percent: 5.00,
    status: 'published',
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    is_sale: true,
    is_plus_size: true,
    meta_title: 'Floral Printed Maxi Dress - TOTS Plus Size Collection',
    meta_description: 'Shop premium Floral Printed Maxi Dress available in sizes XS to 7XL at TOTS.',
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.9,
    review_count: 128,
    available_sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
    images: [
      { id: 'img-1', product_id: 'prod-1', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 },
      { id: 'img-2', product_id: 'prod-1', image_url: '/images/placeholder.jpg', is_primary: false, display_order: 2 },
      { id: 'img-3', product_id: 'prod-1', image_url: '/images/placeholder.jpg', is_primary: false, display_order: 3 }
    ],
    variants: [
      { id: 'var-1', product_id: 'prod-1', size: 'XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-XL', price: 599.00, stock_quantity: 5 },
      { id: 'var-2', product_id: 'prod-1', size: '2XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-2XL', price: 599.00, stock_quantity: 8 },
      { id: 'var-3', product_id: 'prod-1', size: '3XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-3XL', price: 599.00, stock_quantity: 3 }, // Stock 3 left matching design!
      { id: 'var-4', product_id: 'prod-1', size: '4XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-4XL', price: 599.00, stock_quantity: 6 },
      { id: 'var-5', product_id: 'prod-1', size: '5XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-5XL', price: 599.00, stock_quantity: 4 },
      { id: 'var-6', product_id: 'prod-1', size: '6XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-6XL', price: 599.00, stock_quantity: 2 },
      { id: 'var-7', product_id: 'prod-1', size: '7XL', color: 'Black Floral', color_hex: '#1a1a1a', sku: 'TOTS-DR-001-7XL', price: 599.00, stock_quantity: 1 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Embroidered Kurta Set',
    slug: 'embroidered-kurta-set',
    description: 'Rich deep wine embroidery along the neck and cuffs. Paired with comfortable straight trousers. Perfect blend of traditional craft and modern fit.',
    short_description: 'Intricate neck embroidery kurta with trousers in rich maroon.',
    category_id: 'cat-4',
    category: INITIAL_CATEGORIES[3],
    brand: 'TOTS',
    sku: 'TOTS-KS-002',
    regular_price: 999.00,
    sale_price: 699.00,
    discount_percent: 30,
    tax_percent: 5.00,
    status: 'published',
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: true,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.8,
    review_count: 94,
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [
      { id: 'img-4', product_id: 'prod-2', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-8', product_id: 'prod-2', size: '3XL', color: 'Wine Maroon', color_hex: '#701a2b', sku: 'TOTS-KS-002-3XL', price: 699.00, stock_quantity: 10 },
      { id: 'var-9', product_id: 'prod-2', size: '4XL', color: 'Wine Maroon', color_hex: '#701a2b', sku: 'TOTS-KS-002-4XL', price: 699.00, stock_quantity: 7 }
    ]
  },
  {
    id: 'prod-3',
    name: 'Floral A-Line Dress',
    slug: 'floral-a-line-dress',
    description: 'Elegant dark navy A-line silhouette with delicate micro floral motifs. Breathable rayon fabric with soft gathers.',
    short_description: 'Dark navy floral dress with easy A-line flare.',
    category_id: 'cat-3',
    category: INITIAL_CATEGORIES[2],
    brand: 'TOTS',
    sku: 'TOTS-DR-003',
    regular_price: 799.00,
    sale_price: 499.00,
    discount_percent: 37,
    tax_percent: 5.00,
    status: 'published',
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: false,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.7,
    review_count: 103,
    available_sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [
      { id: 'img-5', product_id: 'prod-3', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-10', product_id: 'prod-3', size: '2XL', color: 'Navy Blue', color_hex: '#111827', sku: 'TOTS-DR-003-2XL', price: 499.00, stock_quantity: 6 }
    ]
  },
  {
    id: 'prod-4',
    name: 'Casual Shirt Dress',
    slug: 'casual-shirt-dress',
    description: 'Striped grey and white utility shirt dress featuring button-down front, belt waist tie, and side pockets.',
    short_description: 'Smart casual grey striped button-down dress.',
    category_id: 'cat-3',
    category: INITIAL_CATEGORIES[2],
    brand: 'TOTS',
    sku: 'TOTS-SD-004',
    regular_price: 609.00,
    sale_price: 599.00,
    discount_percent: 2,
    tax_percent: 5.00,
    status: 'published',
    is_featured: false,
    is_new_arrival: false,
    is_best_seller: false,
    is_sale: false,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.6,
    review_count: 62,
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
    images: [
      { id: 'img-6', product_id: 'prod-4', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-11', product_id: 'prod-4', size: 'XL', color: 'Grey Stripe', color_hex: '#4b5563', sku: 'TOTS-SD-004-XL', price: 599.00, stock_quantity: 4 }
    ]
  },
  {
    id: 'prod-5',
    name: 'Rayon Kurta Set',
    slug: 'rayon-kurta-set',
    description: 'Olive green tunic kurta set with empire tie waist, breathable premium rayon fabric.',
    short_description: 'Olive green rayon kurta set with relaxed waist fit.',
    category_id: 'cat-4',
    category: INITIAL_CATEGORIES[3],
    brand: 'TOTS',
    sku: 'TOTS-KS-005',
    regular_price: 1199.00,
    sale_price: 749.00,
    discount_percent: 37,
    tax_percent: 5.00,
    status: 'published',
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: true,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.8,
    review_count: 81,
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [
      { id: 'img-7', product_id: 'prod-5', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-12', product_id: 'prod-5', size: '2XL', color: 'Olive Green', color_hex: '#3f6212', sku: 'TOTS-KS-005-2XL', price: 749.00, stock_quantity: 9 }
    ]
  },
  {
    id: 'prod-6',
    name: 'Printed Western Top',
    slug: 'printed-western-top',
    description: 'Dark indigo printed tunic top with shirt collar and cuffed sleeves.',
    short_description: 'Versatile printed top ideal for everyday denim pairing.',
    category_id: 'cat-3',
    category: INITIAL_CATEGORIES[2],
    brand: 'TOTS',
    sku: 'TOTS-TP-006',
    regular_price: 609.00,
    sale_price: 499.00,
    discount_percent: 18,
    tax_percent: 5.00,
    status: 'published',
    is_featured: false,
    is_new_arrival: false,
    is_best_seller: false,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.7,
    review_count: 76,
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    images: [
      { id: 'img-8', product_id: 'prod-6', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-13', product_id: 'prod-6', size: 'XL', color: 'Indigo', color_hex: '#1e1b4b', sku: 'TOTS-TP-006-XL', price: 499.00, stock_quantity: 8 }
    ]
  },
  {
    id: 'prod-7',
    name: 'Cotton Long Dress',
    slug: 'cotton-long-dress',
    description: '100% pure organic cotton long floral dress with front button placket and tiered skirt.',
    short_description: 'Soft organic cotton long dress for supreme summer comfort.',
    category_id: 'cat-3',
    category: INITIAL_CATEGORIES[2],
    brand: 'TOTS',
    sku: 'TOTS-DR-007',
    regular_price: 899.00,
    sale_price: 649.00,
    discount_percent: 27,
    tax_percent: 5.00,
    status: 'published',
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.9,
    review_count: 58,
    available_sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
    images: [
      { id: 'img-9', product_id: 'prod-7', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-14', product_id: 'prod-7', size: '3XL', color: 'Black Print', color_hex: '#1a1a1a', sku: 'TOTS-DR-007-3XL', price: 649.00, stock_quantity: 5 }
    ]
  },
  {
    id: 'prod-8',
    name: 'Embroidered Abaya',
    slug: 'embroidered-abaya',
    description: 'Deep plum purple modesty abaya featuring gold thread work around cuffs and chest.',
    short_description: 'Graceful purple embroidered abaya for modest occasions.',
    category_id: 'cat-4',
    category: INITIAL_CATEGORIES[3],
    brand: 'TOTS',
    sku: 'TOTS-AB-008',
    regular_price: 1299.00,
    sale_price: 899.00,
    discount_percent: 30,
    tax_percent: 5.00,
    status: 'published',
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: true,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    rating_avg: 4.9,
    review_count: 91,
    available_sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
    images: [
      { id: 'img-10', product_id: 'prod-8', image_url: '/images/placeholder.jpg', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'var-15', product_id: 'prod-8', size: '3XL', color: 'Plum Purple', color_hex: '#581c87', sku: 'TOTS-AB-008-3XL', price: 899.00, stock_quantity: 6 }
    ]
  }
]

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'TOTS10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 499,
    usage_limit: 500,
    used_count: 42,
    is_active: true
  },
  {
    id: 'coup-2',
    code: 'WELCOME100',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 999,
    usage_limit: 1000,
    used_count: 128,
    is_active: true
  }
]

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-1',
    customer_name: 'Ananya Sharma',
    rating: 5,
    title: 'Perfect fit for 3XL!',
    comment: 'Finding stylish plus size clothing that actually fits well has been impossible until I found TOTS. High quality fabric, soft feel, and beautiful floral pattern.',
    is_verified_purchase: true,
    is_approved: true,
    created_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 'rev-2',
    product_id: 'prod-1',
    customer_name: 'Priya V.',
    rating: 5,
    title: 'Loved the comfort',
    comment: 'Lightweight and elegant. Received so many compliments at a family lunch. Highly recommend!',
    is_verified_purchase: true,
    is_approved: true,
    created_at: '2026-08-12T14:30:00Z'
  },
  {
    id: 'rev-3',
    product_id: 'prod-2',
    customer_name: 'Meera Nair',
    rating: 5,
    title: 'Stunning embroidery',
    comment: 'The wine color is very rich and royal. Fits true to size chart.',
    is_verified_purchase: true,
    is_approved: true,
    created_at: '2026-08-15T09:15:00Z'
  }
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'TOTS-98741',
    customer_name: 'Simran Kaur',
    customer_email: 'simran.k@example.com',
    customer_phone: '+91 98765 12345',
    shipping_address: {
      full_name: 'Simran Kaur',
      phone: '+91 98765 12345',
      street: '42 Lotus Boulevard, Sector 128',
      apartment: 'Apt 402',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201304',
      country: 'India'
    },
    subtotal: 1198.00,
    discount: 119.80,
    shipping_fee: 0.00,
    tax: 53.91,
    total: 1132.11,
    order_status: 'Delivered',
    payment_status: 'Paid',
    payment_method: 'Razorpay',
    payment_id: 'pay_Mz987123654',
    tracking_number: 'DELIV-98231',
    created_at: '2026-08-16T11:20:00Z',
    items: [
      {
        id: 'oi-1',
        order_id: 'ord-1001',
        product_id: 'prod-1',
        product_name: 'Floral Printed Maxi Dress',
        size: '3XL',
        color: 'Black Floral',
        price: 599.00,
        quantity: 2,
        image_url: '/images/placeholder.jpg'
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'TOTS-98742',
    customer_name: 'Fatima Zahra',
    customer_email: 'fatima@example.com',
    customer_phone: '+91 98111 88899',
    shipping_address: {
      full_name: 'Fatima Zahra',
      phone: '+91 98111 88899',
      street: '15 Crescent Park, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India'
    },
    subtotal: 899.00,
    discount: 0.00,
    shipping_fee: 0.00,
    tax: 44.95,
    total: 943.95,
    order_status: 'Processing',
    payment_status: 'Paid',
    payment_method: 'UPI',
    payment_id: 'upi_78945612300',
    tracking_number: 'BLUEEX-44120',
    created_at: '2026-08-18T16:45:00Z',
    items: [
      {
        id: 'oi-2',
        order_id: 'ord-1002',
        product_id: 'prod-8',
        product_name: 'Embroidered Abaya',
        size: '3XL',
        color: 'Plum Purple',
        price: 899.00,
        quantity: 1,
        image_url: '/images/placeholder.jpg'
      }
    ]
  }
]

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Tag,
  Ruler,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Share2,
  CreditCard,
  Percent,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import { Product, ProductVariant, Review } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import { useWishlist } from '@/lib/context/WishlistContext'
import { submitReview } from '@/lib/supabase/data-service'

interface ProductDetailClientProps {
  product: Product
  initialReviews: Review[]
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product, initialReviews }) => {
  const router = useRouter()
  const { addItem, totalItemCount } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', product_id: product.id, image_url: product.primary_image || '/images/placeholder.jpg', is_primary: true, display_order: 1 }]

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // Available sizes from product
  const availableSizes = product.available_sizes && product.available_sizes.length > 0
    ? product.available_sizes
    : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL']
  const [selectedSize, setSelectedSize] = useState<string>(product.available_sizes?.[0] || 'M')
  
  // Dynamic color variants from admin product data
  const colors: { name: string; img?: string; hex?: string }[] = []
  if (product.variants && product.variants.length > 0) {
    const seen = new Set<string>()
    for (const v of product.variants) {
      if (v.color && v.color.trim() && v.color !== 'Standard' && !seen.has(v.color.toLowerCase().trim())) {
        seen.add(v.color.toLowerCase().trim())
        colors.push({
          name: v.color.trim(),
          img: v.image_url || images[0]?.image_url || product.primary_image,
          hex: v.color_hex
        })
      }
    }
  }

  const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.name || '')
  const [quantity, setQuantity] = useState(1)

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc')

  // Size Guide Modal
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  // Reviews
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newName, setNewName] = useState('')
  const [newComment, setNewComment] = useState('')

  const regular = product.regular_price
  const sale    = product.sale_price || regular
  const discount = product.discount_percent || (product.sale_price ? Math.round(((regular - sale) / regular) * 100) : 25)
  const isWishlisted = isInWishlist(product.id)

  const activeVariant: ProductVariant = {
    id: `var-${selectedSize}-${selectedColor}`,
    product_id: product.id,
    size: selectedSize,
    color: selectedColor,
    sku: `${product.sku}-${selectedSize}`,
    price: sale,
    stock_quantity: 3
  }

  const handleAddToCart = () => {
    addItem(product, activeVariant, quantity)
  }

  const handleBuyNow = () => {
    addItem(product, activeVariant, quantity)
    router.push('/checkout')
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newComment.trim()) return
    const created = await submitReview({
      productId: product.id,
      name: newName,
      rating: newRating,
      title: 'Comfortable Fit',
      comment: newComment
    })
    setReviewsList([created, ...reviewsList])
    setIsReviewModalOpen(false)
    setNewName('')
    setNewComment('')
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      
      {/* ── Mobile Top Back Bar (Screen 3 Reference) ── */}
      <div className="flex lg:hidden items-center justify-between py-2 border-b border-border">
        <button
          onClick={() => router.back()}
          className="p-1 text-charcoal hover:text-wine flex items-center gap-1 text-xs font-semibold"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <span className="font-serif text-sm font-semibold text-charcoal truncate max-w-[180px]">
          {product.name}
        </span>

        <button
          onClick={() => toggleWishlist(product)}
          className="p-1 text-charcoal hover:text-wine"
        >
          <Heart size={20} fill={isWishlisted ? '#7b1f35' : 'none'} className={isWishlisted ? 'text-wine' : ''} />
        </button>
      </div>

      {/* ── Main Two Column Product Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ── Left Column: Imagery & Thumbnails ── */}
        <div className="lg:col-span-6 space-y-3">
          
          {/* Main Large Image Container */}
          <div className="relative aspect-[3/4] bg-[#f5efe6] rounded-3xl overflow-hidden shadow-lg border border-border">
            <img
              src={images[activeImageIndex]?.image_url || product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />

            {/* Badges in Top Left */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="bg-amber-400 text-charcoal text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded shadow-xs">
                NEW
              </span>
            </div>

            {/* Image Counter Badge (1/6 in Bottom Right) */}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
              {activeImageIndex + 1}/{images.length}
            </div>

            {/* Wishlist button on desktop */}
            <button
              onClick={() => toggleWishlist(product)}
              className="hidden lg:flex absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-charcoal hover:text-wine shadow-md transition-all"
              aria-label="Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? '#7b1f35' : 'none'} className={isWishlisted ? 'text-wine' : ''} />
            </button>
          </div>

          {/* Thumbnail Strip (Exact Reference) */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-gold shadow-md scale-105' : 'border-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Column: Details, Selectors, Highlights & Actions ── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Title & Reviews */}
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal leading-tight">
              {product.name}
            </h1>

            {/* Star Rating Strip */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="none" />
                ))}
              </div>
              <span className="text-xs text-mid font-medium">({product.review_count || 128} Reviews)</span>
            </div>
          </div>

          {/* Price & Taxes */}
          <div className="space-y-1 py-2 border-y border-border/80">
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-3xl font-bold text-wine">
                ₹{sale.toLocaleString('en-IN')}
              </span>
              {regular > sale && (
                <span className="text-sm line-through text-mid font-medium">
                  ₹{regular.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="text-[11px] text-mid">Inclusive of all taxes</p>
          </div>

          {/* ── Color Swatches — Only rendered when admin has added colors ── */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                <span>Color: <strong className="text-wine">{selectedColor}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                {colors.map(col => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(col.name)
                      if (col.img) {
                        const imgIdx = images.findIndex(img => img.image_url === col.img)
                        if (imgIdx !== -1) setActiveImageIndex(imgIdx)
                      }
                    }}
                    title={col.name}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                      selectedColor === col.name ? 'border-wine scale-110 shadow-md ring-2 ring-wine/30' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    {col.img && !col.img.includes('placeholder') ? (
                      <img src={col.img} alt={col.name} className="w-full h-full object-cover rounded-full" />
                    ) : col.hex ? (
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: col.hex }} />
                    ) : (
                      <div className="w-full h-full rounded-full bg-beige flex items-center justify-center text-[10px] font-bold text-charcoal">
                        {col.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Size Selector & Size Guide (Exact Reference) ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal">
                Size: <strong className="text-wine">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-gold-dark hover:underline font-semibold flex items-center gap-1"
              >
                <Ruler size={13} /> Size Guide
              </button>
            </div>

            {/* Size Pills */}
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => {
                const isSelected = selectedSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs font-semibold px-4 py-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#141414] text-cream border-[#141414] shadow-sm font-bold'
                        : 'bg-white text-charcoal border-border hover:border-gold hover:bg-beige'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>

            {/* Stock Warning (Only 3 left in stock) */}
            <p className="text-xs text-emerald-700 font-semibold pt-1">
              Only 3 left in stock
            </p>
          </div>

          {/* ── Product Highlights (Exact Reference) ── */}
          <div className="p-4 bg-white rounded-2xl border border-border space-y-2.5">
            <h4 className="font-serif text-sm font-bold text-charcoal uppercase tracking-wider">
              Product Highlights
            </h4>
            <ul className="space-y-1.5 text-xs text-mid">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                <span>Premium quality breathable rayon fabric</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                <span>Comfort tailored fit for all-day wear</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                <span>Elegant floral print & modest flare</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                <span>Perfect for casual outings & festive wear</span>
              </li>
            </ul>
          </div>

          {/* ── Offer Box (Exact Reference) ── */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs">
            <Tag size={16} className="text-amber-800 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block">Special Offer</span>
              <span className="text-amber-800">Get 10% off on prepaid orders with code <strong>TOTS10</strong></span>
            </div>
          </div>

          {/* ── Quantity Stepper & Desktop CTAs ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-charcoal">Quantity</span>
              <div className="flex items-center border border-border bg-white rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-mid hover:text-charcoal font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-charcoal">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-mid hover:text-charcoal font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 bg-wine text-white text-xs uppercase font-bold tracking-widest rounded-xl hover:bg-wine-dark transition-all shadow-md text-center"
              >
                BUY NOW
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-transparent border-2 border-charcoal text-charcoal text-xs uppercase font-bold tracking-widest rounded-xl hover:bg-charcoal hover:text-white transition-all text-center flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                <span>ADD TO CART</span>
              </button>
            </div>
          </div>

          {/* ── Value Props Strip (COD, Returns, Safe) ── */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-border text-center text-xs">
            <div className="space-y-0.5">
              <CreditCard size={16} className="text-gold mx-auto" />
              <span className="font-bold text-charcoal block text-[11px]">COD Available</span>
            </div>
            <div className="space-y-0.5">
              <RotateCcw size={16} className="text-gold mx-auto" />
              <span className="font-bold text-charcoal block text-[11px]">Easy 7 Days Returns</span>
            </div>
            <div className="space-y-0.5">
              <ShieldCheck size={16} className="text-gold mx-auto" />
              <span className="font-bold text-charcoal block text-[11px]">100% Safe Payment</span>
            </div>
          </div>

          {/* ── Accordion Sections ── */}
          <div className="divide-y divide-border border-b border-border text-xs">
            
            {/* Description */}
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-charcoal uppercase tracking-wider"
              >
                <span>PRODUCT DESCRIPTION</span>
                {openAccordion === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'desc' && (
                <div className="pb-4 text-mid leading-relaxed space-y-2">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'ship' ? null : 'ship')}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-charcoal uppercase tracking-wider"
              >
                <span>SHIPPING & RETURNS</span>
                {openAccordion === 'ship' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'ship' && (
                <div className="pb-4 text-mid leading-relaxed space-y-1.5">
                  <p>• Standard domestic delivery within 3–5 business days.</p>
                  <p>• Flat rate pan-India shipping with real-time tracking.</p>
                  <p>• Unedited opening video mandatory for any damage or return claims.</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'rev' ? null : 'rev')}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-charcoal uppercase tracking-wider"
              >
                <span>REVIEWS ({reviewsList.length})</span>
                {openAccordion === 'rev' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'rev' && (
                <div className="pb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-charcoal">Verified Customer Ratings</span>
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs font-bold text-wine hover:underline"
                    >
                      + Write a Review
                    </button>
                  </div>
                  <div className="space-y-2">
                    {reviewsList.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-3 bg-white rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-charcoal">{r.customer_name}</span>
                          <div className="flex text-amber-500">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} size={10} fill="currentColor" stroke="none" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-mid mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>



      {/* ── Size Guide Modal ── */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-panel space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-serif text-xl font-bold text-charcoal">Size Chart (XS to 7XL)</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-mid font-bold text-lg">×</button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-beige text-charcoal">
                    <th className="p-2">Size</th>
                    <th className="p-2">Bust</th>
                    <th className="p-2">Waist</th>
                    <th className="p-2">Hip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-2 font-bold">XS</td><td className="p-2">32&quot;</td><td className="p-2">26&quot;</td><td className="p-2">36&quot;</td></tr>
                  <tr><td className="p-2 font-bold">S</td><td className="p-2">34&quot;</td><td className="p-2">28&quot;</td><td className="p-2">38&quot;</td></tr>
                  <tr><td className="p-2 font-bold">M</td><td className="p-2">36&quot;</td><td className="p-2">30&quot;</td><td className="p-2">40&quot;</td></tr>
                  <tr><td className="p-2 font-bold">L</td><td className="p-2">38&quot;</td><td className="p-2">32&quot;</td><td className="p-2">42&quot;</td></tr>
                  <tr><td className="p-2 font-bold">XL</td><td className="p-2">40&quot;</td><td className="p-2">34&quot;</td><td className="p-2">44&quot;</td></tr>
                  <tr><td className="p-2 font-bold">2XL</td><td className="p-2">42&quot;</td><td className="p-2">36&quot;</td><td className="p-2">46&quot;</td></tr>
                  <tr><td className="p-2 font-bold text-wine">3XL</td><td className="p-2 font-bold text-wine">46&quot;</td><td className="p-2 font-bold text-wine">40&quot;</td><td className="p-2 font-bold text-wine">50&quot;</td></tr>
                  <tr><td className="p-2 font-bold">4XL</td><td className="p-2">50&quot;</td><td className="p-2">44&quot;</td><td className="p-2">54&quot;</td></tr>
                  <tr><td className="p-2 font-bold">5XL</td><td className="p-2">54&quot;</td><td className="p-2">48&quot;</td><td className="p-2">58&quot;</td></tr>
                  <tr><td className="p-2 font-bold">6XL</td><td className="p-2">58&quot;</td><td className="p-2">52&quot;</td><td className="p-2">62&quot;</td></tr>
                  <tr><td className="p-2 font-bold">7XL</td><td className="p-2">62&quot;</td><td className="p-2">56&quot;</td><td className="p-2">66&quot;</td></tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 bg-charcoal text-cream text-xs font-semibold rounded-lg"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}

      {/* ── Review Submission Modal ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-panel space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-serif text-xl font-bold text-charcoal">Write a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-mid font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Rating</label>
                <div className="flex gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewRating(num)}
                      className="p-1"
                    >
                      <Star size={20} fill={num <= newRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2.5 rounded-lg border border-border bg-[#faf7f2]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share details of fit, comfort, and fabric quality..."
                  className="w-full p-2.5 rounded-lg border border-border bg-[#faf7f2]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-wine text-white text-xs uppercase font-bold tracking-widest rounded-lg"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProductDetailClient

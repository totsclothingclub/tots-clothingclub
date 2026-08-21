'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProductById, saveProduct, getCategories } from '@/lib/supabase/data-service'
import { Category, Product, ProductImage } from '@/lib/types'
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  Star,
  Sparkles,
  Tag,
  Eye,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  UploadCloud
} from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'

const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL']

function ProductEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')
  const duplicateId = searchParams.get('duplicate')

  const [categories, setCategories] = useState<Category[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(['fashion', 'plus-size', 'new-arrival'])
  const [customAttributes, setCustomAttributes] = useState<{ name: string; value: string }[]>([
    { name: 'Fabric', value: 'Rayon Chiffon' },
    { name: 'Occasion', value: 'Casual & Festive' }
  ])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'media' | 'attributes' | 'seo'>('general')

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: '',
    brand: 'TOTS',
    sku: `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    regular_price: 799,
    sale_price: 599,
    discount_percent: 25,
    status: 'published',
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    is_sale: true,
    is_plus_size: true,
    primary_image: '/images/placeholder.jpg',
    available_sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    getCategories().then(setCategories)

    const targetId = productId || duplicateId
    if (targetId) {
      getProductById(targetId).then(existing => {
        if (existing) {
          if (duplicateId) {
            setFormData({
              ...existing,
              id: undefined,
              name: `${existing.name} (Copy)`,
              slug: `${existing.slug}-copy-${Math.floor(Math.random() * 1000)}`,
              sku: `TOTS-SKU-${Math.floor(1000 + Math.random() * 9000)}`
            })
          } else {
            setFormData(existing)
          }

          if (existing.images && existing.images.length > 0) {
            setImageUrls(existing.images.map(img => img.image_url))
          } else if (existing.primary_image) {
            setImageUrls([existing.primary_image])
          }
        }
      })
    }
  }, [productId, duplicateId])

  // Auto calculate discount percentage when prices change
  const handlePriceChange = (regular: number, sale?: number) => {
    let discount = 0
    if (sale && regular > 0 && sale < regular) {
      discount = Math.round(((regular - sale) / regular) * 100)
    }
    setFormData(prev => ({
      ...prev,
      regular_price: regular,
      sale_price: sale,
      discount_percent: discount
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => {
        const next = { ...prev, [name]: value }
        // Auto slug if creating
        if (name === 'name' && !productId) {
          next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }
        return next
      })
    }
  }

  // Toggle size in array
  const toggleSize = (size: string) => {
    setFormData(prev => {
      const current = prev.available_sizes || []
      if (current.includes(size)) {
        return { ...prev, available_sizes: current.filter(s => s !== size) }
      } else {
        return { ...prev, available_sizes: [...current, size] }
      }
    })
  }

  // Tag management
  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(/,/g, '')
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t))
  }

  // Custom attributes management
  const addAttribute = () => {
    setCustomAttributes([...customAttributes, { name: 'Attribute', value: 'Value' }])
  }

  const updateAttribute = (index: number, field: 'name' | 'value', val: string) => {
    const next = [...customAttributes]
    next[index][field] = val
    setCustomAttributes(next)
  }

  const removeAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index))
  }

  // Media management
  const addImage = () => {
    if (newImageUrl.trim()) {
      const updated = [...imageUrls, newImageUrl.trim()]
      setImageUrls(updated)
      if (!formData.primary_image) {
        setFormData(prev => ({ ...prev, primary_image: newImageUrl.trim() }))
      }
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updated)
    if (formData.primary_image === imageUrls[index]) {
      setFormData(prev => ({ ...prev, primary_image: updated[0] || '' }))
    }
  }

  const setPrimary = (url: string) => {
    setFormData(prev => ({ ...prev, primary_image: url }))
  }

  const handleSave = async (status: 'published' | 'draft' = 'published') => {
    if (!formData.name) return alert('Product Title is required.')
    if (!formData.regular_price) return alert('Regular Price is required.')

    setSaving(true)
    try {
      const imagesPayload: ProductImage[] = imageUrls.map((url, i) => ({
        id: `img-${Date.now()}-${i}`,
        product_id: formData.id || '',
        image_url: url,
        is_primary: url === formData.primary_image || (i === 0 && !formData.primary_image),
        display_order: i + 1
      }))

      const payload = {
        ...formData,
        status,
        images: imagesPayload,
        primary_image: formData.primary_image || imageUrls[0] || '/images/placeholder.jpg'
      }

      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      await saveProduct(payload)

      router.push('/admin/products')
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      
      {/* ── Editor Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="p-2 bg-white rounded-lg border border-border hover:bg-beige transition-colors text-charcoal"
            title="Back to products"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-charcoal">
              {productId ? 'Edit Product' : duplicateId ? 'Duplicate Product' : 'Create New Product'}
            </h1>
            <p className="text-xs text-mid">Configure style details, size inclusive matrix (XS-7XL), and high-res imagery.</p>
          </div>
        </div>

        {/* Save CTA Row */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 bg-white border border-border text-charcoal text-xs font-semibold rounded-lg hover:bg-beige transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 rounded-lg hover:bg-wine transition-colors shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'general', label: '1. Basic Info' },
          { key: 'pricing', label: '2. Pricing & Inventory' },
          { key: 'media', label: '3. Media Gallery' },
          { key: 'attributes', label: '4. Sizes & Attributes' },
          { key: 'seo', label: '5. SEO & Visibility' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-charcoal border-t border-x border-border shadow-xs'
                : 'text-mid hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: General Info ── */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-5">
          <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-2">
            General Information
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-charcoal">
                Product Title <span className="text-wine">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="e.g. Floral Printed Maxi Dress with Flared Silhouette"
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleInputChange}
                  placeholder="floral-printed-maxi-dress"
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-charcoal">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-charcoal">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || 'TOTS'}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-charcoal">Short Description (Summary)</label>
              <textarea
                name="short_description"
                rows={2}
                value={formData.short_description || ''}
                onChange={handleInputChange}
                placeholder="Brief highlighting bullet points, cut, fabric feel, or fit..."
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-charcoal">Full Description (Story & Details)</label>
              <textarea
                name="description"
                rows={5}
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Comprehensive editorial description, styling advice, model sizing, and fabric care..."
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Pricing & Inventory ── */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-5">
          <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-2">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-charcoal">
                Regular MRP (₹) <span className="text-wine">*</span>
              </label>
              <input
                type="number"
                value={formData.regular_price || ''}
                onChange={e => handlePriceChange(Number(e.target.value), formData.sale_price)}
                placeholder="799"
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-charcoal">Sale / Special Price (₹)</label>
              <input
                type="number"
                value={formData.sale_price || ''}
                onChange={e => handlePriceChange(formData.regular_price || 0, e.target.value ? Number(e.target.value) : undefined)}
                placeholder="599"
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-charcoal">Calculated Discount</label>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center justify-between">
                <span>{formData.discount_percent || 0}% OFF</span>
                <span className="text-[10px] font-normal text-emerald-700">Auto-computed</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#faf7f2] rounded-lg border border-border space-y-2 text-xs">
            <span className="font-semibold text-charcoal block">Tax & Invoicing</span>
            <p className="text-mid text-[11px]">
              Prices are inclusive of standard 12% GST apparel tax.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab 3: Media Gallery ── */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-charcoal">Product Imagery (Cloudinary & Supabase)</h3>
              <p className="text-xs text-mid">High-resolution catalog assets are automatically optimized and served via Cloudinary CDN.</p>
            </div>
            <span className="text-xs font-semibold bg-beige px-2.5 py-1 rounded-md text-charcoal">{imageUrls.length} images loaded</span>
          </div>

          {/* Cloudinary Drag & Drop Multi-file Uploader */}
          <CloudinaryUploader
            folder="products"
            label="Upload Product Images from Computer"
            acceptMultiple={true}
            aspectRatioLabel="3:4 Portrait Ratio Recommended"
            onUploadSuccess={(url) => {
              setImageUrls(prev => {
                const next = [...prev, url]
                if (!formData.primary_image) {
                  setFormData(f => ({ ...f, primary_image: url }))
                }
                return next
              })
            }}
          />

          {/* Alternative URL adder input */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <label className="text-[11px] font-semibold text-mid">Or paste direct image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Paste high-res image URL (Unsplash, Cloudinary, etc.)..."
                className="flex-1 text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2.5 bg-charcoal text-cream text-xs font-semibold rounded-lg hover:bg-wine transition-colors"
              >
                + Add URL
              </button>
            </div>
          </div>

          {/* Image Previews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {imageUrls.map((url, index) => {
              const isPrimary = url === formData.primary_image
              return (
                <div
                  key={index}
                  className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    isPrimary ? 'border-gold shadow-md' : 'border-border'
                  }`}
                >
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover object-top" />
                  
                  {isPrimary && (
                    <div className="absolute top-2 left-2 bg-gold text-charcoal text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                      Primary
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-white">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(url)}
                        className="text-[10px] bg-white/20 hover:bg-white hover:text-charcoal px-2.5 py-1 rounded transition-colors"
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-[10px] bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab 4: Sizes & Attributes ── */}
      {activeTab === 'attributes' && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-6">
          
          {/* Size matrix */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-2">
              Size Inclusive Availability (XS to 7XL)
            </h3>
            <p className="text-xs text-mid">Select all size variants supported for this product:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {allSizes.map(size => {
                const isSelected = (formData.available_sizes || []).includes(size)
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-charcoal text-cream border-charcoal shadow-xs'
                        : 'bg-white text-mid border-border hover:border-gold'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-serif text-lg font-semibold text-charcoal">Tags & Keywords</h3>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#faf7f2] border border-border px-2.5 py-1 rounded-md text-charcoal"
                >
                  <Tag size={11} className="text-gold" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-mid hover:text-wine ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Type tag & press Enter..."
                className="text-xs p-1.5 border-b border-border outline-none focus:border-gold bg-transparent"
              />
            </div>
          </div>

          {/* Custom Attributes */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-charcoal">Custom Attributes</h3>
              <button
                type="button"
                onClick={addAttribute}
                className="text-xs font-semibold text-charcoal hover:text-wine flex items-center gap-1"
              >
                <Plus size={13} /> Add Attribute
              </button>
            </div>

            <div className="space-y-2">
              {customAttributes.map((attr, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={e => updateAttribute(idx, 'name', e.target.value)}
                    placeholder="e.g. Fabric"
                    className="w-1/3 text-xs p-2 rounded-lg border border-border bg-[#faf7f2]"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={e => updateAttribute(idx, 'value', e.target.value)}
                    placeholder="e.g. 100% Rayon Chiffon"
                    className="flex-1 text-xs p-2 rounded-lg border border-border bg-[#faf7f2]"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(idx)}
                    className="p-2 text-rose-600 hover:text-rose-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Tab 5: SEO & Visibility ── */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-2">
            Visibility Flags & Search Engine Optimization
          </h3>

          {/* Visibility switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="flex items-center gap-3 p-3 bg-[#faf7f2] rounded-lg border border-border cursor-pointer">
              <input
                type="checkbox"
                name="is_new_arrival"
                checked={formData.is_new_arrival ?? false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-charcoal"
              />
              <div>
                <span className="font-semibold text-charcoal block">New Arrival</span>
                <span className="text-mid text-[11px]">Display badge in product grids</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#faf7f2] rounded-lg border border-border cursor-pointer">
              <input
                type="checkbox"
                name="is_best_seller"
                checked={formData.is_best_seller ?? false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-charcoal"
              />
              <div>
                <span className="font-semibold text-charcoal block">Best Seller</span>
                <span className="text-mid text-[11px]">Show in Best Seller homepage carousel</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#faf7f2] rounded-lg border border-border cursor-pointer">
              <input
                type="checkbox"
                name="is_plus_size"
                checked={formData.is_plus_size ?? false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-charcoal"
              />
              <div>
                <span className="font-semibold text-charcoal block">Plus Size Matrix</span>
                <span className="text-mid text-[11px]">Enable sizes 2XL to 7XL customization</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#faf7f2] rounded-lg border border-border cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured ?? false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-charcoal"
              />
              <div>
                <span className="font-semibold text-charcoal block">Featured Product</span>
                <span className="text-mid text-[11px]">Highlight on collection pages</span>
              </div>
            </label>
          </div>

          {/* SEO fields */}
          <div className="space-y-4 pt-4 border-t border-border text-xs">
            <div>
              <label className="font-semibold block mb-1 text-charcoal">Meta Title (SEO)</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title || ''}
                onChange={handleInputChange}
                placeholder={`${formData.name || 'Product Title'} | TOTS Studio`}
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-charcoal">Meta Description (SEO)</label>
              <textarea
                name="meta_description"
                rows={3}
                value={formData.meta_description || ''}
                onChange={handleInputChange}
                placeholder="Shop the elegant collection at TOTS. Available in sizes XS to 7XL. Fast shipping across India."
                className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Google Search Preview */}
            <div className="p-4 bg-[#faf7f2] rounded-lg border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-mid tracking-wider block">Google Search Preview</span>
              <p className="text-blue-700 text-sm font-medium hover:underline cursor-pointer">
                {formData.meta_title || formData.name || 'Product Title'} | TOTS Fashion
              </p>
              <p className="text-emerald-700 text-[11px]">
                https://totsfashion.in/products/{formData.slug || 'product-slug'}
              </p>
              <p className="text-mid text-xs line-clamp-2">
                {formData.meta_description || formData.short_description || 'Shop inclusive fashion apparel designed for every silhouette.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Save Bar ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-xs font-semibold text-mid hover:text-charcoal"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 bg-white border border-border text-charcoal text-xs font-semibold rounded-lg hover:bg-beige transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 rounded-lg hover:bg-wine transition-colors shadow-sm"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

    </div>
  )
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-mid">Loading product editor...</div>}>
      <ProductEditorContent />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProductById, saveProduct, getCategories } from '@/lib/supabase/data-service'
import { Category, Product, ProductImage, ProductVariant } from '@/lib/types'
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
  UploadCloud,
  Loader2,
  ChevronDown,
  X
} from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'
import { useToast } from '@/components/ui/Toast'

const allSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL']

function ProductEditorContent() {
  const router = useRouter()
  const { toast } = useToast()
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
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [colorVariants, setColorVariants] = useState<{ id?: string; color: string; color_hex?: string; image_url?: string }[]>([])
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

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
    stock_quantity: 25,
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

  // Close category dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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

          const cats = (existing as any).category_ids || (existing.category_id ? [existing.category_id] : [])
          setSelectedCategoryIds(cats)

          if (existing.images && existing.images.length > 0) {
            setImageUrls(existing.images.map(img => img.image_url))
          } else if (existing.primary_image) {
            setImageUrls([existing.primary_image])
          }

          if (existing.variants && existing.variants.length > 0) {
            const seen = new Set<string>()
            const parsedCols: { id?: string; color: string; color_hex?: string; image_url?: string }[] = []
            for (const v of existing.variants) {
              if (v.color && v.color !== 'Standard' && !seen.has(v.color.toLowerCase())) {
                seen.add(v.color.toLowerCase())
                parsedCols.push({
                  id: v.id,
                  color: v.color,
                  color_hex: v.color_hex || '#7a1e3c',
                  image_url: v.image_url || ''
                })
              }
            }
            setColorVariants(parsedCols)
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

  // Create category inline from product editor
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug,
          is_active: true,
          display_order: categories.length + 1
        })
      })
      const data = await res.json()
      if (data.id) {
        const updatedCats = await getCategories()
        setCategories(updatedCats)
        setSelectedCategoryIds(prev => [...prev, data.id])
        setFormData(prev => ({ ...prev, category_id: data.id }))
        setNewCategoryName('')
        setShowNewCategoryInput(false)
      }
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setCreatingCategory(false)
    }
  }

  // Multi-category toggle helper
  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev => {
      const isChecked = prev.includes(catId)
      const next = isChecked ? prev.filter(id => id !== catId) : [...prev, catId]

      const hasPlusSize = next.some(id => {
        const c = categories.find(cat => cat.id === id)
        return c && (c.nav_location === 'plus_size_dropdown' || c.parent_id === 'cat-plus-size' || c.slug === 'plus-size')
      })

      setFormData(f => ({
        ...f,
        category_id: next[0] || '',
        category_ids: next as any,
        is_plus_size: hasPlusSize ? true : f.is_plus_size
      }))

      return next
    })
  }

  // Direct upload for Color Variant images
  const handleColorImageUpload = async (file: File, idx: number) => {
    setUploadingColorIdx(idx)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'products')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (data.url) {
        const next = [...colorVariants]
        next[idx].image_url = data.url
        setColorVariants(next)
        toast.success('Variant image uploaded', 'Image Uploaded')
      } else {
        toast.error(data.error || 'Upload failed', 'Upload Error')
      }
    } catch (e: any) {
      toast.error(e.message || 'Image upload failed', 'Upload Error')
    } finally {
      setUploadingColorIdx(null)
    }
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
    if (!formData.name?.trim()) return toast.error('Product Title is required.', 'Missing Title')
    if (!formData.regular_price) return toast.error('Regular Price is required.', 'Missing Price')

    setSaving(true)
    try {
      const imagesPayload: ProductImage[] = imageUrls.map((url, i) => ({
        id: `img-${Date.now()}-${i}`,
        product_id: formData.id || '',
        image_url: url,
        is_primary: url === formData.primary_image || (i === 0 && !formData.primary_image),
        display_order: i + 1
      }))

      const currentStock = typeof formData.stock_quantity === 'number' ? Number(formData.stock_quantity) : 25

      const variantsPayload: ProductVariant[] = colorVariants
        .filter(c => c.color.trim())
        .map((c, i) => ({
          id: c.id || `var-${Date.now()}-${i}`,
          product_id: formData.id || '',
          color: c.color.trim(),
          color_hex: c.color_hex || '#1a1a1a',
          size: 'Standard',
          sku: `${formData.sku || 'SKU'}-${c.color.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          price: Number(formData.sale_price || formData.regular_price || 799),
          stock_quantity: currentStock,
          image_url: c.image_url || ''
        }))

      const payload = {
        ...formData,
        stock_quantity: currentStock,
        category_id: selectedCategoryIds[0] || formData.category_id || null,
        category_ids: selectedCategoryIds,
        status,
        images: imagesPayload,
        variants: variantsPayload,
        primary_image: formData.primary_image || imageUrls[0] || '/images/placeholder.jpg'
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown server error' }))
        throw new Error(errData.error || `Server responded with status ${res.status}`)
      }

      toast.success(
        status === 'published' ? 'Product published to store!' : 'Product saved as draft.',
        'Product Saved'
      )
      router.push('/admin/products')
    } catch (err: any) {
      toast.error(`Error saving product: ${err.message}`, 'Save Failed')
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

          {/* ── Primary Image Preview (read-only here, upload in Media Gallery tab) ── */}
          <div className="flex gap-4 items-center p-3 bg-beige rounded-xl border border-border">
            <div className="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border border-border bg-white flex items-center justify-center">
              {(formData.primary_image && formData.primary_image !== '/images/placeholder.jpg') || imageUrls[0] ? (
                <img
                  src={(formData.primary_image && formData.primary_image !== '/images/placeholder.jpg') ? formData.primary_image : imageUrls[0]}
                  alt="Primary"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <ImageIcon size={20} className="text-mid" />
              )}
            </div>
            <div className="text-xs">
              {(formData.primary_image && formData.primary_image !== '/images/placeholder.jpg') || imageUrls[0] ? (
                <p className="text-emerald-700 font-semibold">✓ Product image uploaded</p>
              ) : (
                <p className="font-semibold text-charcoal">No image uploaded yet</p>
              )}
              <p className="text-mid mt-0.5">Go to <strong>Tab 3: Media Gallery</strong> to upload product images.</p>
            </div>
          </div>

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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-charcoal">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(prev => !prev)}
                    className="text-[11px] text-wine hover:underline font-semibold flex items-center gap-1"
                  >
                    + Add New Category
                  </button>
                </div>

                {showNewCategoryInput && (
                  <div className="p-3 bg-[#f5efe6] border border-[#e8dfd2] rounded-lg space-y-2 mb-2">
                    <label className="text-[11px] font-bold text-charcoal block">
                      New Category Name (e.g. Salwar, Kurtas, Co-ords)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Salwar"
                        className="flex-1 text-xs p-2 rounded-md border border-border bg-white focus:outline-none focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="px-3 py-2 bg-charcoal text-cream text-xs font-semibold rounded-md hover:bg-wine transition-colors disabled:opacity-50"
                      >
                        {creatingCategory ? 'Adding...' : 'Add & Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNewCategoryInput(false); setNewCategoryName('') }}
                        className="px-2 py-2 text-mid hover:text-charcoal text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative" ref={categoryDropdownRef}>
                  {/* Selector button / Selected Tags display */}
                  <div
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full min-h-[44px] p-2 rounded-lg border border-border bg-white cursor-pointer flex flex-wrap items-center justify-between gap-1.5 focus:border-gold hover:border-gold/60 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {selectedCategoryIds.length === 0 ? (
                        <span className="text-mid text-xs py-1 px-1">Select one or more categories...</span>
                      ) : (
                        selectedCategoryIds.map(id => {
                          const cat = categories.find(c => c.id === id)
                          if (!cat) return null
                          const isPlus = cat.nav_location === 'plus_size_dropdown' || cat.parent_id === 'cat-plus-size'
                          return (
                            <span
                              key={id}
                              className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                                isPlus
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : 'bg-amber-50 border-amber-200 text-amber-900'
                              }`}
                            >
                              <span>{isPlus ? 'Plus Size › ' : 'Shop › '}{cat.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleCategory(id)
                                }}
                                className="hover:text-rose-600 p-0.5"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          )
                        })
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-mid transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown with Checkbox Multi-Select */}
                  {categoryDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-border shadow-xl p-3 max-h-72 overflow-y-auto space-y-3">
                      
                      {/* Plus Size Categories */}
                      {categories.some(c => c.nav_location === 'plus_size_dropdown' || c.parent_id === 'cat-plus-size') && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50/80 px-2 py-1 rounded">
                            PLUS SIZE COLLECTION
                          </div>
                          <div className="space-y-0.5 pl-1">
                            {categories
                              .filter(c => c.nav_location === 'plus_size_dropdown' || c.parent_id === 'cat-plus-size')
                              .map(c => {
                                const isChecked = selectedCategoryIds.includes(c.id)
                                return (
                                  <label
                                    key={c.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-beige/60 cursor-pointer text-xs font-medium text-charcoal"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleCategory(c.id)}
                                      className="rounded border-border text-charcoal focus:ring-gold"
                                    />
                                    <span>{c.name}</span>
                                  </label>
                                )
                              })}
                          </div>
                        </div>
                      )}

                      {/* Shop Categories */}
                      {categories.some(c => c.nav_location === 'shop_dropdown' || c.parent_id === 'cat-shop') && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50/80 px-2 py-1 rounded">
                            SHOP CATEGORIES
                          </div>
                          <div className="space-y-0.5 pl-1">
                            {categories
                              .filter(c => c.nav_location === 'shop_dropdown' || c.parent_id === 'cat-shop')
                              .map(c => {
                                const isChecked = selectedCategoryIds.includes(c.id)
                                return (
                                  <label
                                    key={c.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-beige/60 cursor-pointer text-xs font-medium text-charcoal"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleCategory(c.id)}
                                      className="rounded border-border text-charcoal focus:ring-gold"
                                    />
                                    <span>{c.name}</span>
                                  </label>
                                )
                              })}
                          </div>
                        </div>
                      )}

                      {/* Top Level / Other Categories */}
                      {categories.some(c => c.nav_location === 'navbar' || c.nav_location === 'none') && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50/80 px-2 py-1 rounded">
                            MAIN & OTHER CATEGORIES
                          </div>
                          <div className="space-y-0.5 pl-1">
                            {categories
                              .filter(c => c.nav_location === 'navbar' || c.nav_location === 'none')
                              .map(c => {
                                const isChecked = selectedCategoryIds.includes(c.id)
                                return (
                                  <label
                                    key={c.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-beige/60 cursor-pointer text-xs font-medium text-charcoal"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleCategory(c.id)}
                                      className="rounded border-border text-charcoal focus:ring-gold"
                                    />
                                    <span>{c.name}</span>
                                  </label>
                                )
                              })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
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
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-2">
              Pricing & Inventory Management
            </h3>
            <p className="text-xs text-mid mt-1">Set product MRP, promotional discount pricing, and live inventory stock availability.</p>
          </div>

          {/* Pricing Grid */}
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

          {/* Inventory Stock Section */}
          <div className="p-5 bg-[#faf7f2] rounded-xl border border-[#e8dfd2] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-serif text-sm font-bold text-charcoal block">
                  Inventory Stock Quantity (Units in Stock)
                </span>
                <p className="text-[11px] text-mid mt-0.5">
                  How many units of this product are currently available in your warehouse.
                </p>
              </div>

              {/* Dynamic Live Status Badge */}
              {(() => {
                const stock = Number(formData.stock_quantity ?? 0)
                if (stock <= 0) {
                  return (
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Out of Stock (0 units)
                    </span>
                  )
                }
                if (stock <= 5) {
                  return (
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      Low Stock Alert ({stock} units left)
                    </span>
                  )
                }
                return (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    In Stock ({stock} units available)
                  </span>
                )
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">
                  Available Quantity / Total Units <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock_quantity"
                  value={formData.stock_quantity ?? 25}
                  onChange={e => setFormData(prev => ({ ...prev, stock_quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                  placeholder="e.g. 25"
                  className="w-full text-sm font-bold p-3 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-border flex flex-col justify-center space-y-1 text-[11px] text-mid">
                <span className="font-bold text-charcoal">Storefront Behavior:</span>
                <p>• <strong>5 or fewer:</strong> Shows an urgent &ldquo;Only X left in stock - order soon!&rdquo; banner.</p>
                <p>• <strong>0:</strong> Automatically shows &ldquo;Out of Stock&rdquo; and disables Add to Cart.</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-beige/50 rounded-lg border border-border text-xs text-mid flex items-center justify-between">
            <span>Prices are inclusive of standard 12% GST apparel tax.</span>
            <span className="font-semibold text-charcoal">SKU: {formData.sku}</span>
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
                return next
              })
              // Set as primary if no real image yet (placeholder or empty)
              setFormData(f => {
                const noRealImage = !f.primary_image || f.primary_image === '/images/placeholder.jpg' || f.primary_image === ''
                return noRealImage ? { ...f, primary_image: url } : f
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

          {/* ── Color Variants (Color Name & Direct Image Upload) ── */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal">Color Variants</h3>
                <p className="text-xs text-mid">Add optional colors with custom color names, swatch colors, and direct file uploads.</p>
              </div>
              <button
                type="button"
                onClick={() => setColorVariants(prev => [...prev, { color: '', color_hex: '#7a1e3c', image_url: '' }])}
                className="text-xs font-semibold px-3 py-1.5 bg-[#faf7f2] hover:bg-gold/20 text-charcoal border border-border rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> Add Color Variant
              </button>
            </div>

            {colorVariants.length === 0 ? (
              <p className="text-xs text-mid italic bg-[#faf7f2] p-3.5 rounded-xl border border-border">
                No color variants added. The product page will not display color circles unless you add them. Click &quot;Add Color Variant&quot; if this product is available in multiple colors.
              </p>
            ) : (
              <div className="space-y-3">
                {colorVariants.map((col, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 p-3.5 bg-[#faf7f2] border border-border rounded-xl">
                    {/* Color Swatch Picker */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" title="Pick swatch color">
                      <input
                        type="color"
                        value={col.color_hex || '#7a1e3c'}
                        onChange={e => {
                          const next = [...colorVariants]
                          next[idx].color_hex = e.target.value
                          setColorVariants(next)
                        }}
                        className="w-9 h-9 rounded-full border-2 border-border cursor-pointer p-0 bg-transparent"
                      />
                    </div>

                    {/* Color Name Input */}
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        value={col.color}
                        onChange={e => {
                          const next = [...colorVariants]
                          next[idx].color = e.target.value
                          setColorVariants(next)
                        }}
                        placeholder="Color Name (e.g. Wine Maroon, Olive Green)"
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold font-medium"
                      />
                    </div>

                    {/* Direct Image File Uploader & Thumbnail */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white text-charcoal border border-border rounded-lg hover:border-gold hover:bg-beige text-xs font-semibold transition-all shadow-2xs">
                        {uploadingColorIdx === idx ? (
                          <Loader2 size={14} className="animate-spin text-gold" />
                        ) : (
                          <UploadCloud size={14} className="text-gold" />
                        )}
                        <span>{col.image_url ? 'Change Image' : 'Select Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingColorIdx === idx}
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) handleColorImageUpload(f, idx)
                          }}
                        />
                      </label>

                      {/* Thumbnail Preview */}
                      {col.image_url ? (
                        <div className="relative group">
                          <img
                            src={col.image_url}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border-2 border-gold shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...colorVariants]
                              next[idx].image_url = ''
                              setColorVariants(next)
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center hover:bg-rose-700 leading-none shadow-xs"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full border border-border shadow-2xs flex items-center justify-center"
                          style={{ backgroundColor: col.color_hex || '#7a1e3c' }}
                        />
                      )}
                    </div>

                    {/* Delete Color Variant Button */}
                    <button
                      type="button"
                      onClick={() => setColorVariants(colorVariants.filter((_, i) => i !== idx))}
                      className="p-2 text-mid hover:text-wine rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
                      title="Delete this color variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

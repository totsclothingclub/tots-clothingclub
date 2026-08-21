'use client'

import React, { useEffect, useState, useRef } from 'react'
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/supabase/data-service'
import { Category } from '@/lib/types'
import {
  FolderTree,
  PlusCircle,
  Trash2,
  Edit,
  X,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '/images/placeholder.jpg',
    display_order: 1,
    is_active: true
  })
  const [loading, setLoading] = useState(true)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (Array.isArray(data)) setCategories(data)
      else {
        const local = await getAllCategories()
        setCategories(local)
      }
    } catch (e) {
      const local = await getAllCategories()
      setCategories(local)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Upload local file to Cloudinary and set CDN URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'categories')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setUploadPreview(data.url)
        setEditingCategory(prev => ({ ...prev, image_url: data.url }))
      } else {
        alert(data.error || 'Failed to upload image to Cloudinary')
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed. Please verify Cloudinary credentials.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory.name) return
    setLoading(true)
    const payload = {
      ...editingCategory,
      slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsModalOpen(false)
      setUploadPreview(null)
      loadCategories()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? Products in this category will become uncategorized.`)) {
      setLoading(true)
      try {
        await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      } catch (err) {
        console.error(err)
      } finally {
        loadCategories()
      }
    }
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* ── Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Categories</h1>
          <p className="text-xs text-mid mt-1">
            Organize catalog hierarchy, manage display order, and upload category imagery directly to the storefront.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory({
              name: '',
              slug: '',
              description: '',
              image_url: '/images/placeholder.jpg',
              display_order: categories.length + 1,
              is_active: true
            })
            setUploadPreview(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Add Category</span>
        </button>
      </div>

      {/* ── Category Cards Grid ── */}
      <div className="flex flex-wrap gap-4">
        {loading ? (
          <div className="w-full py-12 text-center text-xs text-mid">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="w-full bg-white p-12 rounded-xl border border-border text-center space-y-3">
            <h3 className="font-serif text-lg font-semibold text-charcoal">No Categories Created Yet</h3>
            <p className="text-xs text-mid max-w-sm mx-auto">
              Add your first store category to organize dresses, kurta sets, western wear, or plus size collections.
            </p>
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] min-w-[220px] max-w-[320px]"
            >
              <div className="relative aspect-[4/3] bg-beige overflow-hidden">
                <img
                  src={cat.image_url || '/images/placeholder.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase ${
                      cat.is_active ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-white'
                    }`}
                  >
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif font-semibold text-charcoal text-base">{cat.name}</h3>
                  <p className="font-mono text-[11px] text-mid mt-0.5">/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-mid mt-1.5 line-clamp-2">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-[11px] text-mid font-medium">Order: #{cat.display_order}</span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      target="_blank"
                      className="p-1.5 text-mid hover:text-charcoal rounded"
                      title="View on Store"
                    >
                      <ExternalLink size={14} />
                    </Link>
                    <button
                      onClick={() => {
                        setEditingCategory(cat)
                        setUploadPreview(null)
                        setIsModalOpen(true)
                      }}
                      className="p-1.5 text-mid hover:text-wine rounded"
                      title="Edit Category"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 rounded"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add / Edit Category Modal with URL + Upload from Gallery Options ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl border border-border shadow-panel max-w-lg w-full max-h-[92vh] overflow-y-auto animate-fadeup">
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#faf7f2] sticky top-0 z-10">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                {editingCategory.id ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-mid hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">
                  Category Name <span className="text-wine">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => setEditingCategory(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                  }))}
                  placeholder="e.g. Plus Size, Western Wear, Salwar..."
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-charcoal">URL Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="plus-size"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-charcoal">Description / Subtitle</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. XS to 7XL — Made for every body"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* ── Category Image Source Options (URL or Upload from Gallery) ── */}
              <div className="p-4 bg-[#f8f6f0] rounded-xl border border-border space-y-3">
                <label className="font-semibold block text-charcoal">
                  Category Image Source
                </label>

                {/* Option 1: Paste Image URL */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-mid font-medium mb-1">
                    <LinkIcon size={12} className="text-gold" />
                    <span>Option 1: Image URL</span>
                  </div>
                  <input
                    type="text"
                    value={editingCategory.image_url || ''}
                    onChange={e => {
                      setEditingCategory(prev => ({ ...prev, image_url: e.target.value }))
                      setUploadPreview(null)
                    }}
                    placeholder="https://example.com/category.jpg or /images/..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] uppercase font-bold text-mid">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Option 2: Upload Image to Cloudinary */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-mid font-medium mb-1">
                    <Upload size={12} className="text-gold" />
                    <span>Option 2: Upload to Cloudinary</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-3 px-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      uploading
                        ? 'border-gold bg-gold/5 opacity-80 cursor-wait'
                        : 'border-border hover:border-gold bg-white text-mid hover:text-charcoal'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={18} className="text-gold animate-spin" />
                        <span className="font-semibold text-xs text-charcoal">Uploading to Cloudinary CDN...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-gold" />
                        <span className="font-semibold text-xs text-charcoal">Select Image from Computer</span>
                        <span className="text-[10px] text-mid">PNG, JPG, or WEBP • Uploads directly to Cloudinary</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Preview */}
                {editingCategory.image_url && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-mid uppercase block mb-1.5">Live Image Preview:</span>
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-beige shadow-xs">
                      <img
                        src={editingCategory.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Display Sequence</label>
                  <input
                    type="number"
                    value={editingCategory.display_order || 1}
                    onChange={e => setEditingCategory(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Visibility Status</label>
                  <select
                    value={editingCategory.is_active ? 'true' : 'false'}
                    onChange={e => setEditingCategory(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                  >
                    <option value="true">Active (Visible on Store)</option>
                    <option value="false">Hidden (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-mid hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-charcoal text-cream text-xs font-semibold rounded-lg hover:bg-wine transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

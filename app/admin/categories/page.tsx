'use client'

import React, { useEffect, useState, useRef } from 'react'
import { getAllCategories } from '@/lib/supabase/data-service'
import { Category, NavLocation } from '@/lib/types'
import {
  PlusCircle,
  Trash2,
  Edit,
  X,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  EyeOff,
  FolderTree
} from 'lucide-react'
import Link from 'next/link'
import { useConfirm } from '@/components/ui/ConfirmationModal'
import { useToast } from '@/components/ui/Toast'

type FilterTab = 'all' | 'navbar' | 'shop_dropdown' | 'plus_size_dropdown' | 'none'

export default function AdminCategoriesPage() {
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [loading, setLoading] = useState(true)

  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '/images/placeholder.jpg',
    display_order: 1,
    is_active: true,
    nav_location: 'shop_dropdown',
    is_dropdown: false,
    parent_id: null
  })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
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

  // 1-Click Database Reset to Default Navigation Hierarchy
  const handleResetDefaults = async () => {
    const ok = await confirm({
      title: 'Reset Navigation Categories?',
      message: 'This will reset and seed all store categories to the standard navigation hierarchy (Shop Dropdown, Plus Size, Modest Wear, etc.). Existing custom categories may be overridden.',
      confirmText: 'Reset to Defaults',
      variant: 'warning',
    })
    if (!ok) return

    setResetting(true)
    try {
      await fetch('/api/seed')
      await loadCategories()
      toast.success('Categories reset and seeded to default hierarchy.', 'Hierarchy Reset')
    } catch (err) {
      toast.error('Failed to reset categories.', 'Reset Failed')
      console.error('Reset error:', err)
    } finally {
      setResetting(false)
    }
  }

  // Upload image to Cloudinary
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
        toast.success('Category banner image uploaded successfully.', 'Uploaded')
      } else {
        toast.error(data.error || 'Failed to upload image', 'Upload Failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed.', 'Upload Failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory.name?.trim()) {
      toast.error('Category Name is required.', 'Missing Name')
      return
    }
    setLoading(true)

    const slug = editingCategory.slug?.trim() || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Auto-align parent if shop or plus-size dropdown is chosen
    let parentId = editingCategory.parent_id || null
    const loc = editingCategory.nav_location || 'shop_dropdown'
    
    if (loc === 'shop_dropdown' && !parentId) {
      const shopCat = categories.find(c => c.slug === 'shop')
      if (shopCat) parentId = shopCat.id
    } else if (loc === 'plus_size_dropdown' && !parentId) {
      const plusCat = categories.find(c => c.slug === 'plus-size')
      if (plusCat) parentId = plusCat.id
    } else if (loc === 'navbar') {
      parentId = null
    }

    const payload = {
      ...editingCategory,
      name: editingCategory.name.trim(),
      slug,
      parent_id: parentId,
      nav_location: loc,
      is_dropdown: loc === 'navbar' ? Boolean(editingCategory.is_dropdown) : false
    }

    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success(editingCategory.id ? 'Category updated!' : 'Category created!', 'Success')
    } catch (err) {
      toast.error('Error saving category.', 'Save Failed')
      console.error('Error saving category:', err)
    } finally {
      setIsModalOpen(false)
      setUploadPreview(null)
      loadCategories()
    }
  }

  const handleToggleActive = async (cat: Category) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cat,
          is_active: !cat.is_active
        })
      })
      toast.info(
        cat.is_active ? `"${cat.name}" hidden from navigation` : `"${cat.name}" published to navigation`,
        'Category Updated'
      )
      loadCategories()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this category? Products linked directly to this category will become unassigned.',
      itemName: name,
      confirmText: 'Delete Category',
      variant: 'danger',
    })
    if (!ok) return

    setLoading(true)
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      toast.success(`Category "${name}" deleted.`, 'Category Deleted')
    } catch (err) {
      toast.error('Failed to delete category.', 'Error')
      console.error(err)
    } finally {
      loadCategories()
    }
  }

  const openAddModal = (navLoc: NavLocation = 'shop_dropdown') => {
    let parentId: string | null = null
    if (navLoc === 'shop_dropdown') {
      const shopCat = categories.find(c => c.slug === 'shop')
      if (shopCat) parentId = shopCat.id
    } else if (navLoc === 'plus_size_dropdown') {
      const plusCat = categories.find(c => c.slug === 'plus-size')
      if (plusCat) parentId = plusCat.id
    }

    const filtered = categories.filter(c => (c.nav_location || 'shop_dropdown') === navLoc)
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '/images/placeholder.jpg',
      display_order: filtered.length + 1,
      is_active: true,
      nav_location: navLoc,
      is_dropdown: navLoc === 'navbar',
      parent_id: parentId
    })
    setUploadPreview(null)
    setIsModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setUploadPreview(null)
    setIsModalOpen(true)
  }

  // Filter categories by active tab
  const filteredCategories = categories.filter(cat => {
    if (activeTab === 'all') return true
    return cat.nav_location === activeTab
  })

  // Dynamic counts for tabs
  const navbarCount = categories.filter(c => c.nav_location === 'navbar').length
  const shopCount = categories.filter(c => c.nav_location === 'shop_dropdown').length
  const plusSizeCount = categories.filter(c => c.nav_location === 'plus_size_dropdown').length
  const unlistedCount = categories.filter(c => c.nav_location === 'none').length

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return 'None (Top-Level)'
    const p = categories.find(c => c.id === parentId)
    return p ? p.name : 'None (Top-Level)'
  }

  const getNavLocationBadge = (loc?: NavLocation) => {
    switch (loc) {
      case 'navbar':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Top Navbar</span>
      case 'shop_dropdown':
        return <span className="bg-amber-100 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Shop Dropdown</span>
      case 'plus_size_dropdown':
        return <span className="bg-rose-100 text-rose-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Plus Size Dropdown</span>
      default:
        return <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Unlisted / Catalog</span>
    }
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Categories</h1>
          <p className="text-xs text-mid mt-1">
            Manage navigation placement, parent categories, and storefront catalog hierarchy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 bg-white border border-border text-charcoal hover:bg-beige text-xs font-semibold px-3 py-2.5 rounded-lg transition-colors shadow-2xs"
            title="Reset to default category hierarchy"
          >
            <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => openAddModal(activeTab === 'all' ? 'shop_dropdown' : activeTab)}
            className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* ── Filter / Navigation Tabs with Dynamic Counts ── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-charcoal text-white shadow-xs'
              : 'bg-white text-charcoal border border-border hover:bg-beige/50'
          }`}
        >
          All Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('navbar')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'navbar'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-charcoal border border-border hover:bg-beige/50'
          }`}
        >
          Top Navbar ({navbarCount})
        </button>
        <button
          onClick={() => setActiveTab('shop_dropdown')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'shop_dropdown'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-charcoal border border-border hover:bg-beige/50'
          }`}
        >
          SHOP Dropdown ({shopCount})
        </button>
        <button
          onClick={() => setActiveTab('plus_size_dropdown')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'plus_size_dropdown'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-charcoal border border-border hover:bg-beige/50'
          }`}
        >
          PLUS SIZE Dropdown ({plusSizeCount})
        </button>
        <button
          onClick={() => setActiveTab('none')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'none'
              ? 'bg-gray-700 text-white shadow-xs'
              : 'bg-white text-charcoal border border-border hover:bg-beige/50'
          }`}
        >
          Unlisted ({unlistedCount})
        </button>
      </div>

      {/* ── Clear, Simple Categories Table ── */}
      <div className="bg-white rounded-xl border border-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-mid">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h3 className="font-serif text-lg font-semibold text-charcoal">No Categories in this section</h3>
            <p className="text-xs text-mid max-w-sm mx-auto">
              Click &quot;Add Category&quot; to create a new category in this section.
            </p>
            <button
              onClick={() => openAddModal(activeTab === 'all' ? 'shop_dropdown' : activeTab)}
              className="inline-flex items-center gap-1.5 bg-wine text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <PlusCircle size={14} /> Add Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-border text-[11px] font-bold uppercase tracking-wider text-charcoal/80">
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Parent</th>
                  <th className="py-3.5 px-4">Navigation</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#faf7f2]/50 transition-colors">
                    
                    {/* Category Name & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-beige/60 border border-border flex-shrink-0">
                          <img
                            src={cat.image_url || '/images/placeholder.jpg'}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.src = '/images/placeholder.jpg' }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-charcoal text-sm">{cat.name}</div>
                          <div className="text-[11px] text-mid font-mono">{cat.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Parent Category */}
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      {getParentName(cat.parent_id)}
                    </td>

                    {/* Navigation Placement */}
                    <td className="py-3.5 px-4">
                      {getNavLocationBadge(cat.nav_location)}
                    </td>

                    {/* Display Order */}
                    <td className="py-3.5 px-4 text-center font-medium text-charcoal">
                      #{cat.display_order}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          cat.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {cat.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{cat.is_active ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          target="_blank"
                          className="p-1.5 text-mid hover:text-charcoal rounded hover:bg-beige"
                          title="View on Store"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-mid hover:text-wine rounded hover:bg-beige"
                          title="Edit Category"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Category Modal with Dropdowns for Parent & Navigation ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl border border-border shadow-panel max-w-lg w-full max-h-[92vh] overflow-y-auto animate-fadeup">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#faf7f2] sticky top-0 z-10">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                {editingCategory.id ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-mid hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Category Name */}
              <div>
                <label className="font-semibold block mb-1 text-charcoal">
                  Category Name <span className="text-wine">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => {
                    const val = e.target.value
                    setEditingCategory(prev => ({
                      ...prev,
                      name: val,
                      slug: prev.slug && prev.slug !== '' ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    }))
                  }}
                  placeholder="e.g. Salwar, Modest Wear, Chikankari..."
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold font-medium"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="font-semibold block mb-1 text-charcoal">URL Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="salwar"
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* ── Dropdown Selects for Parent Category & Navigation Location ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#faf7f2] rounded-xl border border-border">
                
                {/* Parent Category SELECT (No manual typing!) */}
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">
                    Parent Category
                  </label>
                  <select
                    value={editingCategory.parent_id || ''}
                    onChange={e => {
                      const pid = e.target.value || null
                      let loc = editingCategory.nav_location
                      if (pid) {
                        const parent = categories.find(c => c.id === pid)
                        if (parent?.slug === 'shop') loc = 'shop_dropdown'
                        if (parent?.slug === 'plus-size') loc = 'plus_size_dropdown'
                      }
                      setEditingCategory(prev => ({
                        ...prev,
                        parent_id: pid,
                        nav_location: loc
                      }))
                    }}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold font-medium"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter(c => c.id !== editingCategory.id && (c.nav_location === 'navbar' || c.is_dropdown || !c.parent_id))
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Navigation Location SELECT (No manual typing!) */}
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">
                    Navigation Location <span className="text-wine">*</span>
                  </label>
                  <select
                    value={editingCategory.nav_location || 'shop_dropdown'}
                    onChange={e => {
                      const loc = e.target.value as NavLocation
                      let parentId = editingCategory.parent_id
                      if (loc === 'shop_dropdown') {
                        const shopCat = categories.find(c => c.slug === 'shop')
                        if (shopCat) parentId = shopCat.id
                      } else if (loc === 'plus_size_dropdown') {
                        const plusCat = categories.find(c => c.slug === 'plus-size')
                        if (plusCat) parentId = plusCat.id
                      } else if (loc === 'navbar') {
                        parentId = null
                      }
                      setEditingCategory(prev => ({
                        ...prev,
                        nav_location: loc,
                        parent_id: parentId,
                        is_dropdown: loc === 'navbar' ? prev.is_dropdown : false
                      }))
                    }}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold font-medium"
                  >
                    <option value="shop_dropdown">SHOP Dropdown</option>
                    <option value="plus_size_dropdown">PLUS SIZE Dropdown</option>
                    <option value="navbar">Top Navbar</option>
                    <option value="none">None / Unlisted</option>
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCategory.display_order || 1}
                    onChange={e => setEditingCategory(prev => ({ ...prev, display_order: Number(e.target.value) || 1 }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold font-medium"
                  />
                </div>

                {/* Visibility Status SELECT */}
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Visibility Status</label>
                  <select
                    value={editingCategory.is_active ? 'active' : 'hidden'}
                    onChange={e => setEditingCategory(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold font-medium"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="hidden">Hidden (Deactivated)</option>
                  </select>
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="font-semibold block mb-1 text-charcoal">Description / Subtitle</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Size-inclusive styles crafted from XS to 7XL."
                  className="w-full text-xs p-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Category Image Source */}
              <div className="p-4 bg-[#faf7f2] rounded-xl border border-border space-y-3">
                <label className="font-semibold block text-charcoal">Category Image</label>

                {/* Option 1: URL */}
                <input
                  type="text"
                  value={editingCategory.image_url || ''}
                  onChange={e => {
                    setEditingCategory(prev => ({ ...prev, image_url: e.target.value }))
                    setUploadPreview(null)
                  }}
                  placeholder="Paste Image URL (https://... or /images/...)"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                />

                {/* Option 2: Upload */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 bg-white border border-border text-charcoal text-xs font-semibold px-3 py-2 rounded-lg hover:bg-beige transition-colors"
                  >
                    <Upload size={13} className="text-gold" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {(uploadPreview || editingCategory.image_url) && (
                    <span className="text-[11px] text-emerald-700 font-medium truncate max-w-[200px]">
                      Image attached ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-charcoal hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-wine text-white text-xs font-semibold uppercase tracking-wider hover:bg-wine-dark transition-colors shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

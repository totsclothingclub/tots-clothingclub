'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllAdminProducts, deleteProduct, getCategories } from '@/lib/supabase/data-service'
import { Product, Category } from '@/lib/types'
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Download,
  Copy,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const [prods, cats] = await Promise.all([
      getAllAdminProducts(),
      getCategories()
    ])
    setProducts(prods)
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      await deleteProduct(id)
      loadData()
    }
  }

  const handleDuplicate = async (prod: Product) => {
    alert(`Duplicating "${prod.name}" template in editor.`)
    window.location.href = `/admin/products/editor?duplicate=${prod.id}`
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Regular Price', 'Sale Price', 'Status', 'Sizes']
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.category?.name || 'Uncategorized',
      p.regular_price,
      p.sale_price || p.regular_price,
      p.status,
      `"${(p.available_sizes || []).join(', ')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `tots-products-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory || p.category?.slug === selectedCategory
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus
    return matchSearch && matchCategory && matchStatus
  })

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Products</h1>
          <p className="text-xs text-mid mt-1">
            Manage your fashion catalog, pricing, inventory stock, and size variants (XS to 7XL).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-border text-charcoal text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-beige transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <Link
            href="/admin/products/editor"
            className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 border border-border rounded-lg bg-white outline-none focus:border-gold"
            aria-label="Filter by Category"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 border border-border rounded-lg bg-white outline-none focus:border-gold"
            aria-label="Filter by Status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <span className="text-xs text-mid pl-2">
            Showing <strong className="text-charcoal">{filtered.length}</strong> of {products.length}
          </span>
        </div>
      </div>

      {/* ── Product Table ── */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#f5f1ea] text-mid uppercase font-semibold border-b border-border">
                <th className="p-4">Image</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Sizes</th>
                <th className="p-4">Status</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-mid">
                    Loading catalog products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-mid">
                    <p className="font-serif text-lg text-charcoal mb-2">No products found</p>
                    <p className="text-xs text-mid">Try modifying your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const regular = p.regular_price
                  const sale = p.sale_price
                  const discount = p.discount_percent || (sale ? Math.round(((regular - sale) / regular) * 100) : 0)

                  return (
                    <tr key={p.id} className="hover:bg-[#faf7f2] transition-colors">
                      {/* Image */}
                      <td className="p-4">
                        <img
                          src={p.primary_image || '/images/placeholder.jpg'}
                          alt={p.name}
                          className="w-12 h-14 object-cover object-top rounded border border-border shadow-2xs"
                        />
                      </td>

                      {/* Product Name */}
                      <td className="p-4 max-w-[220px]">
                        <Link
                          href={`/admin/products/editor?id=${p.id}`}
                          className="font-serif font-semibold text-charcoal text-sm hover:text-wine transition-colors line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-mid block mt-0.5">{p.brand}</span>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono font-semibold text-charcoal">{p.sku}</td>

                      {/* Category */}
                      <td className="p-4 text-mid">{p.category?.name || 'General'}</td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-wine text-sm">
                            ₹{(sale || regular).toLocaleString('en-IN')}
                          </span>
                          {sale && (
                            <span className="text-[10px] line-through text-mid">
                              ₹{regular.toLocaleString('en-IN')} ({discount}% off)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="p-4 text-[11px] text-mid">
                        {p.available_sizes && p.available_sizes.length > 0 ? (
                          <span className="inline-block bg-[#f5efe6] px-2 py-0.5 rounded text-charcoal font-medium">
                            {p.available_sizes.slice(0, 4).join(', ')}
                            {p.available_sizes.length > 4 ? ` +${p.available_sizes.length - 4}` : ''}
                          </span>
                        ) : (
                          'XS–7XL'
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            p.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.status || 'published'}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {p.is_best_seller && (
                            <span className="text-[9px] font-bold bg-gold/20 text-gold-dark px-1.5 py-0.2 rounded">
                              Best
                            </span>
                          )}
                          {p.is_new_arrival && (
                            <span className="text-[9px] font-bold bg-charcoal text-cream px-1.5 py-0.2 rounded">
                              New
                            </span>
                          )}
                          {p.is_plus_size && (
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                              7XL
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-mid hover:text-charcoal hover:bg-beige rounded"
                            title="View on Live Store"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-mid hover:text-charcoal hover:bg-beige rounded"
                            title="Duplicate Product"
                          >
                            <Copy size={14} />
                          </button>
                          <Link
                            href={`/admin/products/editor?id=${p.id}`}
                            className="p-1.5 text-mid hover:text-wine hover:bg-beige rounded"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

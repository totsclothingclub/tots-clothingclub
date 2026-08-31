'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllAdminProducts, deleteProduct, getCategories } from '@/lib/supabase/data-service'
import { Product, Category, getProductStock } from '@/lib/types'
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
  AlertCircle,
  Package
} from 'lucide-react'

import { useConfirm } from '@/components/ui/ConfirmationModal'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function AdminProductsPage() {
  const router = useRouter()
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedStock, setSelectedStock] = useState('all')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, cats] = await Promise.all([
        fetch('/api/admin/products').then(r => r.json()).catch(() => null),
        getCategories()
      ])
      if (Array.isArray(prodRes)) setProducts(prodRes)
      else {
        const localProds = await getAllAdminProducts()
        setProducts(localProds)
      }
      setCategories(cats)
    } catch (e) {
      const local = await getAllAdminProducts()
      setProducts(local)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Product?',
      message: 'Are you sure you want to delete this product? All inventory stock and variant details for this item will be removed permanently.',
      itemName: name,
      confirmText: 'Delete Product',
      variant: 'danger',
    })
    if (!ok) return

    setLoading(true)
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      toast.success(`Product "${name}" deleted successfully.`, 'Product Deleted')
    } catch (err) {
      toast.error('Failed to delete product. Please try again.', 'Error')
      console.error(err)
    } finally {
      loadData()
    }
  }

  const handleDuplicate = async (prod: Product) => {
    router.push(`/admin/products/editor?duplicate=${prod.id}`)
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Regular Price', 'Sale Price', 'Stock Quantity', 'Stock Status', 'Status', 'Sizes']
    const rows = products.map(p => {
      const stock = getProductStock(p)
      const stockStatus = stock <= 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        p.category?.name || 'Uncategorized',
        p.regular_price,
        p.sale_price || p.regular_price,
        stock,
        stockStatus,
        p.status,
        `"${(p.available_sizes || []).join(', ')}"`
      ]
    })
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
    const matchCategory = selectedCategory === 'all' || 
      p.category_id === selectedCategory || 
      p.category?.slug === selectedCategory ||
      (p as any).category_ids?.includes(selectedCategory)
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus
    
    const stock = getProductStock(p)
    const matchStock = selectedStock === 'all' ||
      (selectedStock === 'in_stock' && stock > 5) ||
      (selectedStock === 'low_stock' && stock > 0 && stock <= 5) ||
      (selectedStock === 'out_of_stock' && stock <= 0)

    return matchSearch && matchCategory && matchStatus && matchStock
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
            value={selectedStock}
            onChange={e => setSelectedStock(e.target.value)}
            className="text-xs py-2 px-3 border border-border rounded-lg bg-white outline-none focus:border-gold font-medium"
            aria-label="Filter by Stock Level"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock (&gt;5)</option>
            <option value="low_stock">Low Stock (1-5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
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
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Sizes</th>
                <th className="p-4">Status</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-mid">
                    Loading catalog products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-mid">
                    <p className="font-serif text-lg text-charcoal mb-2">No products found</p>
                    <p className="text-xs text-mid">Try modifying your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const regular = p.regular_price
                  const sale = p.sale_price
                  const discount = p.discount_percent || (sale ? Math.round(((regular - sale) / regular) * 100) : 0)
                  const stock = getProductStock(p)

                  return (
                    <tr key={p.id} className="hover:bg-[#faf7f2] transition-colors">
                      {/* Image */}
                      <td className="p-4">
                        <img
                          src={
                            (p.primary_image && p.primary_image !== '/images/placeholder.jpg')
                              ? p.primary_image
                              : p.images?.[0]?.image_url || '/images/placeholder.jpg'
                          }
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

                      {/* Categories (Multi-badge) */}
                      <td className="p-4 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {(p as any).category_ids && (p as any).category_ids.length > 0 ? (
                            (p as any).category_ids.map((catId: string) => {
                              const cat = categories.find(c => c.id === catId || c.slug === catId)
                              return (
                                <span
                                  key={catId}
                                  className="inline-block bg-beige border border-border text-charcoal text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                >
                                  {cat ? cat.name : catId}
                                </span>
                              )
                            })
                          ) : (
                            <span className="text-mid text-xs">{p.category?.name || 'General'}</span>
                          )}
                        </div>
                      </td>

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

                      {/* Stock Quantity */}
                      <td className="p-4">
                        {stock <= 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            0 Left (Out of stock)
                          </span>
                        ) : stock <= 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            {stock} Left (Low Stock)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {stock} in stock
                          </span>
                        )}
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

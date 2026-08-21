'use client'

import React, { useEffect, useState, useRef } from 'react'
import { getAllBanners, saveBanner, deleteBanner } from '@/lib/supabase/data-service'
import { Banner } from '@/lib/types'
import { PlusCircle, Edit, Trash2, Image as ImageIcon, ExternalLink, X, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Partial<Banner>>({
    title: 'NEW SEASON 2026',
    subtitle: 'Dress the woman\nyou are becoming.',
    button_text: 'Shop the Collection',
    button_url: '/shop',
    desktop_image_url: '/images/placeholder.jpg',
    mobile_image_url: '/images/placeholder.jpg',
    is_active: true,
    display_order: 1
  })
  const [loading, setLoading] = useState(true)
  const [uploadingDesktop, setUploadingDesktop] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [desktopImageMode, setDesktopImageMode] = useState<'url' | 'upload'>('upload')
  const [mobileImageMode, setMobileImageMode] = useState<'url' | 'upload'>('upload')
  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)

  // Direct upload to Cloudinary and set secure CDN URL on banner state
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (target === 'desktop') setUploadingDesktop(true)
    else setUploadingMobile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'banners')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        if (target === 'desktop') {
          setEditingBanner(prev => ({ ...prev, desktop_image_url: data.url }))
        } else {
          setEditingBanner(prev => ({ ...prev, mobile_image_url: data.url }))
        }
      } else {
        alert(data.error || 'Failed to upload image to Cloudinary')
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed. Check Cloudinary settings.')
    } finally {
      if (target === 'desktop') setUploadingDesktop(false)
      else setUploadingMobile(false)
    }
  }

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      if (Array.isArray(data)) setBanners(data)
      else {
        const local = await getAllBanners()
        setBanners(local)
      }
    } catch (e) {
      const local = await getAllBanners()
      setBanners(local)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner)
      })
      await saveBanner(editingBanner)
    } catch (err) {
      console.error(err)
    } finally {
      setIsModalOpen(false)
      loadBanners()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this hero promotional banner?')) {
      setLoading(true)
      try {
        await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
        await deleteBanner(id)
      } catch (err) {
        console.error(err)
      } finally {
        loadBanners()
      }
    }
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* ── Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Hero Banners & Marketing</h1>
          <p className="text-xs text-mid mt-1">
            Manage storefront editorial hero banners, typography headlines, and call-to-action buttons.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBanner({
              title: 'NEW DROP 2026',
              subtitle: 'Modern silhouettes.\nTimeless comfort.',
              button_text: 'Shop New Arrivals',
              button_url: '/shop?category=new',
              desktop_image_url: '/images/placeholder.jpg',
              mobile_image_url: '/images/placeholder.jpg',
              is_active: true,
              display_order: banners.length + 1
            })
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-colors shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* ── Banners List ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-mid">Loading banner configurations...</div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border border-border overflow-hidden shadow-xs p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Preview Thumbnail */}
              <div className="relative w-full lg:w-72 aspect-[16/9] bg-beige rounded-lg overflow-hidden border border-border flex-shrink-0">
                <img
                  src={banner.desktop_image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover object-top"
                />
                <span
                  className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded shadow-xs uppercase ${
                    banner.is_active ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  {banner.is_active ? 'Active on Store' : 'Inactive'}
                </span>
              </div>

              {/* Banner Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                    Slide #{banner.display_order} • {banner.title}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-charcoal leading-snug whitespace-pre-line">
                  {banner.subtitle}
                </h3>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="bg-[#faf7f2] border border-border px-3 py-1 rounded font-medium text-charcoal">
                    Button: {banner.button_text} ({banner.button_url})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end lg:self-center">
                <Link
                  href="/"
                  target="_blank"
                  className="p-2 text-mid hover:text-charcoal hover:bg-beige rounded-lg"
                  title="View on Live Storefront"
                >
                  <ExternalLink size={16} />
                </Link>
                <button
                  onClick={() => {
                    setEditingBanner(banner)
                    setIsModalOpen(true)
                  }}
                  className="px-3.5 py-2 bg-beige text-charcoal text-xs font-semibold rounded-lg hover:bg-gold hover:text-white transition-colors"
                >
                  Edit Banner
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                  title="Delete Banner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Edit / Add Banner Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl border border-border shadow-panel max-w-xl w-full overflow-hidden animate-fadeup">
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#faf7f2]">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                {editingBanner.id ? 'Edit Hero Banner' : 'Create Hero Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-mid hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="font-semibold block mb-1 text-charcoal">Pre-Header / Season Tag</label>
                <input
                  type="text"
                  value={editingBanner.title || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="NEW SEASON 2026"
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-charcoal">Main Headline Typography</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Dress the woman&#10;you are becoming."
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] font-serif text-sm focus:bg-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.button_text || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop the Collection"
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">CTA Button Link</label>
                  <input
                    type="text"
                    value={editingBanner.button_url || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, button_url: e.target.value }))}
                    placeholder="/shop?category=new"
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] font-mono focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* ── Desktop Hero Image (Upload or URL) ── */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-charcoal">Desktop Banner Image (16:9 Landscape)</label>
                  <div className="flex items-center gap-1 bg-beige p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setDesktopImageMode('upload')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        desktopImageMode === 'upload' ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesktopImageMode('url')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        desktopImageMode === 'url' ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {desktopImageMode === 'upload' ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => !uploadingDesktop && desktopFileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all group ${
                        uploadingDesktop
                          ? 'border-gold bg-gold/5 opacity-80 cursor-wait'
                          : 'border-border hover:border-gold/80 bg-[#faf7f2] hover:bg-white'
                      }`}
                    >
                      <input
                        ref={desktopFileRef}
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'desktop')}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1.5 text-mid group-hover:text-charcoal">
                        {uploadingDesktop ? (
                          <>
                            <Loader2 size={20} className="text-gold animate-spin" />
                            <span className="font-semibold text-xs text-charcoal">Uploading to Cloudinary CDN...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-gold" />
                            <span className="font-semibold text-xs text-charcoal">Click to browse or drag & drop image</span>
                            <span className="text-[10px] text-mid">Supports JPG, PNG, WEBP • Saves directly to Cloudinary</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editingBanner.desktop_image_url || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, desktop_image_url: e.target.value }))}
                    placeholder="https://example.com/banner.jpg or /images/..."
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                )}

                {/* Preview */}
                {editingBanner.desktop_image_url && (
                  <div className="relative aspect-[16/9] w-full max-h-36 rounded-lg overflow-hidden border border-border bg-beige mt-2">
                    <img
                      src={editingBanner.desktop_image_url}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingBanner(prev => ({ ...prev, desktop_image_url: '' }))}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-md text-[10px]"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Mobile Banner Image (Optional Upload or URL) ── */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-charcoal">Mobile Banner Image (Optional)</label>
                  <div className="flex items-center gap-1 bg-beige p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setMobileImageMode('upload')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        mobileImageMode === 'upload' ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileImageMode('url')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        mobileImageMode === 'url' ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {mobileImageMode === 'upload' ? (
                  <div
                    onClick={() => !uploadingMobile && mobileFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all group ${
                      uploadingMobile
                        ? 'border-gold bg-gold/5 opacity-80 cursor-wait'
                        : 'border-border hover:border-gold/80 bg-[#faf7f2] hover:bg-white'
                    }`}
                  >
                    <input
                      ref={mobileFileRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'mobile')}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-1 text-mid group-hover:text-charcoal">
                      {uploadingMobile ? (
                        <>
                          <Loader2 size={16} className="text-gold animate-spin" />
                          <span className="font-semibold text-[11px] text-charcoal">Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="text-gold" />
                          <span className="font-semibold text-[11px] text-charcoal">Click to browse mobile image</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editingBanner.mobile_image_url || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, mobile_image_url: e.target.value }))}
                    placeholder="https://example.com/mobile-banner.jpg (optional)"
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                )}

                {/* Mobile Preview */}
                {editingBanner.mobile_image_url && (
                  <div className="relative aspect-[3/2] w-32 rounded-lg overflow-hidden border border-border bg-beige mt-2">
                    <img
                      src={editingBanner.mobile_image_url}
                      alt="Mobile Preview"
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingBanner(prev => ({ ...prev, mobile_image_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-md text-[10px]"
                      title="Remove image"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Display Sequence</label>
                  <input
                    type="number"
                    value={editingBanner.display_order || 1}
                    onChange={e => setEditingBanner(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-[#faf7f2] focus:bg-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-charcoal">Status</label>
                  <select
                    value={editingBanner.is_active ? 'true' : 'false'}
                    onChange={e => setEditingBanner(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:border-gold"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive</option>
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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

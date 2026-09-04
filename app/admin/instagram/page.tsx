'use client'

import React, { useState, useEffect, useRef } from 'react'
import { InstagramPost } from '@/lib/types'
import {
  Instagram,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Layers,
  ArrowUpDown,
  FileText
} from 'lucide-react'
import { useConfirm } from '@/components/ui/ConfirmationModal'
import { useToast } from '@/components/ui/Toast'

export default function AdminInstagramPage() {
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const [editingPost, setEditingPost] = useState<Partial<InstagramPost>>({
    image_url: '',
    instagram_url: '',
    caption: '',
    display_order: 1,
    is_active: true
  })

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/instagram')
      const data = await res.json()
      if (Array.isArray(data)) {
        setPosts(data)
      }
    } catch (e) {
      console.error('Failed to load Instagram posts:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleOpenAdd = () => {
    setEditingPost({
      image_url: '',
      instagram_url: '',
      caption: '',
      display_order: posts.length + 1,
      is_active: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (post: InstagramPost) => {
    setEditingPost({
      ...post,
      instagram_url: post.instagram_url || post.post_url || ''
    })
    setIsModalOpen(true)
  }

  // Upload image only to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Strict image validation
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPG, PNG, WebP) are allowed. Video files are not supported.', 'Invalid File Type')
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/instagram/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setEditingPost(prev => ({
        ...prev,
        image_url: data.url
      }))

      toast.success('Image uploaded to Supabase storage successfully!', 'Image Ready')
    } catch (err: any) {
      console.error('Instagram image upload error:', err)
      toast.error(err.message || 'Failed to upload image.', 'Upload Error')
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingPost.image_url?.trim()) {
      toast.error('Please upload an image or provide an image URL.', 'Image Required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          image_url: editingPost.image_url.trim(),
          instagram_url: editingPost.instagram_url?.trim() || 'https://instagram.com/tots_clothingclub',
          post_url: editingPost.instagram_url?.trim() || 'https://instagram.com/tots_clothingclub',
          caption: editingPost.caption?.trim() || '',
          display_order: Number(editingPost.display_order) || 1,
          is_active: editingPost.is_active ?? true
        })
      })

      const result = await res.json()
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to save Instagram post')
      }

      toast.success(
        editingPost.id ? 'Instagram post updated successfully!' : 'Instagram post added successfully!',
        'Saved'
      )
      setIsModalOpen(false)
      await loadPosts()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save Instagram post.', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, label?: string) => {
    const ok = await confirm({
      title: 'Delete Instagram Post?',
      message: 'Are you sure you want to remove this image post from the "Latest from our Instagram" storefront section?',
      itemName: label || 'Instagram Post',
      confirmText: 'Delete Post',
      variant: 'danger'
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/admin/instagram?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Instagram post removed from storefront.', 'Deleted')
    } catch {
      toast.error('Failed to delete post.', 'Error')
    } finally {
      await loadPosts()
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl shadow-sm">
            <Instagram size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">Instagram Images & Posts</h1>
            <p className="text-xs text-mid mt-0.5 max-w-2xl">
              Upload images for your storefront&apos;s &ldquo;Latest from our Instagram&rdquo; section and connect each image to its Instagram post or Reel.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-wine transition-all shadow-sm shrink-0"
        >
          <PlusCircle size={15} />
          <span>+ Add Instagram Post</span>
        </button>
      </div>

      {/* ── Information Banner ── */}
      <div className="bg-[#faf7f2] border border-[#e8dfd2] rounded-xl p-4 flex gap-3 items-start text-xs">
        <ImageIcon size={18} className="text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-charcoal">Image Posts Management:</p>
          <p className="text-mid leading-relaxed">
            Upload high quality JPG, PNG, or WebP images in 4:5 portrait format. When customers click on any image on the storefront, it opens the associated Instagram post or Reel in a new tab.
          </p>
        </div>
      </div>

      {/* ── Posts Listing / Grid ── */}
      {loading && posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center text-xs text-mid flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading Instagram posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center space-y-3">
          <ImageIcon size={40} className="mx-auto text-gray-300" />
          <h3 className="font-serif text-lg text-charcoal font-semibold">No Instagram Posts Added Yet</h3>
          <p className="text-xs text-mid max-w-md mx-auto">
            Upload your first Instagram image and attach its Instagram post or Reel link to display it on your storefront homepage.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-charcoal text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-wine transition-colors"
          >
            <PlusCircle size={14} /> Add First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {posts.map(post => {
              const url = post.instagram_url || post.post_url || 'https://instagram.com/tots_clothingclub'
              return (
                <div key={post.id} className="bg-white rounded-xl border border-border shadow-xs overflow-hidden group flex flex-col justify-between">
                  {/* 4:5 Aspect Ratio Image Card */}
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.caption || 'Instagram Post'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      {post.is_active ? (
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Eye size={10} /> Active
                        </span>
                      ) : (
                        <span className="bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <EyeOff size={10} /> Inactive
                        </span>
                      )}
                    </div>

                    {/* Display Order Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        #{post.display_order}
                      </span>
                    </div>

                    {/* Center Instagram Icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs text-purple-700 flex items-center justify-center shadow-lg">
                        <Instagram size={18} />
                      </div>
                    </div>

                    {/* Caption at Bottom */}
                    {post.caption && (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                        <p className="text-[10px] text-white line-clamp-2 leading-tight font-medium drop-shadow-sm">
                          {post.caption}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Details & Actions */}
                  <div className="p-3 space-y-2 text-xs bg-white flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-medium truncate flex items-center gap-1 hover:underline"
                        title={url}
                      >
                        <ExternalLink size={11} className="shrink-0" />
                        <span className="truncate">{url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '') || 'instagram.com'}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border text-mid text-xs">
                      <span className="text-[10px]">Order: <strong>{post.display_order}</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="text-charcoal hover:text-purple-700 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Edit Post"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.caption || `Post #${post.display_order}`)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table Summary View */}
          <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-[#faf7f2] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <Layers size={14} /> Existing Instagram Posts ({posts.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50 text-[10px] text-mid uppercase font-semibold">
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Instagram URL</th>
                    <th className="py-3 px-4">Caption</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Order</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map(post => {
                    const url = post.instagram_url || post.post_url || 'https://instagram.com/tots_clothingclub'
                    return (
                      <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="w-12 h-15 rounded-md overflow-hidden bg-gray-100 border border-border aspect-[4/5]">
                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:underline flex items-center gap-1 max-w-[240px] truncate"
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate">{url}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-4 text-charcoal max-w-[200px] truncate">
                          {post.caption || <span className="text-gray-400 italic">None</span>}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {post.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-charcoal">
                          {post.display_order}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(post)}
                              className="p-1.5 text-charcoal hover:text-purple-700 rounded-md hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id, post.caption || `Post #${post.display_order}`)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded-md hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Instagram size={20} className="text-purple-600" />
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  {editingPost.id ? 'Edit Instagram Post' : 'Add Instagram Post'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-charcoal rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* 1. Image Upload Field */}
              <div className="space-y-2">
                <label className="font-bold text-charcoal flex items-center justify-between">
                  <span>Instagram Image (JPG, PNG, WebP) <span className="text-rose-500">*</span></span>
                  {editingPost.image_url && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-semibold">
                      <CheckCircle2 size={11} /> Image Selected
                    </span>
                  )}
                </label>

                {/* Hidden File Input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Upload Action Button */}
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-semibold text-purple-900"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-purple-600" />
                      <span>Uploading Image to Supabase Storage…</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={17} className="text-purple-600" />
                      <span>{editingPost.image_url ? 'Replace Image from Device' : 'Upload Image from Device'}</span>
                    </>
                  )}
                </button>

                {/* Direct Image URL Input */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-mid font-medium">Or paste image URL directly:</span>
                  <input
                    type="url"
                    value={editingPost.image_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs bg-[#faf7f2] focus:bg-white"
                  />
                </div>

                {/* Image Live Preview */}
                {editingPost.image_url && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="relative w-20 aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 border border-border shadow-xs">
                      <img
                        src={editingPost.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] text-mid">
                      <p className="font-semibold text-charcoal">Preview (4:5 Aspect Ratio)</p>
                      <p className="text-[10px] text-gray-500">Image ready for storefront display</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Instagram URL Field */}
              <div className="space-y-1 pt-2 border-t border-border">
                <label className="font-bold text-charcoal flex items-center justify-between">
                  <span>Instagram Post / Reel URL <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-mid font-normal">Opens in new tab on click</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon size={13} />
                  </div>
                  <input
                    type="url"
                    required
                    value={editingPost.instagram_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, instagram_url: e.target.value }))}
                    placeholder="https://www.instagram.com/p/XXXXXXXX/ or /reel/XXXXXXXX/"
                    className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs"
                  />
                </div>
                <p className="text-[10px] text-mid">
                  Example: <code className="text-purple-700">https://www.instagram.com/p/C3x9abc123/</code> or <code className="text-purple-700">https://www.instagram.com/reel/C3x9abc123/</code>
                </p>
              </div>

              {/* 3. Optional Caption */}
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">Caption (Optional)</label>
                <textarea
                  rows={2}
                  value={editingPost.caption || ''}
                  onChange={e => setEditingPost(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="e.g. Modern festive silhouettes crafted with love..."
                  className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>

              {/* 4. Display Order & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPost.display_order || 1}
                    onChange={e => setEditingPost(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Status</label>
                  <select
                    value={editingPost.is_active ? 'true' : 'false'}
                    onChange={e => setEditingPost(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-mid hover:text-charcoal transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="bg-charcoal text-cream font-semibold px-5 py-2 rounded-lg hover:bg-wine transition-all disabled:opacity-50 text-xs flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving Post…</span>
                    </>
                  ) : (
                    'Save Instagram Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

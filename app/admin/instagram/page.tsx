'use client'

import React, { useState, useEffect } from 'react'
import { InstagramPost } from '@/lib/types'
import {
  Instagram,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  X,
  Sparkles,
  Play
} from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'
import { useConfirm } from '@/components/ui/ConfirmationModal'
import { useToast } from '@/components/ui/Toast'

export default function AdminInstagramPage() {
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Partial<InstagramPost>>({
    image_url: '',
    tag: '',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 1,
    is_active: true
  })
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload')

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/instagram')
      const data = await res.json()
      if (Array.isArray(data)) setPosts(data)
    } catch (e) {
      console.error(e)
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
      tag: '',
      post_url: 'https://instagram.com/tots_clothingclub',
      display_order: posts.length + 1,
      is_active: true
    })
    setUploadMode('upload')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (post: InstagramPost) => {
    setEditingPost({ ...post })
    setUploadMode('upload')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost.image_url) {
      toast.error('Please upload or enter an image URL.', 'Image Required')
      return
    }

    setLoading(true)
    try {
      await fetch('/api/admin/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost)
      })
      toast.success(editingPost.id ? 'Instagram post updated!' : 'New Instagram post added!', 'Success')
    } catch (err) {
      toast.error('Failed to save Instagram post.', 'Error')
      console.error(err)
    } finally {
      setIsModalOpen(false)
      loadPosts()
    }
  }

  const handleDelete = async (id: string, tag?: string) => {
    const ok = await confirm({
      title: 'Delete Instagram Post?',
      message: 'Are you sure you want to remove this post from the "Seen On Instagram" storefront gallery?',
      itemName: tag || 'Instagram Post',
      confirmText: 'Delete Post',
      variant: 'danger',
    })
    if (!ok) return

    setLoading(true)
    try {
      await fetch(`/api/admin/instagram?id=${id}`, { method: 'DELETE' })
      toast.success('Instagram post removed from gallery.', 'Post Deleted')
    } catch (err) {
      toast.error('Failed to delete post.', 'Error')
      console.error(err)
    } finally {
      loadPosts()
    }
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-lg shadow-sm">
              <Instagram size={20} />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-normal text-charcoal">Seen On Instagram Gallery</h1>
              <p className="text-xs text-mid mt-0.5">
                Manage photos, reel snapshots, and price badges for the storefront &ldquo;Seen on Instagram&rdquo; section.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest2 px-4 py-2.5 rounded-lg hover:bg-wine transition-all shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Add Instagram Post</span>
        </button>
      </div>

      {/* ── Visual Grid of Instagram Posts ── */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center text-xs text-mid">
          Loading Instagram gallery items...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center space-y-3">
          <Instagram size={36} className="mx-auto text-gray-400" />
          <h3 className="font-serif text-lg text-charcoal font-semibold">No Instagram Posts Yet</h3>
          <p className="text-xs text-mid max-w-md mx-auto">
            Upload your first Instagram reel or outfit snapshot to feature it in the storefront &ldquo;Seen On Instagram&rdquo; strip.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-gold text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors"
          >
            <PlusCircle size={14} />
            <span>Upload First Photo</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-border shadow-xs overflow-hidden group flex flex-col justify-between w-[calc(50%-8px)] sm:w-[160px] md:w-[170px] lg:w-[180px] flex-shrink-0"
            >
              <div className="relative aspect-[3/4] bg-beige overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.tag || 'Instagram Post'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Price Tag / Badge Overlay */}
                {post.tag && (
                  <div className="absolute top-2 left-2 bg-amber-300 text-charcoal font-black text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {post.tag}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {post.is_active ? (
                    <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  ) : (
                    <span className="bg-gray-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Play / Reel Center Overlay */}
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-charcoal flex items-center justify-center shadow-md">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-mid">
                  <span>Order: <strong>#{post.display_order}</strong></span>
                  {post.post_url && (
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-dark hover:underline flex items-center gap-0.5"
                    >
                      <span>Link</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="text-xs text-charcoal font-semibold hover:text-gold-dark flex items-center gap-1"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id, post.tag || 'Instagram Post')}
                    className="text-xs text-rose-600 font-semibold hover:text-rose-800 flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Instagram size={18} className="text-rose-500" />
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  {editingPost.id ? 'Edit Instagram Post' : 'Add New Instagram Post'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-charcoal rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              
              {/* Image Uploader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-charcoal">
                    Instagram Photo / Reel Snapshot <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center bg-[#f5f1ea] p-0.5 rounded-lg border border-border text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        uploadMode === 'upload' ? 'bg-white text-charcoal font-bold shadow-xs' : 'text-mid'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        uploadMode === 'url' ? 'bg-white text-charcoal font-bold shadow-xs' : 'text-mid'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'upload' ? (
                  <CloudinaryUploader
                    folder="instagram"
                    onUploadSuccess={(url: string) => setEditingPost(prev => ({ ...prev, image_url: url }))}
                    label="Drop Instagram image here or click to browse"
                  />
                ) : (
                  <input
                    type="url"
                    value={editingPost.image_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-gold"
                  />
                )}

                {/* Preview */}
                {editingPost.image_url && (
                  <div className="relative aspect-[3/4] max-w-[140px] rounded-lg overflow-hidden border border-border shadow-xs mt-2 mx-auto">
                    <img
                      src={editingPost.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {editingPost.tag && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-300 text-charcoal font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                        {editingPost.tag}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingPost(prev => ({ ...prev, image_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Tag / Badge */}
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">
                  Overlay Price Tag / Badge (Optional)
                </label>
                <input
                  type="text"
                  value={editingPost.tag || ''}
                  onChange={e => setEditingPost(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="e.g. 499/- or FLAT 50% OFF"
                  className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-gold"
                />
                <p className="text-[10px] text-mid">
                  Displays a prominent yellow badge in the top-left corner of the photo.
                </p>
              </div>

              {/* Instagram Post / Reel URL */}
              <div className="space-y-1">
                <label className="font-semibold text-charcoal">
                  Instagram Link (Optional)
                </label>
                <input
                  type="url"
                  value={editingPost.post_url || ''}
                  onChange={e => setEditingPost(prev => ({ ...prev, post_url: e.target.value }))}
                  placeholder="https://instagram.com/reel/..."
                  className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-gold"
                />
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Display Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPost.display_order || 1}
                    onChange={e => setEditingPost(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Visibility</label>
                  <select
                    value={editingPost.is_active ? 'true' : 'false'}
                    onChange={e => setEditingPost(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-gold bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-mid hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-charcoal text-cream font-semibold px-5 py-2 rounded-lg hover:bg-wine transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Instagram Post'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

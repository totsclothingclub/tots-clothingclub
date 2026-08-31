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
  Play,
  CheckCircle2,
  Loader2,
  Video,
  UploadCloud,
  Film,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon
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
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const [editingPost, setEditingPost] = useState<Partial<InstagramPost>>({
    video_url: '',
    image_url: '',
    caption: '',
    tag: '',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 1,
    is_active: true
  })

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
      video_url: '',
      image_url: '',
      caption: '',
      tag: '',
      post_url: 'https://instagram.com/tots_clothingclub',
      display_order: posts.length + 1,
      is_active: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (post: InstagramPost) => {
    setEditingPost({ ...post })
    setIsModalOpen(true)
  }

  // Upload Video File to Cloudinary
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'instagram_videos')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Video upload failed')
      }

      setEditingPost(prev => ({
        ...prev,
        video_url: data.url,
        // If no thumbnail yet, try to derive one or use default
        image_url: prev.image_url || data.url.replace(/\.[^/.]+$/, '.jpg')
      }))
      toast.success('Video uploaded successfully!', 'Video Ready')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload video.', 'Upload Error')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  // Upload Thumbnail Image to Cloudinary
  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumb(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'instagram_thumbs')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Thumbnail upload failed')
      }

      setEditingPost(prev => ({ ...prev, image_url: data.url }))
      toast.success('Thumbnail uploaded successfully!', 'Image Ready')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image.', 'Upload Error')
    } finally {
      setUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingPost.video_url?.trim() && !editingPost.image_url?.trim()) {
      toast.error('Please upload a video or provide a video URL.', 'Video Required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          video_url: editingPost.video_url?.trim() || null,
          image_url: editingPost.image_url?.trim() || '/images/placeholder.jpg',
          caption: editingPost.caption?.trim() || '',
          tag: editingPost.tag?.trim() || null,
          post_url: editingPost.post_url?.trim() || 'https://instagram.com/tots_clothingclub',
          display_order: Number(editingPost.display_order) || 1,
          is_active: editingPost.is_active ?? true
        })
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error || 'Failed to save')

      toast.success(
        editingPost.id ? 'Video updated successfully!' : 'Video added to Instagram section!',
        'Saved'
      )
      setIsModalOpen(false)
      await loadPosts()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save Instagram video.', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, label?: string) => {
    const ok = await confirm({
      title: 'Delete Instagram Video?',
      message: 'Remove this reel/video from the "Latest from our Instagram" storefront section?',
      itemName: label || 'Instagram Reel',
      confirmText: 'Delete Video',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await fetch(`/api/admin/instagram?id=${id}`, { method: 'DELETE' })
      toast.success('Video removed from storefront.', 'Deleted')
    } catch {
      toast.error('Failed to delete.', 'Error')
    } finally {
      await loadPosts()
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl shadow-sm">
            <Instagram size={22} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-charcoal">Instagram Reels & Videos</h1>
            <p className="text-xs text-mid mt-0.5">
              Upload and manage video reels for the storefront &ldquo;Latest from our Instagram&rdquo; section.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-wine transition-all shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Upload Video / Reel</span>
        </button>
      </div>

      {/* ── Video Upload Banner ── */}
      <div className="bg-[#faf7f2] border border-[#e8dfd2] rounded-xl p-4 flex gap-3 items-start text-xs">
        <Film size={18} className="text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-charcoal">Direct Video Uploads (No Instagram API / Access Token required):</p>
          <p className="text-mid leading-relaxed">
            Upload your MP4 / WebM video files directly here. They will play smoothly in a 9:16 Instagram-style reel card on your website with instant playback, volume controls, and a direct &ldquo;Follow on Instagram&rdquo; button.
          </p>
        </div>
      </div>

      {/* ── Grid of Videos ── */}
      {loading && posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center text-xs text-mid flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading videos…
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border text-center space-y-3">
          <Film size={36} className="mx-auto text-gray-300" />
          <h3 className="font-serif text-lg text-charcoal font-semibold">No Videos Uploaded Yet</h3>
          <p className="text-xs text-mid max-w-md mx-auto">
            Upload your first 9:16 reel video to feature it on the storefront homepage.
          </p>
          <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 bg-wine text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors">
            <PlusCircle size={14} /> Upload First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {posts.map(post => {
            const hasVideo = !!post.video_url
            return (
              <div key={post.id} className="bg-white rounded-xl border border-border shadow-xs overflow-hidden group flex flex-col">
                {/* 9:16 Preview Card */}
                <div className="relative aspect-[9/16] bg-black overflow-hidden">
                  {hasVideo ? (
                    <video
                      src={post.video_url}
                      poster={post.image_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      playsInline
                      loop
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                      onMouseLeave={e => {
                        const v = e.currentTarget as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0
                      }}
                    />
                  ) : (
                    <img
                      src={post.image_url || '/images/placeholder.jpg'}
                      alt={post.caption || 'Reel'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {post.tag && (
                      <span className="bg-amber-400 text-charcoal font-black text-[9px] px-2 py-0.5 rounded shadow-xs">
                        {post.tag}
                      </span>
                    )}
                    {hasVideo && (
                      <span className="bg-purple-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Film size={8} /> Video
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="absolute top-2 right-2 z-10">
                    {post.is_active ? (
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Live</span>
                    ) : (
                      <span className="bg-gray-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Hidden</span>
                    )}
                  </div>

                  {/* Center Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs text-charcoal flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Handle & Caption */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                    <p className="text-[10px] font-bold text-white tracking-wide truncate">
                      @{post.author_name || 'tots_clothingclub'}
                    </p>
                    {post.caption && (
                      <p className="text-[9px] text-white/80 line-clamp-2 mt-0.5 leading-tight">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-2.5 space-y-2 text-xs bg-white border-t border-border flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-mid">
                    <span>Order #{post.display_order}</span>
                    {post.post_url && (
                      <a href={post.post_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-0.5 font-semibold">
                        <ExternalLink size={9} /> Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-border">
                    <button onClick={() => handleOpenEdit(post)} className="text-xs text-charcoal font-semibold hover:text-purple-700 flex items-center gap-1">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(post.id, post.caption || post.tag || 'Video')} className="text-xs text-rose-600 font-semibold hover:text-rose-800 flex items-center gap-1">
                      <Trash2 size={11} /> Del
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Film size={20} className="text-purple-600" />
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  {editingPost.id ? 'Edit Instagram Video' : 'Upload Instagram Reel Video'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-charcoal rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">

              {/* 1. Video Upload Field */}
              <div className="space-y-2">
                <label className="font-bold text-charcoal flex items-center justify-between">
                  <span>Video File (.mp4, .webm, .mov) <span className="text-rose-500">*</span></span>
                  {editingPost.video_url && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-semibold">
                      <CheckCircle2 size={11} /> Video Loaded
                    </span>
                  )}
                </label>

                {/* Upload Button */}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploadingVideo}
                    onClick={() => videoInputRef.current?.click()}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-semibold text-purple-900"
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-purple-600" />
                        <span>Uploading Video file to Cloudinary…</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} className="text-purple-600" />
                        <span>Choose Video File from Computer</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Video URL Input */}
                <div className="space-y-1">
                  <span className="text-[10px] text-mid font-medium">Or paste direct Video URL:</span>
                  <input
                    type="url"
                    value={editingPost.video_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs bg-[#faf7f2] focus:bg-white"
                  />
                </div>

                {/* Video Live Preview */}
                {editingPost.video_url && (
                  <div className="relative aspect-[9/16] max-h-48 w-auto mx-auto rounded-lg overflow-hidden bg-black border border-border shadow-xs">
                    <video
                      src={editingPost.video_url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                )}
              </div>

              {/* 2. Optional Thumbnail Cover Image */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="font-semibold text-charcoal flex items-center justify-between">
                  <span>Cover / Thumbnail Image (Optional)</span>
                  {editingPost.image_url && editingPost.image_url !== '/images/placeholder.jpg' && (
                    <span className="text-emerald-600 text-[10px] font-semibold">Custom Cover Set</span>
                  )}
                </label>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploadingThumb}
                    onClick={() => thumbInputRef.current?.click()}
                    className="py-2 px-3 rounded-lg border border-border hover:bg-beige text-charcoal font-medium text-xs flex items-center gap-1.5"
                  >
                    {uploadingThumb ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                    <span>Upload Cover Photo</span>
                  </button>
                  <input
                    type="url"
                    value={editingPost.image_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Cover photo URL (auto-generated if empty)"
                    className="flex-1 py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs"
                  />
                </div>
              </div>

              {/* 3. Caption / Title */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-charcoal">Post Caption / Title</label>
                <textarea
                  rows={2}
                  value={editingPost.caption || ''}
                  onChange={e => setEditingPost(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="e.g. Behind the scenes at our festive photoshoot..."
                  className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>

              {/* 4. Price Badge & Instagram URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Price Badge / Tag</label>
                  <input
                    type="text"
                    value={editingPost.tag || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g. FLAT 50% OFF"
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal">Instagram Post / Profile URL</label>
                  <input
                    type="url"
                    value={editingPost.post_url || ''}
                    onChange={e => setEditingPost(prev => ({ ...prev, post_url: e.target.value }))}
                    placeholder="https://instagram.com/reel/..."
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* 5. Display Order & Visibility */}
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-semibold text-charcoal">Visibility</label>
                  <select
                    value={editingPost.is_active ? 'true' : 'false'}
                    onChange={e => setEditingPost(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-mid hover:text-charcoal transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingVideo || uploadingThumb}
                  className="bg-charcoal text-cream font-semibold px-5 py-2 rounded-lg hover:bg-wine transition-all disabled:opacity-50 text-xs flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving Video…</span>
                    </>
                  ) : (
                    'Save Instagram Reel'
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

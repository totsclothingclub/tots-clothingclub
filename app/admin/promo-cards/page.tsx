'use client'

import React, { useEffect, useState } from 'react'
import { PromoCard } from '@/lib/types'
import {
  PlusCircle, Edit, Trash2, Eye, EyeOff, GripVertical,
  Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle,
  ArrowUp, ArrowDown, LayoutGrid
} from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'
import { useConfirm } from '@/components/ui/ConfirmationModal'
import { useToast } from '@/components/ui/Toast'

const BG_OPTIONS = [
  { value: 'wine', label: 'Wine / Burgundy', preview: '#7a1e3c' },
  { value: 'cream', label: 'Cream / Beige', preview: '#f5efe6' },
  { value: 'charcoal', label: 'Charcoal / Dark', preview: '#1a1a1a' },
  { value: 'gold', label: 'Gold', preview: '#b8966a' },
  { value: 'white', label: 'White', preview: '#ffffff' },
]

const DEFAULT_CARD: Partial<PromoCard> = {
  label: 'SPECIAL DROP',
  title: 'NEW COLLECTION',
  description: 'Discover our latest styles.',
  button_text: 'SHOP NOW',
  button_url: '/shop',
  image_url: '',
  bg_color: 'cream',
  text_color: 'dark',
  display_order: 1,
  is_active: true
}

export default function AdminPromoCardsPage() {
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [cards, setCards] = useState<PromoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<PromoCard>>({ ...DEFAULT_CARD })
  const [saving, setSaving] = useState(false)

  const loadCards = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/promo-cards')
      const data = await res.json()
      if (Array.isArray(data)) setCards(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCards() }, [])

  const openAdd = () => {
    setEditing({ ...DEFAULT_CARD, display_order: cards.length + 1 })
    setIsModalOpen(true)
  }

  const openEdit = (card: PromoCard) => {
    setEditing({ ...card })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditing({ ...DEFAULT_CARD })
  }

  const handleSave = async () => {
    if (!editing.title?.trim()) return toast.error('Card Title is required.', 'Missing Field')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/promo-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Save failed')
      }
      toast.success(editing.id ? 'Card updated successfully!' : 'New promo card created!', 'Success')
      closeModal()
      loadCards()
    } catch (e: any) {
      toast.error(e.message, 'Save Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Delete Promo Card?',
      message: 'Are you sure you want to delete this promotional card? This action cannot be undone and will remove it from the storefront.',
      itemName: title,
      confirmText: 'Delete Card',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await fetch(`/api/admin/promo-cards?id=${id}`, { method: 'DELETE' })
      toast.success('Promotional card deleted successfully.', 'Deleted')
      loadCards()
    } catch (e) {
      toast.error('Could not delete card. Please try again.', 'Delete Failed')
    }
  }

  const handleToggle = async (card: PromoCard) => {
    try {
      await fetch('/api/admin/promo-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...card, is_active: !card.is_active })
      })
      toast.info(
        card.is_active ? 'Card disabled from storefront' : 'Card published live to storefront',
        'Visibility Updated'
      )
      loadCards()
    } catch (e) {}
  }

  const handleReorder = async (card: PromoCard, dir: 'up' | 'down') => {
    const idx = cards.findIndex(c => c.id === card.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= cards.length) return
    const swap = cards[swapIdx]
    await Promise.all([
      fetch('/api/admin/promo-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...card, display_order: swap.display_order })
      }),
      fetch('/api/admin/promo-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...swap, display_order: card.display_order })
      })
    ])
    toast.success('Display order reordered', 'Updated')
    loadCards()
  }

  // Preview the card style
  const bgStyle = (bg?: string) => {
    if (!bg || bg === 'cream') return { backgroundColor: '#f5efe6', color: '#1a1a1a' }
    if (bg === 'wine') return { backgroundColor: '#7a1e3c', color: '#fff' }
    if (bg === 'charcoal') return { backgroundColor: '#1a1a1a', color: '#fff' }
    if (bg === 'gold') return { backgroundColor: '#b8966a', color: '#fff' }
    if (bg === 'white') return { backgroundColor: '#fff', color: '#1a1a1a' }
    if (bg.startsWith('#')) return { backgroundColor: bg, color: '#fff' }
    return { backgroundColor: '#f5efe6', color: '#1a1a1a' }
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Promotional Cards</h1>
          <p className="text-xs text-mid mt-1">
            Manage the three promotional cards shown on the homepage. Control content, images, links, and visibility.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-wine transition-colors shadow-xs"
        >
          <PlusCircle size={15} />
          Add Promo Card
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-mid text-sm">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading cards...
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center border-2 border-dashed border-border rounded-2xl bg-white">
          <LayoutGrid size={32} className="text-mid" />
          <p className="font-serif text-lg text-charcoal">No promotional cards yet</p>
          <p className="text-xs text-mid">Click "Add Promo Card" to create your first card.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card, idx) => {
            const style = bgStyle(card.bg_color)
            return (
              <div
                key={card.id}
                className={`rounded-2xl border shadow-xs overflow-hidden transition-all ${
                  card.is_active ? 'border-border' : 'border-border/40 opacity-60'
                }`}
              >
                {/* Mini Preview */}
                <div
                  className="flex items-stretch h-[140px] relative"
                  style={{ backgroundColor: style.backgroundColor }}
                >
                  {/* Text side */}
                  <div className="flex-1 p-4 flex flex-col justify-between" style={{ color: style.color }}>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">
                        {card.label}
                      </span>
                      <h3 className="font-serif text-sm font-bold leading-tight uppercase">
                        {card.title}
                      </h3>
                      <p className="text-[10px] opacity-70 leading-snug line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                    <span className="text-[9px] border px-2 py-0.5 font-bold uppercase tracking-widest self-start"
                      style={{ borderColor: style.color, color: style.color }}>
                      {card.button_text}
                    </span>
                  </div>
                  {/* Image side */}
                  <div className="w-[38%] flex-shrink-0 bg-transparent overflow-hidden flex items-center justify-center">
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.title} className="w-full h-full object-cover object-top bg-transparent" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-transparent">
                        <ImageIcon size={20} className="opacity-30" style={{ color: style.color }} />
                      </div>
                    )}
                  </div>
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/40 text-white text-[9px] font-bold flex items-center justify-center">
                    {card.display_order}
                  </div>
                  {/* Active badge */}
                  <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    card.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {card.is_active ? 'LIVE' : 'OFF'}
                  </div>
                </div>

                {/* Info + Controls */}
                <div className="bg-white p-3 border-t border-border/60 space-y-2">
                  <div className="text-[10px] text-mid truncate">
                    <span className="font-semibold text-charcoal">Link: </span>
                    {card.button_url}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Reorder */}
                    <button
                      onClick={() => handleReorder(card, 'up')}
                      disabled={idx === 0}
                      title="Move up"
                      className="p-1.5 rounded-lg border border-border text-mid hover:bg-beige disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleReorder(card, 'down')}
                      disabled={idx === cards.length - 1}
                      title="Move down"
                      className="p-1.5 rounded-lg border border-border text-mid hover:bg-beige disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown size={12} />
                    </button>
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(card)}
                      title={card.is_active ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        card.is_active
                          ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          : 'border-border text-mid hover:bg-beige'
                      }`}
                    >
                      {card.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(card)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-semibold bg-beige hover:bg-gold/20 text-charcoal border border-border rounded-lg transition-colors"
                    >
                      <Edit size={11} /> Edit
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(card.id, card.title)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Notes */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-xs text-charcoal space-y-1">
        <p className="font-semibold">💡 How Promo Cards Work</p>
        <p className="text-mid">Cards are shown on the homepage in display order. Only <strong>active</strong> cards appear on the website. Use the arrow buttons to reorder them. Upload images in Cloudinary format for best quality.</p>
        <p className="text-mid mt-1"><strong>bg_color options:</strong> wine (burgundy), cream (beige), charcoal (dark), gold, white</p>
      </div>

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                {editing.id ? 'Edit Promotional Card' : 'Add Promotional Card'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-beige text-mid transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Live Mini Preview */}
            <div className="px-6 pt-5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-mid mb-2">Live Preview</p>
              <div
                className="flex items-stretch h-[120px] rounded-xl overflow-hidden border border-border"
                style={{ backgroundColor: bgStyle(editing.bg_color).backgroundColor }}
              >
                <div className="flex-1 p-4 flex flex-col justify-between"
                  style={{ color: bgStyle(editing.bg_color).color }}>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold tracking-widest opacity-70">
                      {editing.label || 'LABEL'}
                    </span>
                    <h3 className="font-serif text-sm font-bold leading-tight uppercase">
                      {editing.title || 'CARD TITLE'}
                    </h3>
                    <p className="text-[10px] opacity-70 leading-snug line-clamp-2">
                      {editing.description || 'Card description here.'}
                    </p>
                  </div>
                  <span className="text-[9px] border px-2 py-0.5 font-bold uppercase tracking-widest self-start"
                    style={{ borderColor: bgStyle(editing.bg_color).color, color: bgStyle(editing.bg_color).color }}>
                    {editing.button_text || 'SHOP NOW'}
                  </span>
                </div>
                <div className="w-[38%] flex-shrink-0 bg-transparent overflow-hidden flex items-center justify-center">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="preview" className="w-full h-full object-cover object-top bg-transparent" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-transparent">
                      <ImageIcon size={24} className="opacity-20" style={{ color: bgStyle(editing.bg_color).color }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-4 text-xs">

              {/* Row: Label + Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Small Label <span className="text-mid font-normal">(e.g. SPECIAL DROP)</span>
                  </label>
                  <input
                    type="text"
                    value={editing.label || ''}
                    onChange={e => setEditing(p => ({ ...p, label: e.target.value }))}
                    placeholder="SPECIAL DROP"
                    className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">
                    Main Title <span className="text-wine">*</span>
                  </label>
                  <input
                    type="text"
                    value={editing.title || ''}
                    onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                    placeholder="STYLE UNDER ₹499"
                    className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-charcoal block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  placeholder="Everything you love. Nothing over ₹499."
                  className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs resize-none"
                />
              </div>

              {/* Row: Button Text + Button Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={editing.button_text || ''}
                    onChange={e => setEditing(p => ({ ...p, button_text: e.target.value }))}
                    placeholder="SHOP NOW"
                    className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Button Link / URL</label>
                  <input
                    type="text"
                    value={editing.button_url || ''}
                    onChange={e => setEditing(p => ({ ...p, button_url: e.target.value }))}
                    placeholder="/shop?maxPrice=499"
                    className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs font-mono"
                  />
                </div>
              </div>

              {/* Row: Background Color + Text Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Background Color</label>
                  <div className="flex flex-wrap gap-2">
                    {BG_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditing(p => ({ ...p, bg_color: opt.value }))}
                        title={opt.label}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          editing.bg_color === opt.value ? 'border-gold scale-110 shadow-md' : 'border-border/60'
                        }`}
                        style={{ backgroundColor: opt.preview }}
                      />
                    ))}
                  </div>
                  <p className="text-mid mt-1">{BG_OPTIONS.find(o => o.value === editing.bg_color)?.label || editing.bg_color}</p>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-2">Text Color</label>
                  <div className="flex gap-2">
                    {['dark', 'white'].map(tc => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setEditing(p => ({ ...p, text_color: tc }))}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          editing.text_color === tc
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-mid border-border hover:border-gold'
                        }`}
                      >
                        {tc === 'dark' ? '🌑 Dark' : '⬜ White'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row: Display Order + Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editing.display_order || 1}
                    onChange={e => setEditing(p => ({ ...p, display_order: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-border rounded-lg bg-[#faf7f2] focus:outline-none focus:border-gold text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setEditing(p => ({ ...p, is_active: !p.is_active }))}
                    className={`w-full py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                      editing.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-mid border-border'
                    }`}
                  >
                    {editing.is_active ? '✓ Active (Visible on Website)' : '✗ Inactive (Hidden)'}
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="font-semibold text-charcoal block mb-2">Card Image</label>
                <CloudinaryUploader
                  folder="promo-cards"
                  label="Upload Card Image (3:4 ratio recommended)"
                  acceptMultiple={false}
                  onUploadSuccess={url => setEditing(p => ({ ...p, image_url: url }))}
                />
                {editing.image_url && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={editing.image_url} alt="Card" className="w-16 h-20 object-cover rounded-lg border border-border" />
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-600 font-semibold">✓ Image uploaded</p>
                      <button
                        type="button"
                        onClick={() => setEditing(p => ({ ...p, image_url: '' }))}
                        className="text-[10px] text-rose-500 hover:underline mt-0.5"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-border mt-2">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-xs font-semibold border border-border text-charcoal rounded-xl hover:bg-beige transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-xs font-semibold bg-charcoal text-cream rounded-xl hover:bg-wine transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? 'Saving...' : (editing.id ? 'Update Card' : 'Create Card')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { INITIAL_REVIEWS } from '@/lib/supabase/mock-data'
import { Review } from '@/lib/types'
import { Star, CheckCircle2, MessageSquare, Trash2, Filter } from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const handleDelete = (id: string) => {
    if (confirm('Delete this customer review?')) {
      setReviews(prev => prev.filter(r => r.id !== id))
    }
  }

  const handleToggleApprove = (id: string) => {
    setReviews(prev => prev.map(r => (r.id === id ? { ...r, is_approved: !r.is_approved } : r)))
  }

  const filtered = reviews.filter(r => {
    if (filter === 'approved') return r.is_approved
    if (filter === 'pending') return !r.is_approved
    return true
  })

  return (
    <div className="space-y-6 pb-16">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-charcoal">Customer Reviews</h1>
          <p className="text-xs text-mid mt-1">
            Moderate customer feedback, inspect 5-star ratings, and approve product testimonials.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#f5f1ea] p-1 rounded-lg border border-border">
          {[
            { key: 'all', label: 'All Reviews' },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: 'Pending' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                filter === tab.key
                  ? 'bg-white text-charcoal font-semibold shadow-xs'
                  : 'text-mid hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-border text-center text-mid text-xs">
            No reviews match the selected filter.
          </div>
        ) : (
          filtered.map(rev => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-border p-6 shadow-xs flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-charcoal text-sm">{rev.customer_name}</span>
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                  {rev.is_verified_purchase && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={11} /> Verified Buyer
                    </span>
                  )}
                </div>

                {rev.title && (
                  <h4 className="font-serif font-semibold text-charcoal text-base">{rev.title}</h4>
                )}
                <p className="text-xs text-mid max-w-2xl leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-mid block">
                  Submitted on {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => handleToggleApprove(rev.id)}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                    rev.is_approved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {rev.is_approved ? 'Approved ✓' : 'Approve Review'}
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                  title="Delete Review"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

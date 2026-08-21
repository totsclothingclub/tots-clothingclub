'use client'

import React, { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  if (subscribed) {
    return (
      <div className="py-3 px-6 bg-gold/10 border border-gold text-gold font-medium text-xs tracking-wider rounded">
        Thank you for subscribing! Check your inbox for your 10% discount code.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto w-full">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 px-4 py-3.5 text-sm border-y border-l outline-none focus:border-gold bg-white"
        style={{ borderColor: 'var(--border)', color: 'var(--charcoal)' }}
      />
      <button
        type="submit"
        className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest2 transition-opacity hover:opacity-80"
        style={{ background: 'var(--charcoal)', color: 'var(--cream)', whiteSpace: 'nowrap' }}
      >
        Subscribe
      </button>
    </form>
  )
}

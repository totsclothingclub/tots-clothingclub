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
    <form onSubmit={handleSubmit} className="flex items-stretch max-w-md mx-auto w-full min-w-0">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 min-w-0 w-full px-3.5 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm border border-r-0 outline-none focus:border-gold bg-white rounded-l-lg text-charcoal placeholder:text-gray-400"
        style={{ borderColor: 'var(--border)' }}
      />
      <button
        type="submit"
        className="flex-shrink-0 px-3.5 sm:px-5 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80 rounded-r-lg whitespace-nowrap bg-charcoal text-cream border border-l-0 border-charcoal"
      >
        Subscribe
      </button>
    </form>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare,
  Sparkles
} from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-white">Contact Us</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Sparkles size={14} />
              <span>We&apos;re Here To Assist You</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Get In Touch
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Have questions about your order, sizing, or returns? Our dedicated support team is here to help.
            </p>
          </div>
        </section>

        {/* ── Contact Details & Form Grid with Proper Top Padding ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Direct Info Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* WhatsApp Quick Chat */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-2xl p-6 sm:p-7 text-white border border-emerald-800 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-white">Instant WhatsApp Support</h2>
                    <p className="text-[11px] text-emerald-200">Fastest response for order & return inquiries</p>
                  </div>
                </div>
                <p className="text-xs text-cream/90 leading-relaxed mb-4">
                  Chat directly with our styling & support representatives on WhatsApp for immediate assistance.
                </p>
                <a
                  href="https://wa.me/918594041490"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Contact Information Details */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e2d9cc] shadow-sm space-y-5">
                <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3">
                  Customer Care & Headquarters
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-beige border border-border flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                      <Phone size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Helpline & WhatsApp</p>
                      <a href="tel:+918594041490" className="text-mid hover:text-wine font-medium">+91 85940 41490</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-beige border border-border flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                      <Mail size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Customer Support Email</p>
                      <a href="mailto:support@totsclothingclub.com" className="text-mid hover:text-wine font-medium">support@totsclothingclub.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-beige border border-border flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Operating Address</p>
                      <p className="text-mid leading-relaxed">
                        TOTS Clothing Club, West Nada,<br />
                        Guruvayoor, Thrissur District,<br />
                        Kerala, India — 680101
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-beige border border-border flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
                      <Clock size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">Working Hours</p>
                      <p className="text-mid">Monday – Saturday: 9:30 AM – 7:00 PM IST</p>
                      <p className="text-[10px] text-gray-400">Online orders 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Contact Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e2d9cc] shadow-sm">
                
                {submitted ? (
                  <div className="py-14 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Message Received!</h3>
                    <p className="text-xs text-mid max-w-md mx-auto leading-relaxed">
                      Thank you for contacting TOTS Clothing Club. Our support representative will review your message and reply to <strong>{formData.email || 'your email'}</strong> within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="inline-block mt-4 text-xs font-bold text-wine underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="border-b border-border pb-3">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                        Send Us A Message
                      </h2>
                      <p className="text-xs text-mid mt-1">
                        Fill out the form below and we will get back to you promptly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-charcoal mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priya Nair"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. priya@example.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal mb-1">Phone / WhatsApp Number</label>
                        <input
                          type="tel"
                          placeholder="+91 85940 41490"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal mb-1">Order ID (If applicable)</label>
                        <input
                          type="text"
                          placeholder="e.g. TOTS-10023"
                          value={formData.orderNumber}
                          onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                          className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-charcoal mb-1">Topic / Subject</label>
                      <select
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order & Tracking">Order & Tracking Status</option>
                        <option value="Return / Exchange (Unboxing Video)">Return / Exchange Request</option>
                        <option value="Size Consultation">Size Consultation (XS - 7XL)</option>
                        <option value="Payment / Razorpay Issue">Payment / Razorpay Transaction Issue</option>
                        <option value="Wholesale / Partnership">Wholesale / Brand Partnership</option>
                      </select>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-charcoal mb-1">Your Message *</label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Please write your questions or details here..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-border bg-[#faf7f2] focus:outline-none focus:border-gold resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-charcoal text-white font-bold text-xs uppercase tracking-widest hover:bg-wine transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Send size={15} />
                      <span>Submit Message</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  HelpCircle, 
  Plus, 
  Minus, 
  ChevronRight, 
  Truck, 
  Video, 
  CreditCard, 
  Crown, 
  PhoneCall,
  Search
} from 'lucide-react'

interface FAQItem {
  q: string
  a: React.ReactNode
  category: 'shipping' | 'returns' | 'payment' | 'sizing'
}

const FAQS_DATA: FAQItem[] = [
  // Shipping & Delivery
  {
    category: 'shipping',
    q: 'How much are the shipping charges?',
    a: (
      <p>
        We charge a flat standard shipping fee of <strong>₹80/-</strong> per order across India. Delivery is provided via reputed courier services like Bluedart, Delhivery, DTDC, and India Post.
      </p>
    )
  },
  {
    category: 'shipping',
    q: 'How long does delivery take?',
    a: (
      <p>
        Orders are dispatched within <strong>1–2 business days</strong>. Standard transit timeline is <strong>2–4 days for South India</strong> and <strong>4–7 days for rest of India</strong>. You will receive live tracking updates via SMS, WhatsApp, and Email upon dispatch.
      </p>
    )
  },
  {
    category: 'shipping',
    q: 'Do you deliver to my pincode?',
    a: (
      <p>
        Yes, we service 25,000+ pin codes across all states and Union Territories in India through our integrated courier network.
      </p>
    )
  },

  // Returns & Refunds
  {
    category: 'returns',
    q: 'Is an unboxing video mandatory for returns?',
    a: (
      <div className="space-y-2">
        <p className="text-wine font-semibold">
          Yes, a continuous and unedited unboxing/opening video is strictly mandatory for any return or damage request.
        </p>
        <p>
          The video must start from opening the sealed outer courier parcel. If there is any defect, wrong size dispatched, wrong colour, or damage, it must be clearly visible in the video. Requests without a valid opening video cannot be approved.
        </p>
      </div>
    )
  },
  {
    category: 'returns',
    q: 'How do I raise a return or exchange request?',
    a: (
      <p>
        Contact our customer support team within <strong>48 hours</strong> of delivery via WhatsApp at <strong>+91 85940 41490</strong> or email <strong>support@totsclothingclub.com</strong> with your Order ID and the unboxing video footage.
      </p>
    )
  },
  {
    category: 'returns',
    q: 'How will I receive my refund?',
    a: (
      <p>
        Once the returned item is inspected at our warehouse, refunds are credited back to the original payment source (UPI / Card / NetBanking) via Razorpay within <strong>5 to 7 working days</strong>.
      </p>
    )
  },

  // Payment
  {
    category: 'payment',
    q: 'Is Cash on Delivery (COD) available?',
    a: (
      <p>
        <strong>Cash on Delivery (COD) is currently not available.</strong> All orders are confirmed through 100% secure online payment only to ensure rapid dispatch and contactless fulfillment.
      </p>
    )
  },
  {
    category: 'payment',
    q: 'Which online payment methods are accepted?',
    a: (
      <p>
        We support all major payment modes via <strong>Razorpay</strong>: UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), Credit/Debit Cards (Visa, MasterCard, RuPay, Maestro), Net Banking (50+ banks), and Digital Wallets.
      </p>
    )
  },
  {
    category: 'payment',
    q: 'What if amount is deducted from my bank but order is not confirmed?',
    a: (
      <p>
        Due to rare network drops, incomplete transactions are automatically auto-reversed by your issuing bank within <strong>3–5 working days</strong>. You can also send your payment reference ID to our WhatsApp support for swift reconciliation.
      </p>
    )
  },

  // Sizing & Product
  {
    category: 'sizing',
    q: 'What size range does TOTS offer?',
    a: (
      <p>
        We offer a comprehensive inclusive size range from <strong>XS to 7XL</strong> on selected styles, kurta sets, plus-size dresses, and western wear. Please check our <Link href="/size-guide" className="text-wine underline font-semibold">Size Guide</Link> for detailed body measurements.
      </p>
    )
  },
  {
    category: 'sizing',
    q: 'Can I cancel an order after placing it?',
    a: (
      <p>
        You can cancel your order before it has been dispatched by messaging us on WhatsApp (+91 85940 41490) with your Order ID for an immediate 100% refund. Once dispatched, standard return guidelines apply.
      </p>
    )
  }
]

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = FAQS_DATA.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' || faq.q.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header with Generous Padding ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Help & Support</span>
              <ChevronRight size={12} />
              <span className="text-white">FAQs</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <HelpCircle size={14} />
              <span>Frequently Asked Questions</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              How Can We Help You?
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Find quick answers to common questions about shipping, online payments, size guides, and returns.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto pt-2 relative">
              <input
                type="text"
                placeholder="Search questions (e.g. shipping, return video, refund)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#202020] border border-[#333333] text-cream placeholder-gray-500 text-xs focus:outline-none focus:border-gold"
              />
              <Search size={16} className="absolute left-3.5 top-5.5 text-gray-400" />
            </div>
          </div>
        </section>

        {/* ── Category Filters with Proper Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'shipping', label: '📦 Shipping & Delivery (₹80)' },
              { id: 'returns', label: '🔄 Returns & Unboxing Video' },
              { id: 'payment', label: '💳 Payment & Razorpay' },
              { id: 'sizing', label: '👗 Sizing (XS - 7XL)' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setOpenIndex(null)
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-white text-mid border border-border hover:border-gold'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Accordion List with Proper Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#e2d9cc] shadow-sm space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-14 text-mid text-xs">
                No matching questions found. Please search another term or contact our support team.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index
                return (
                  <div
                    key={index}
                    className="border border-border rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-[#faf7f2] hover:bg-beige/40 transition-colors"
                    >
                      <span className="font-serif font-bold text-sm sm:text-base text-charcoal">
                        {faq.q}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-charcoal flex-shrink-0">
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 sm:p-6 bg-white text-xs text-charcoal/90 leading-relaxed border-t border-border animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom Help Card */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-beige-light border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal">Still have questions?</h3>
              <p className="text-xs text-mid mt-0.5">We are available on WhatsApp and Email to assist you.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/918594041490"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors flex items-center gap-2"
              >
                <PhoneCall size={14} />
                <span>WhatsApp Us</span>
              </a>
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-lg bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

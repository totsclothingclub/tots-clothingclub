'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin, ChevronDown, Plus, Minus } from 'lucide-react'

export function Footer() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    shop: false,
    help: false,
    info: false,
    contact: false,
  })

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <>
      <footer className="bg-[#111111] text-cream pt-14 pb-20 lg:pb-12 border-t border-[#222222]">
        
        {/* ════════════════════════════════════════════════════════
            DESKTOP & TABLET VIEW (md: and above) — 100% UNCHANGED
        ════════════════════════════════════════════════════════ */}
        <div className="hidden md:grid max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#222222]">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/images/tots-logo.png"
                alt="TOTS"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-medium max-w-xs">
              Affordable Premium Fashion For Every Woman
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://wa.me/918594041490"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">SHOP</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/shop?category=new-arrivals" className="hover:text-cream transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop" className="hover:text-cream transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=plus-size" className="hover:text-cream transition-colors">Plus Size Collection</Link></li>
              <li><Link href="/shop?category=salwar-sets" className="hover:text-cream transition-colors">Salwar Sets</Link></li>
              <li><Link href="/shop?isSale=true" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">Sale & Clearance</Link></li>
            </ul>
          </div>


          {/* Help Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">HELP</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/contact" className="hover:text-cream transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-cream transition-colors">Shipping Policy (₹80)</Link></li>
              <li><Link href="/return-policy" className="hover:text-cream transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/track-order" className="hover:text-cream transition-colors">Track Order</Link></li>
              <li><Link href="/faqs" className="hover:text-cream transition-colors">FAQs</Link></li>
              <li><Link href="/size-guide" className="hover:text-cream transition-colors">Size Guide (XS–7XL)</Link></li>
            </ul>
          </div>

          {/* Information Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">INFORMATION</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/about-us" className="hover:text-cream transition-colors">About Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-cream transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-cream transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/payment-policy" className="hover:text-cream transition-colors">Payment Policy</Link></li>
              <li><Link href="/admin" className="text-gold hover:underline font-semibold transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3 text-xs text-gray-400">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">CONTACT</h4>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-300">
                <Phone size={13} className="text-gold" />
                <a href="tel:+918594041490" className="hover:text-white transition-colors">+91 85940 41490</a>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Mail size={13} className="text-gold" />
                <a href="mailto:support@totsclothingclub.com" className="hover:text-white transition-colors">support@totsclothingclub.com</a>
              </p>
              <p className="flex items-start gap-2 text-gray-400">
                <MapPin size={13} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Guruvayoor, Kerala, India — 680101</span>
              </p>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════
            MOBILE VIEW ONLY (< md) — ACCORDIONS FOR 4 SECTIONS
        ════════════════════════════════════════════════════════ */}
        <div className="block md:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-8 border-b border-[#222222] space-y-4">
          
          {/* Brand Info */}
          <div className="space-y-3 pb-4 border-b border-[#222222]">
            <Link href="/" className="inline-block">
              <img
                src="/images/tots-logo.png"
                alt="TOTS"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Affordable Premium Fashion For Every Woman
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://wa.me/918594041490"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Accordion 1: SHOP */}
          <div className="border-b border-[#222222]">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full py-3.5 flex items-center justify-between text-left focus:outline-none transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gold group-hover:text-gold-light">
                SHOP
              </span>
              <div className="text-gold transition-transform duration-200">
                {openSections.shop ? <Minus size={15} /> : <Plus size={15} />}
              </div>
            </button>
            {openSections.shop && (
              <ul className="space-y-2.5 pb-4 text-xs text-gray-400 animate-fadein">
                <li><Link href="/shop?category=new-arrivals" className="block hover:text-cream transition-colors">New Arrivals</Link></li>
                <li><Link href="/shop" className="block hover:text-cream transition-colors">All Products</Link></li>
                <li><Link href="/shop?category=plus-size" className="block hover:text-cream transition-colors">Plus Size Collection</Link></li>
                <li><Link href="/shop?category=salwar-sets" className="block hover:text-cream transition-colors">Salwar Sets</Link></li>
                <li><Link href="/shop?isSale=true" className="block text-rose-400 hover:text-rose-300 font-semibold transition-colors">Sale & Clearance</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 2: HELP */}
          <div className="border-b border-[#222222]">
            <button
              type="button"
              onClick={() => toggleSection('help')}
              className="w-full py-3.5 flex items-center justify-between text-left focus:outline-none transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gold group-hover:text-gold-light">
                HELP
              </span>
              <div className="text-gold transition-transform duration-200">
                {openSections.help ? <Minus size={15} /> : <Plus size={15} />}
              </div>
            </button>
            {openSections.help && (
              <ul className="space-y-2.5 pb-4 text-xs text-gray-400 animate-fadein">
                <li><Link href="/contact" className="block hover:text-cream transition-colors">Contact Us</Link></li>
                <li><Link href="/shipping-policy" className="block hover:text-cream transition-colors">Shipping Policy (₹80)</Link></li>
                <li><Link href="/return-policy" className="block hover:text-cream transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/track-order" className="block hover:text-cream transition-colors">Track Order</Link></li>
                <li><Link href="/faqs" className="block hover:text-cream transition-colors">FAQs</Link></li>
                <li><Link href="/size-guide" className="block hover:text-cream transition-colors">Size Guide (XS–7XL)</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 3: INFORMATION */}
          <div className="border-b border-[#222222]">
            <button
              type="button"
              onClick={() => toggleSection('info')}
              className="w-full py-3.5 flex items-center justify-between text-left focus:outline-none transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gold group-hover:text-gold-light">
                INFORMATION
              </span>
              <div className="text-gold transition-transform duration-200">
                {openSections.info ? <Minus size={15} /> : <Plus size={15} />}
              </div>
            </button>
            {openSections.info && (
              <ul className="space-y-2.5 pb-4 text-xs text-gray-400 animate-fadein">
                <li><Link href="/about-us" className="block hover:text-cream transition-colors">About Us</Link></li>
                <li><Link href="/privacy-policy" className="block hover:text-cream transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="block hover:text-cream transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/payment-policy" className="block hover:text-cream transition-colors">Payment Policy</Link></li>
                <li><Link href="/admin" className="block text-gold hover:underline font-semibold transition-colors">Admin Panel</Link></li>
              </ul>
            )}
          </div>

          {/* Accordion 4: CONTACT */}
          <div className="border-b border-[#222222]">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full py-3.5 flex items-center justify-between text-left focus:outline-none transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gold group-hover:text-gold-light">
                CONTACT
              </span>
              <div className="text-gold transition-transform duration-200">
                {openSections.contact ? <Minus size={15} /> : <Plus size={15} />}
              </div>
            </button>
            {openSections.contact && (
              <div className="space-y-2 pb-4 text-xs text-gray-400 animate-fadein">
                <p className="flex items-center gap-2 text-gray-300">
                  <Phone size={13} className="text-gold" />
                  <a href="tel:+918594041490" className="hover:text-white transition-colors">+91 85940 41490</a>
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <Mail size={13} className="text-gold" />
                  <a href="mailto:support@totsclothingclub.com" className="hover:text-white transition-colors">support@totsclothingclub.com</a>
                </p>
                <p className="flex items-start gap-2 text-gray-400">
                  <MapPin size={13} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>Guruvayoor, Kerala, India — 680101</span>
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Payment Logos */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 TOTS Clothing Club. All Rights Reserved.</p>
          
          {/* Payment Badges */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 flex-wrap">
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c] text-gold">Razorpay</span>
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c]">UPI</span>
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c]">VISA</span>
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c]">Mastercard</span>
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c]">RuPay</span>
            <span className="px-2 py-0.5 bg-[#1e1e1e] rounded border border-[#2c2c2c]">Net Banking</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button on Bottom Right */}
      <a
        href="https://wa.me/918594041490"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 lg:bottom-6 right-5 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
        </svg>
      </a>
    </>
  )
}

export default Footer

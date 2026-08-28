import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { ShieldCheck, Lock, Eye, FileText, ChevronRight, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | TOTS Clothing Club',
  description: 'Understand how TOTS Clothing Club collects, protects, and handles your personal information during shopping and payment.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 28, 2026'

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header with Generous Padding ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Legal</span>
              <ChevronRight size={12} />
              <span className="text-white">Privacy Policy</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>Data Protection & Privacy Standards</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Your privacy and trust are paramount. Learn how we safeguard your information. Last updated: <span className="text-cream font-medium">{lastUpdated}</span>
            </p>
          </div>
        </section>

        {/* ── Privacy Content Container with Proper Spacing & Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-10 text-sm text-charcoal/90 leading-relaxed">

            {/* 1. Introduction */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                1. Overview & Commitment
              </h2>
              <p>
                <strong>TOTS Clothing Club</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates <strong>www.totsclothingclub.com</strong>. This Privacy Policy describes how your personal information is collected, used, and shared when you visit, create an account, or make a purchase from our website.
              </p>
              <p>
                We are committed to maintaining the confidentiality, integrity, and security of all personal information entrusted to us by our shoppers.
              </p>
            </div>

            <hr className="border-border" />

            {/* 2. Information We Collect */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                2. Information We Collect
              </h2>
              <p>
                When you interact with our website or place an order, we collect certain information to complete your transaction and improve your shopping experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-charcoal/80 pl-2">
                <li><strong>Customer Details:</strong> Name, delivery address, billing address, email address, and phone/WhatsApp number.</li>
                <li><strong>Order & Transaction History:</strong> Products purchased, sizes selected, coupons applied, and order timestamps.</li>
                <li><strong>Device & Log Information:</strong> IP address, browser type, device information, and browsing behaviour on our website for analytical and security purposes.</li>
              </ul>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs mt-3">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Lock size={14} className="text-emerald-700" />
                  <span>Important Note Regarding Payment Card Details</span>
                </p>
                <p>
                  We do <strong>NOT</strong> collect, view, or store your debit/credit card numbers, CVV codes, UPI PINs, or bank net banking passwords. All payments are processed through tokenized, bank-grade encryption via our PCI-DSS Level 1 compliant partner, <strong>Razorpay</strong>.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* 3. How We Use Your Information */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                3. How We Use Your Information
              </h2>
              <p>We use the information collected from you for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-charcoal/80 pl-2">
                <li>To process, fulfill, and ship your clothing orders.</li>
                <li>To send order confirmation receipts, GST invoices, and live tracking details via SMS, WhatsApp, and Email.</li>
                <li>To process returns, exchanges, or customer support queries.</li>
                <li>To prevent fraudulent transactions and enhance checkout security.</li>
                <li>To provide personalized product recommendations and occasional promotional discounts (you can unsubscribe anytime).</li>
              </ul>
            </div>

            <hr className="border-border" />

            {/* 4. Sharing with Third Parties */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                4. Third-Party Service Providers
              </h2>
              <p>
                We do NOT sell, rent, or trade your personal information to any third parties. We share your data only with trusted service partners strictly necessary to operate our business:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-charcoal/80 pl-2">
                <li><strong>Payment Aggregators (Razorpay):</strong> To securely authorize and settle online transactions.</li>
                <li><strong>Courier & Logistics Partners (Bluedart, Delhivery, DTDC, India Post):</strong> To deliver your package to your doorstep.</li>
                <li><strong>Communication Gateways:</strong> To send transactional WhatsApp/SMS/Email notifications regarding your order status.</li>
              </ul>
            </div>

            <hr className="border-border" />

            {/* 5. Cookies & Tracking */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                5. Cookies & Session Storage
              </h2>
              <p className="text-xs">
                We use standard browser cookies and local storage to remember your shopping cart items, wishlist selections, and account login status. You can adjust your browser settings to refuse cookies, though doing so may prevent certain parts of the checkout or cart drawer from operating smoothly.
              </p>
            </div>

            <hr className="border-border" />

            {/* 6. Data Security & Retention */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                6. Data Security & Retention
              </h2>
              <p className="text-xs">
                We implement robust security measures including Secure Sockets Layer (SSL) 256-bit encryption for all data transmissions across our platform. We retain your order and invoice records for legal and tax compliance purposes as required under Indian commercial law.
              </p>
            </div>

            <hr className="border-border" />

            {/* 7. Grievance & Contact */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                7. Grievance Officer & Contact Details
              </h2>
              <p className="text-xs">
                In accordance with the Information Technology Act, 2000 and the rules made thereunder, if you have any questions or concerns about this policy or your personal data, you may contact our Privacy Grievance Officer:
              </p>
              <div className="p-4 rounded-xl bg-[#faf7f2] border border-border text-xs space-y-1">
                <p><strong>Grievance Officer:</strong> Customer Care &amp; Compliance Team</p>
                <p><strong>Brand:</strong> TOTS Clothing Club</p>
                <p><strong>Address:</strong> Guruvayoor, Thrissur District, Kerala, India - 680101</p>
                <p><strong>Email:</strong> privacy@totsclothingclub.com / support@totsclothingclub.com</p>
                <p><strong>Phone:</strong> +91 85940 41490</p>
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

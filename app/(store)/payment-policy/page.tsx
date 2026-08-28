import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Building2, 
  RefreshCcw, 
  ChevronRight,
  HelpCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Policy & Security | TOTS Clothing Club',
  description: 'Learn about our accepted online payment methods, Razorpay gateway security, COD status, and failed transaction resolution.',
}

export default function PaymentPolicyPage() {
  const lastUpdated = 'August 28, 2026'

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
              <span>Policies</span>
              <ChevronRight size={12} />
              <span className="text-white">Payment Policy</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>100% Encrypted & Secure Payments</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Payment Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Safe, seamless, and encrypted checkout powered by Razorpay. Last updated: <span className="text-cream font-medium">{lastUpdated}</span>
            </p>
          </div>
        </section>

        {/* ── COD Notice Callout with Proper Spacing ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e2d9cc] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal">
                  Cash on Delivery (COD) Status: <span className="text-rose-600">Currently Not Available</span>
                </h3>
                <p className="text-xs text-mid mt-1 max-w-xl leading-relaxed">
                  To ensure rapid dispatch, minimal contact delivery, and fraud prevention, <strong>all orders are confirmed through 100% secure online payment only</strong>.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-block px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Online Payment Only
              </span>
            </div>
          </div>
        </section>

        {/* ── Detailed Policy Content ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-10 text-sm text-charcoal/90 leading-relaxed">

            {/* Section 1: Accepted Payment Methods */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">1</span>
                <span>Supported Payment Modes</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Accepted Payment Methods via Razorpay
              </h2>

              <p>
                We partner with <strong>Razorpay</strong>, India&apos;s leading RBI-authorized payment aggregator, to provide a wide variety of safe and instant payment options:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-5 rounded-xl border border-border bg-[#faf7f2] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-charcoal">
                    <Smartphone size={16} className="text-gold" />
                    <span>UPI (Instant & Zero Surcharge)</span>
                  </div>
                  <p className="text-xs text-mid leading-relaxed">
                    Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, or any UPI ID / QR code scanning.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-[#faf7f2] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-charcoal">
                    <CreditCard size={16} className="text-gold" />
                    <span>Credit & Debit Cards</span>
                  </div>
                  <p className="text-xs text-mid leading-relaxed">
                    Visa, MasterCard, RuPay, Maestro, and American Express issued by any Indian or international bank.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-[#faf7f2] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-charcoal">
                    <Building2 size={16} className="text-gold" />
                    <span>Net Banking (50+ Banks)</span>
                  </div>
                  <p className="text-xs text-mid leading-relaxed">
                    HDFC, ICICI, SBI, Axis Bank, Kotak, Bank of Baroda, Kerala Gramin Bank, Federal Bank, and more.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-[#faf7f2] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-charcoal">
                    <ShieldCheck size={16} className="text-gold" />
                    <span>Digital Wallets</span>
                  </div>
                  <p className="text-xs text-mid leading-relaxed">
                    Paytm Wallet, Mobikwik, PhonePe Wallet, and other popular digital prepaid wallets.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 2: Security & Encryption */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">2</span>
                <span>Security Standards</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Bank-Grade 256-Bit SSL Encryption
              </h2>

              <p>
                Your privacy and financial data security are of utmost priority to us:
              </p>

              <ul className="space-y-2.5 text-xs text-charcoal/80">
                <li className="flex items-start gap-2.5">
                  <Lock size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>PCI-DSS Level 1 Compliant:</strong> All transactions are processed through Razorpay&apos;s PCI-DSS Level 1 compliant secure payment gateway.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Lock size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Card Data Storage:</strong> TOTS Clothing Club does NOT store or have access to your credit/debit card numbers, CVV codes, UPI PINs, or net banking passwords.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Lock size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>3D Secure Authentication:</strong> All card payments require two-factor authentication (OTP) generated directly by your issuing bank.</span>
                </li>
              </ul>
            </div>

            <hr className="border-border" />

            {/* Section 3: Failed Transactions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">3</span>
                <span>Failed or Incomplete Transactions</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                What Happens If Money is Deducted But Order Is Not Confirmed?
              </h2>

              <div className="p-5 rounded-xl bg-[#faf7f2] border border-border space-y-3 text-xs">
                <p>
                  In rare cases of bank network timeouts or connection drops, an amount may be debited from your bank account without your order being generated on our website:
                </p>
                <div className="p-4 bg-white rounded-lg border border-border text-charcoal space-y-1.5">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <RefreshCcw size={14} />
                    <span>Automatic Bank Auto-Reversal</span>
                  </p>
                  <p className="text-mid leading-relaxed">
                    The banking network automatically identifies the incomplete authorization and refunds the exact amount to your bank account or source card within <strong>3 to 5 working days</strong>.
                  </p>
                </div>
                <p className="text-mid leading-relaxed">
                  If the amount is not reversed within 5 days, please send your transaction screenshot or Razorpay Payment ID to <strong>support@totsclothingclub.com</strong> or WhatsApp <strong>+91 85940 41490</strong>, and our team will reconcile it immediately.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* Section 4: Currency & Taxes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-wine font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-wine/10 flex items-center justify-center text-xs">4</span>
                <span>Currency, Pricing & Invoicing</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                Pricing & GST Invoicing
              </h2>

              <p className="text-xs">
                • <strong>Currency:</strong> All prices listed on TOTS Clothing Club are in <strong>Indian National Rupees (INR / ₹)</strong>.
              </p>
              <p className="text-xs">
                • <strong>Taxes:</strong> All product prices include applicable Goods and Services Tax (GST) as per Government of India regulations.
              </p>
              <p className="text-xs">
                • <strong>Invoice:</strong> A digital tax invoice will be sent to your registered email address upon successful payment and order confirmation.
              </p>
            </div>

            <hr className="border-border" />

            {/* Support CTA */}
            <div className="p-6 rounded-xl bg-beige-light border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-charcoal text-sm">Need help with a payment issue?</p>
                <p className="text-mid">Our accounts team will verify and assist you right away.</p>
              </div>
              <Link
                href="/contact"
                className="px-5 py-3 rounded-lg bg-charcoal text-white font-bold uppercase tracking-wider hover:bg-wine transition-colors flex-shrink-0"
              >
                Contact Accounts Support
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

import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { FileText, Shield, Scale, ChevronRight, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Conditions | TOTS Clothing Club',
  description: 'Read the terms of service and conditions of use governing purchases and website use at TOTS Clothing Club.',
}

export default function TermsAndConditionsPage() {
  const lastUpdated = 'August 28, 2026'

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero with Generous Padding ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Legal</span>
              <ChevronRight size={12} />
              <span className="text-white">Terms & Conditions</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Scale size={14} />
              <span>User Agreement & Store Policies</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Please read these terms carefully before accessing or using our website. Last updated: <span className="text-cream font-medium">{lastUpdated}</span>
            </p>
          </div>
        </section>

        {/* ── Content Container with Proper Spacing & Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="bg-white rounded-2xl p-8 sm:p-12 lg:p-16 border border-[#e2d9cc] shadow-sm space-y-10 text-sm text-charcoal/90 leading-relaxed">

            {/* 1. Introduction */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                1. Introduction & Acceptance of Terms
              </h2>
              <p>
                Welcome to <strong>TOTS Clothing Club</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). This website (<strong>www.totsclothingclub.com</strong>) is operated by TOTS Clothing Club, having its operational headquarters in Guruvayoor, Kerala, India.
              </p>
              <p>
                By visiting our website and/or purchasing from us, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions (&ldquo;Terms &amp; Conditions&rdquo;, &ldquo;Terms&rdquo;), including all additional policies, rules, and notices referenced herein or available via hyperlinks.
              </p>
            </div>

            <hr className="border-border" />

            {/* 2. Eligibility & Account Responsibilities */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                2. User Eligibility & Account Security
              </h2>
              <p>
                By agreeing to these Terms, you represent that you are at least 18 years of age, or have given us your consent to allow any of your minor dependents to use this site.
              </p>
              <p>
                You are solely responsible for maintaining the confidentiality of your account credentials, password, and for restricting access to your computer or mobile device. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </div>

            <hr className="border-border" />

            {/* 3. Products, Pricing & Accuracy */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                3. Products, Sizing & Pricing
              </h2>
              <p>
                • <strong>Descriptions & Imagery:</strong> We make every effort to display as accurately as possible the colours, fabrics, and designs of our apparel. However, actual colours may vary slightly depending on monitor display calibrations and studio lighting.
              </p>
              <p>
                • <strong>Sizing:</strong> Please refer to our official <Link href="/size-guide" className="text-wine font-semibold underline">Size Guide</Link> before placing orders. Measurements are provided in inches and centimeters with standard tolerances.
              </p>
              <p>
                • <strong>Price Changes:</strong> Prices for our products are subject to change without prior notice. All prices are quoted in Indian Rupees (INR / ₹) and are inclusive of applicable GST.
              </p>
            </div>

            <hr className="border-border" />

            {/* 4. Payment Terms & Razorpay */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                4. Online Payments & Razorpay Gateway
              </h2>
              <p>
                • <strong>Payment Methods:</strong> Orders can be confirmed through online payment only via our integrated Razorpay payment gateway (UPI, Credit Cards, Debit Cards, Net Banking, and Wallets).
              </p>
              <p>
                • <strong>Cash on Delivery:</strong> Cash on Delivery (COD) is currently not available.
              </p>
              <p>
                • <strong>Billing Details:</strong> You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
              </p>
            </div>

            <hr className="border-border" />

            {/* 5. Shipping & Delivery */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                5. Shipping & Courier Delivery
              </h2>
              <p>
                • <strong>Home Delivery:</strong> Delivery is provided across India via third-party courier services. A standard flat shipping charge of <strong>₹80/-</strong> applies per order unless otherwise specified during active promotions.
              </p>
              <p>
                • <strong>Delivery Timelines:</strong> Expected delivery timeline is 3 to 7 business days depending on delivery location. TOTS Clothing Club is not liable for minor courier transit delays caused by force majeure events, weather disruptions, or governmental holidays.
              </p>
            </div>

            <hr className="border-border" />

            {/* 6. Unboxing Video & Returns */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                6. Mandatory Opening/Unboxing Video for Returns
              </h2>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed space-y-2">
                <p className="font-bold">
                  ⚠️ Special Notice on Returns & Damage Claims:
                </p>
                <p>
                  A <strong>continuous, unedited, single-take opening/unboxing video</strong> starting from the sealed courier parcel is strictly mandatory for any claim regarding transit damage, wrong size dispatched, wrong colour, defect, or missing item.
                </p>
                <p>
                  Returns will be processed in accordance with our detailed <Link href="/return-policy" className="underline font-bold text-wine">Return & Refund Policy</Link>.
                </p>
              </div>
            </div>

            <hr className="border-border" />

            {/* 7. Intellectual Property */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                7. Intellectual Property Rights
              </h2>
              <p>
                All content included on this site, such as text, graphics, logos, button icons, images, brand trademarks, and digital downloads, is the property of TOTS Clothing Club and is protected under Indian and international copyright and trademark laws.
              </p>
            </div>

            <hr className="border-border" />

            {/* 8. Limitation of Liability */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                8. Limitation of Liability & Indemnification
              </h2>
              <p>
                In no case shall TOTS Clothing Club, our directors, employees, affiliates, agents, contractors, or suppliers be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind resulting from the use of our services or products.
              </p>
            </div>

            <hr className="border-border" />

            {/* 9. Governing Law & Jurisdiction */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                9. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms of Service and any separate agreements whereby we provide you goods shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Thrissur / Kerala, India</strong>.
              </p>
            </div>

            <hr className="border-border" />

            {/* 10. Contact Us */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                10. Contact Information
              </h2>
              <p className="text-xs">
                Questions about the Terms &amp; Conditions should be sent to us at:
              </p>
              <div className="p-4 rounded-xl bg-[#faf7f2] border border-border text-xs space-y-1">
                <p><strong>Brand:</strong> TOTS Clothing Club</p>
                <p><strong>Location:</strong> Guruvayoor, Thrissur District, Kerala, India — 680101</p>
                <p><strong>Email:</strong> support@totsclothingclub.com</p>
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

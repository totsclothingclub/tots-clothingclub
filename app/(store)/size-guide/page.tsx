'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { Ruler, Sparkles, ChevronRight, CheckCircle2, Crown } from 'lucide-react'

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  const SIZES = [
    { size: 'XS', bustIn: '32 – 34', waistIn: '26 – 28', hipIn: '34 – 36', bustCm: '81 – 86', waistCm: '66 – 71', hipCm: '86 – 91' },
    { size: 'S', bustIn: '36', waistIn: '30', hipIn: '38', bustCm: '91', waistCm: '76', hipCm: '96' },
    { size: 'M', bustIn: '38', waistIn: '32', hipIn: '40', bustCm: '96', waistCm: '81', hipCm: '101' },
    { size: 'L', bustIn: '40', waistIn: '34', hipIn: '42', bustCm: '101', waistCm: '86', hipCm: '106' },
    { size: 'XL', bustIn: '42', waistIn: '36', hipIn: '44', bustCm: '106', waistCm: '91', hipCm: '111' },
    { size: '2XL', bustIn: '44', waistIn: '38', hipIn: '46', bustCm: '111', waistCm: '96', hipCm: '116' },
    { size: '3XL', bustIn: '46', waistIn: '40', hipIn: '48', bustCm: '116', waistCm: '101', hipCm: '121' },
    { size: '4XL', bustIn: '48', waistIn: '42', hipIn: '50', bustCm: '121', waistCm: '106', hipCm: '127' },
    { size: '5XL', bustIn: '50', waistIn: '44', hipIn: '52', bustCm: '127', waistCm: '111', hipCm: '132' },
    { size: '6XL', bustIn: '52', waistIn: '46', hipIn: '54', bustCm: '132', waistCm: '116', hipCm: '137' },
    { size: '7XL', bustIn: '54', waistIn: '48', hipIn: '56', bustCm: '137', waistCm: '121', hipCm: '142' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1a1a1a]">
      <Header />

      <main className="flex-1 pb-20">
        {/* ── Breadcrumb & Hero Header ── */}
        <section className="bg-[#141414] text-cream py-14 sm:py-20 border-b border-[#222222] relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8974a_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gold/80 tracking-widest uppercase font-medium">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-white">Size Guide</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold">
              <Ruler size={14} />
              <span>Inclusive Sizing Chart • XS to 7XL</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase pt-1">
              Women&apos;s Size & Measurement Guide
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              Find your ideal fit across all TOTS ethnic sets, western dresses, and plus-size styles.
            </p>
          </div>
        </section>

        {/* ── Sizing Table Card with Proper Top Padding ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-[#e2d9cc] shadow-sm space-y-8">
            
            {/* Unit Toggle & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                  Body Dimension Chart
                </h2>
                <p className="text-xs text-mid mt-1">Measurements refer to body dimensions, not garment size.</p>
              </div>

              {/* Unit Switcher */}
              <div className="flex items-center bg-[#faf7f2] p-1 rounded-xl border border-border w-fit">
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    unit === 'in' ? 'bg-charcoal text-white shadow-xs' : 'text-mid hover:text-charcoal'
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    unit === 'cm' ? 'bg-charcoal text-white shadow-xs' : 'text-mid hover:text-charcoal'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#141414] text-cream">
                    <th className="p-4 rounded-l-xl font-bold uppercase tracking-wider text-gold">Size</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Bust ({unit})</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Waist ({unit})</th>
                    <th className="p-4 rounded-r-xl font-bold uppercase tracking-wider">Hip ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SIZES.map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#faf7f2]'}>
                      <td className="p-4 font-bold text-charcoal font-serif text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          {['2XL', '3XL', '4XL', '5XL', '6XL', '7XL'].includes(row.size) && (
                            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                          )}
                          {row.size}
                        </span>
                      </td>
                      <td className="p-4 text-charcoal font-medium">
                        {unit === 'in' ? row.bustIn : row.bustCm}
                      </td>
                      <td className="p-4 text-charcoal font-medium">
                        {unit === 'in' ? row.waistIn : row.waistCm}
                      </td>
                      <td className="p-4 text-charcoal font-medium">
                        {unit === 'in' ? row.hipIn : row.hipCm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sizing Tips */}
            <div className="p-5 rounded-xl bg-beige-light border border-border space-y-2 text-xs">
              <p className="font-bold text-charcoal flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold" />
                <span>Fit & Measurement Tips:</span>
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-mid pl-1">
                <li><strong>Bust:</strong> Measure around the fullest part of your chest with a comfortable tape.</li>
                <li><strong>Waist:</strong> Measure at your natural waistline, usually above the belly button.</li>
                <li><strong>Hips:</strong> Measure around the fullest part of your hips and rear.</li>
                <li><strong>Between sizes?</strong> If you prefer a relaxed or comfortable silhouette, we recommend choosing one size up.</li>
              </ul>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

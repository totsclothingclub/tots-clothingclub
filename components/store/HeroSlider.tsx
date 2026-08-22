'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import type { Banner } from '@/lib/types'

interface HeroSlide {
  title: string
  subtitle: string
  description?: string
  button_text?: string
  button_url?: string
  image_url: string
  mobile_image_url?: string
}

interface HeroSliderProps {
  initialBanners?: Banner[]
}

export default function HeroSlider({ initialBanners = [] }: HeroSliderProps) {
  if (!initialBanners || initialBanners.length === 0) {
    return null
  }

  const slides: HeroSlide[] = initialBanners.map((b) => ({
    title: b.title || '',
    subtitle: b.subtitle || '',
    button_text: b.button_text || 'SHOP NOW',
    button_url: b.button_url || '/shop',
    image_url: b.desktop_image_url || b.mobile_image_url || '/images/placeholder.jpg',
    mobile_image_url: b.mobile_image_url || b.desktop_image_url || '/images/placeholder.jpg',
  }))

  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const hasMultipleSlides = slides.length > 1

  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentIndex) return
    setCurrentIndex(newIndex)
  }, [currentIndex])

  const goToPrev = useCallback(() => {
    const nextIdx = (currentIndex - 1 + slides.length) % slides.length
    changeSlide(nextIdx)
  }, [currentIndex, slides.length, changeSlide])

  const goToNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % slides.length
    changeSlide(nextIdx)
  }, [currentIndex, slides.length, changeSlide])

  // Automatic slide transition every 5 seconds
  useEffect(() => {
    if (!hasMultipleSlides) return

    timerRef.current = setInterval(() => {
      goToNext()
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hasMultipleSlides, goToNext])

  // Reset autoplay timer on manual user action
  const handleManualAction = (fn: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current)
    fn()
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#faf7f2] border-b border-border/60">
      
      {/* ═══════════════════════════════════════════════════
          FULL-WIDTH HERO BANNER CONTAINER (Desktop 16:9 & Mobile Adaptive)
      ═══════════════════════════════════════════════════ */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] min-h-[380px] sm:min-h-[480px] max-h-[82vh] overflow-hidden">
        
        {/* Full-width Background Images with Smooth Crossfade */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              currentIndex === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Mobile Banner Image (Screen width < 640px) */}
            <img
              src={slide.mobile_image_url || slide.image_url}
              alt={slide.title}
              className="block sm:hidden w-full h-full object-cover object-center"
            />
            {/* Desktop Banner Image (Screen width >= 640px) */}
            <img
              src={slide.image_url}
              alt={slide.title}
              className="hidden sm:block w-full h-full object-cover object-center sm:object-right-top"
            />
          </div>
        ))}

        {/* Targeted Gradient Overlay: bottom-left radial wash on mobile, left-to-right gradient on desktop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(250,247,242,0.95)_0%,_rgba(250,247,242,0.65)_40%,_transparent_75%)] sm:bg-gradient-to-r sm:from-[#faf7f2]/95 sm:via-[#faf7f2]/75 sm:to-transparent w-full sm:w-[65%] lg:w-[55%] z-10 pointer-events-none" />

        {/* ═══════════════════════════════════════════════════
            HERO CONTENT WRAPPER
        ═══════════════════════════════════════════════════ */}
        <div className="relative z-20 w-full h-full max-w-[1600px] mx-auto px-5 sm:px-12 lg:px-20 xl:px-28 flex flex-col justify-end sm:justify-between pb-8 pt-4 sm:py-10 lg:py-12">
          
          {/* Top/Middle Left Section: Left-bounded Container on Mobile (Bottom aligned on mobile, centered on desktop) */}
          <div className="mt-auto sm:my-auto max-w-[65%] xs:max-w-[60%] sm:max-w-lg lg:max-w-xl text-left">
            
            {/* ── 1. FIXED-WIDTH TEXT REGION (Enhanced large luxury typography on mobile) ── */}
            <div className="h-[110px] xs:h-[125px] sm:h-[190px] lg:h-[210px] flex flex-col justify-end sm:justify-center relative w-full">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 flex flex-col justify-end sm:justify-center space-y-1 sm:space-y-3.5 transition-all duration-500 ease-in-out ${
                    currentIndex === idx
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <span className="text-xs xs:text-sm sm:text-xs uppercase font-bold tracking-[0.25em] text-[#b8966a] block leading-tight">
                    {slide.title}
                  </span>

                  <h1 className="font-serif text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal leading-[1.08] sm:leading-[1.06] break-words">
                    {slide.subtitle.includes('\n') ? (
                      slide.subtitle.split('\n').map((line, lIdx) => (
                        <span key={lIdx} className="block">{line}</span>
                      ))
                    ) : (
                      <span>{slide.subtitle}</span>
                    )}
                  </h1>

                  {slide.description && (
                    <p className="hidden sm:block text-[10px] sm:text-sm text-mid max-w-full leading-relaxed font-medium line-clamp-2">
                      {slide.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* ── 2. DYNAMIC CTA BUTTONS (Desktop Style, Centered Text, Vertically Stacked on Mobile) ── */}
            <div className="mt-3 xs:mt-3.5 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3.5 pt-0.5 sm:pt-1 w-full max-w-[205px] xs:max-w-[225px] sm:max-w-none">
              <Link
                href={slides[currentIndex]?.button_url || '/shop'}
                className="bg-[#141414] text-white border border-[#2b2b2b] font-bold text-[10px] xs:text-[11px] sm:text-xs uppercase tracking-wider px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-lg hover:bg-wine transition-all shadow-md flex items-center justify-center text-center w-full sm:w-auto whitespace-nowrap"
              >
                <span>{slides[currentIndex]?.button_text || 'SHOP NOW'}</span>
              </Link>
              <Link
                href="/shop?category=plus-size"
                className="bg-transparent text-charcoal border border-[#b8966a] font-bold text-[10px] xs:text-[11px] sm:text-xs uppercase tracking-wider px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-lg hover:bg-[#b8966a] hover:text-white transition-all flex items-center justify-center text-center w-full sm:w-auto whitespace-nowrap"
              >
                <span>EXPLORE PLUS SIZE</span>
              </Link>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
              3. DESKTOP FOUR BENEFITS (Shifted slightly left, single horizontal row)
          ═══════════════════════════════════════════════════ */}
          <div className="hidden sm:grid grid-cols-4 gap-3 lg:gap-5 pt-3 text-left max-w-2xl -ml-2 sm:-ml-4 lg:-ml-6">
            
            {/* 1. Size Inclusive */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f3ede2]/90 flex items-center justify-center text-[#b8966a] flex-shrink-0 border border-[#b8966a]/30">
                <Crown size={15} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif text-[10px] lg:text-[11px] font-bold text-charcoal tracking-wide uppercase leading-tight">
                  SIZE INCLUSIVE
                </h4>
                <p className="text-[9px] text-mid uppercase tracking-tight mt-0.5">
                  XS TO 7XL
                </p>
              </div>
            </div>

            {/* 2. Premium Quality */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f3ede2]/90 flex items-center justify-center text-[#b8966a] flex-shrink-0 border border-[#b8966a]/30">
                <Sparkles size={15} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif text-[10px] lg:text-[11px] font-bold text-charcoal tracking-wide uppercase leading-tight">
                  PREMIUM QUALITY
                </h4>
                <p className="text-[9px] text-mid uppercase tracking-tight mt-0.5">
                  AT AFFORDABLE PRICES
                </p>
              </div>
            </div>

            {/* 3. Easy Returns */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f3ede2]/90 flex items-center justify-center text-[#b8966a] flex-shrink-0 border border-[#b8966a]/30">
                <RefreshCw size={15} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif text-[10px] lg:text-[11px] font-bold text-charcoal tracking-wide uppercase leading-tight">
                  EASY RETURNS
                </h4>
                <p className="text-[9px] text-mid uppercase tracking-tight mt-0.5">
                  HASSLE FREE
                </p>
              </div>
            </div>

            {/* 4. Secure Payment */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f3ede2]/90 flex items-center justify-center text-[#b8966a] flex-shrink-0 border border-[#b8966a]/30">
                <ShieldCheck size={15} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-serif text-[10px] lg:text-[11px] font-bold text-charcoal tracking-wide uppercase leading-tight">
                  SECURE PAYMENT
                </h4>
                <p className="text-[9px] text-mid uppercase tracking-tight mt-0.5">
                  100% SAFE
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════
            NAVIGATION CONTROLS
        ═══════════════════════════════════════════════════ */}
        {hasMultipleSlides && (
          <>
            {/* Desktop Left / Right Floating Chevron Buttons */}
            <button
              type="button"
              onClick={() => handleManualAction(goToPrev)}
              className="hidden sm:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-charcoal items-center justify-center shadow-md border border-border/60 backdrop-blur-xs transition-all z-30 cursor-pointer active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleManualAction(goToNext)}
              className="hidden sm:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-charcoal items-center justify-center shadow-md border border-border/60 backdrop-blur-xs transition-all z-30 cursor-pointer active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>

            {/* Mobile Pagination Dots (Positioned above benefits strip) */}
            <div className="sm:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 py-1 px-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleManualAction(() => changeSlide(idx))}
                  className={`transition-all rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-4 h-1.5 bg-charcoal'
                      : 'w-1.5 h-1.5 bg-charcoal/35 hover:bg-charcoal/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE 4-COLUMN BENEFITS STRIP (Directly attached below Hero Banner)
          Matches exact mobile reference: 4 items visible simultaneously
      ═══════════════════════════════════════════════════ */}
      <div className="sm:hidden w-full bg-white border-t border-border/80 py-3.5 px-2">
        <div className="grid grid-cols-4 gap-1 text-center">
          
          {/* 1. Size Inclusive */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="text-[#b8966a] mb-1">
              <Crown size={18} strokeWidth={1.5} />
            </div>
            <h4 className="font-serif text-[9px] font-bold text-charcoal tracking-tight uppercase leading-tight">
              SIZE INCLUSIVE
            </h4>
            <p className="text-[7.5px] text-mid uppercase leading-tight mt-0.5">
              XS TO 7XL
            </p>
          </div>

          {/* 2. Premium Quality */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="text-[#b8966a] mb-1">
              <Sparkles size={18} strokeWidth={1.5} />
            </div>
            <h4 className="font-serif text-[9px] font-bold text-charcoal tracking-tight uppercase leading-tight">
              PREMIUM QUALITY
            </h4>
            <p className="text-[7.5px] text-mid uppercase leading-tight mt-0.5">
              AT AFFORDABLE PRICES
            </p>
          </div>

          {/* 3. Easy Returns */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="text-[#b8966a] mb-1">
              <RefreshCw size={18} strokeWidth={1.5} />
            </div>
            <h4 className="font-serif text-[9px] font-bold text-charcoal tracking-tight uppercase leading-tight">
              EASY RETURNS
            </h4>
            <p className="text-[7.5px] text-mid uppercase leading-tight mt-0.5">
              7 DAYS RETURN
            </p>
          </div>

          {/* 4. Secure Payment */}
          <div className="flex flex-col items-center justify-center px-0.5">
            <div className="text-[#b8966a] mb-1">
              <ShieldCheck size={18} strokeWidth={1.5} />
            </div>
            <h4 className="font-serif text-[9px] font-bold text-charcoal tracking-tight uppercase leading-tight">
              SECURE PAYMENT
            </h4>
            <p className="text-[7.5px] text-mid uppercase leading-tight mt-0.5">
              100% SAFE
            </p>
          </div>

        </div>
      </div>

    </section>
  )
}

'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import type { InstagramPost } from '@/lib/types'

interface Props {
  posts?: InstagramPost[]
  instagramHandle?: string
}

/** Clean Instagram-style 4:5 Image Post Card */
function InstagramImageCard({
  post,
  cleanHandle
}: {
  post: InstagramPost
  cleanHandle: string
}) {
  const targetUrl = post.instagram_url || post.post_url || `https://instagram.com/${cleanHandle}`

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group/card relative block aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-100 border border-black/5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* Admin Uploaded Image (4:5 Aspect Ratio, Never Distorted) */}
      <img
        src={post.image_url}
        alt={post.caption || 'Instagram Post'}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
      />

      {/* Subtle Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Right: Instagram Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-8 h-8 rounded-full bg-white/90 group-hover/card:bg-white text-purple-700 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform duration-300 group-hover/card:scale-110">
          <Instagram size={15} />
        </div>
      </div>

      {/* Hover Center Icon & Action Hint (Shows only on hovered card) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-300">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-charcoal text-xs font-semibold shadow-xl transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
          <Instagram size={13} className="text-purple-600" />
          <span>View on Instagram</span>
          <ExternalLink size={11} className="text-gray-500" />
        </div>
      </div>

      {/* Bottom Caption & Handle (Visible on hover if caption exists) */}
      {post.caption && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <p className="text-[11px] text-white line-clamp-2 leading-snug font-medium drop-shadow-md">
            {post.caption}
          </p>
        </div>
      )}
    </a>
  )
}

export default function InstagramReelsGallery({ posts = [], instagramHandle = 'tots_clothingclub' }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const cleanHandle = instagramHandle.replace(/^@/, '')
  const profileUrl = `https://instagram.com/${cleanHandle}`

  // Filter active posts only and sort strictly by display_order
  const activePosts = (posts || [])
    .filter(p => p.is_active !== false && p.image_url?.trim())
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  // If no posts in DB, hide gallery gracefully (no mock/fake posts)
  if (activePosts.length === 0) {
    return null
  }

  const isSingle = activePosts.length === 1

  const updateScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || isSingle) return
    setCanScrollLeft(el.scrollLeft > 15)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 15)
    const card = el.firstElementChild as HTMLElement | null
    if (card) {
      const cw = card.offsetWidth + 16
      setActiveIndex(Math.min(Math.round(el.scrollLeft / cw), activePosts.length - 1))
    }
  }, [activePosts.length, isSingle])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || isSingle) return
    updateScroll()
    el.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      el.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [updateScroll, isSingle])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const cw = card ? card.offsetWidth + 16 : 280
    el.scrollBy({ left: dir === 'left' ? -cw * 2 : cw * 2, behavior: 'smooth' })
  }

  const scrollToIdx = (i: number) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const cw = card ? card.offsetWidth + 16 : 280
    el.scrollTo({ left: i * cw, behavior: 'smooth' })
    setActiveIndex(i)
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center py-6">
      {/* ── Section Header ── */}
      <div className="space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold tracking-wider uppercase shadow-2xs">
          <Instagram size={13} className="text-purple-600" />
          <span>INSTAGRAM</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight">
          Latest from our Instagram
        </h2>

        <p className="text-xs sm:text-sm text-mid max-w-md mx-auto">
          Explore our recent moments, stories and updates.
        </p>
      </div>

      {/* ── Condition 1: When 1 Image Post exists -> Centered ── */}
      {isSingle ? (
        <div className="flex justify-center py-2 px-4">
          <div className="w-[74vw] xs:w-[260px] sm:w-[280px] md:w-[300px] max-w-[320px]">
            <InstagramImageCard
              post={activePosts[0]}
              cleanHandle={cleanHandle}
            />
          </div>
        </div>
      ) : (
        /* ── Condition 2: When Multiple Image Posts exist -> Multi-card Carousel ── */
        <div className="relative px-1">
          {/* Desktop Left Nav Button */}
          {activePosts.length > 3 && (
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous image"
              className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-border text-charcoal shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>
          )}

          {/* Desktop Right Nav Button */}
          {activePosts.length > 3 && (
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next image"
              className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-border text-charcoal shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight size={22} className="stroke-[2.5]" />
            </button>
          )}

          {/* Horizontal Gallery */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 no-scrollbar px-4 sm:px-2 md:justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activePosts.map((post, idx) => (
              <div
                key={post.id || idx}
                className="snap-center sm:snap-start flex-shrink-0 w-[60vw] xs:w-[200px] sm:w-[220px] md:w-[240px] lg:w-[250px] max-w-[260px]"
              >
                <InstagramImageCard
                  post={post}
                  cleanHandle={cleanHandle}
                />
              </div>
            ))}
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex flex-col items-center gap-1.5 pt-1 md:hidden">
            <div className="flex items-center gap-1.5">
              {activePosts.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === idx ? 'w-6 bg-purple-700' : 'w-2 bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Follow Banner Card ── */}
      <div className="max-w-xl mx-auto pt-2 pb-6">
        <div className="bg-white rounded-2xl border border-[#e8dfd2] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Instagram size={24} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm sm:text-base text-charcoal">
                Follow us @{cleanHandle}
              </h4>
              <p className="text-xs text-mid">
                Stay connected and don&apos;t miss our latest updates!
              </p>
            </div>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6b46c1] hover:bg-[#553c9a] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
          >
            <span>Follow on Instagram</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  )
}

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  Film
} from 'lucide-react'
import type { InstagramPost } from '@/lib/types'

interface Props {
  posts: InstagramPost[]
  instagramHandle?: string
}

// 5 Beautiful High Quality Sample Fallback Videos if database has no uploaded videos yet
const DEFAULT_FALLBACK_REELS: InstagramPost[] = [
  {
    id: 'demo-reel-1',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-photo-studio-34440-large.mp4',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    caption: 'Building elegant festive drops that empower everyday style.',
    tag: 'NEW DROP',
    author_name: 'tots_clothingclub',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 1,
    is_active: true
  },
  {
    id: 'demo-reel-2',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-in-a-studio-34444-large.mp4',
    image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
    caption: 'Comfort meets tailoring — sizes crafted from XS to 7XL.',
    tag: 'FLAT 50% OFF',
    author_name: 'tots_clothingclub',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 2,
    is_active: true
  },
  {
    id: 'demo-reel-3',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-studio-setting-34443-large.mp4',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    caption: 'Behind the scenes of our latest summer photoshoot.',
    tag: 'TRENDING',
    author_name: 'tots_clothingclub',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 3,
    is_active: true
  },
  {
    id: 'demo-reel-4',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-her-outfit-34441-large.mp4',
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    caption: 'Pure breathable fabrics with timeless silhouettes.',
    tag: 'BESTSELLER',
    author_name: 'tots_clothingclub',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 4,
    is_active: true
  },
  {
    id: 'demo-reel-5',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-model-putting-on-sunglasses-34442-large.mp4',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    caption: 'What we love most at TOTS: Everyday comfort you can count on.',
    tag: 'EXCLUSIVE',
    author_name: 'tots_clothingclub',
    post_url: 'https://instagram.com/tots_clothingclub',
    display_order: 5,
    is_active: true
  }
]

/** Reel Card — JS-controlled hover state (no CSS group-hover, so mobile touch is unaffected) */
function ReelCard({
  post,
  cleanHandle,
  onOpen
}: {
  post: InstagramPost
  cleanHandle: string
  onOpen: (post: InstagramPost) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // isHovered: only true on real mouse pointer hover (desktop). Never set on mobile touch.
  const [isHovered, setIsHovered] = useState(false)

  /* ── Desktop mouse events only ── */
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current && post.video_url) {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  /* ── Mobile: single tap opens modal directly, no preview ── */
  const handleClick = () => {
    onOpen(post)
  }

  const author = post.author_name || cleanHandle

  // overlay visible = NOT hovered; overlay hidden = hovered
  const overlayHidden = isHovered

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[9/16] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-black/10 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer select-none"
    >
      {/* Background Video or Thumbnail Image */}
      {post.video_url ? (
        <video
          ref={videoRef}
          src={post.video_url}
          poster={post.image_url}
          muted
          playsInline
          loop
          preload="metadata"
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      ) : (
        <img
          src={post.image_url || '/images/placeholder.jpg'}
          alt={post.caption || 'Instagram Reel'}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      )}

      {/* ── Gradient Overlay — fades OUT only when THIS card is hovered ── */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/10 to-black/35 transition-opacity duration-300"
        style={{ opacity: overlayHidden ? 0 : 1 }}
      />

      {/* ── Top Left: Reel Icon — fades OUT on hover ── */}
      <div
        className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 transition-opacity duration-300"
        style={{ opacity: overlayHidden ? 0 : 1 }}
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-md">
          <Film size={13} className="stroke-[2.2]" />
        </div>
      </div>

      {/* ── Top Right: Instagram Icon — fades OUT on hover ── */}
      <div
        className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10 transition-opacity duration-300"
        style={{ opacity: overlayHidden ? 0 : 1 }}
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-md">
          <Instagram size={14} />
        </div>
      </div>

      {/* ── Tag Badge — fades OUT on hover ── */}
      {post.tag && (
        <div
          className="absolute top-12 left-3 sm:top-14 sm:left-3.5 z-10 transition-opacity duration-300"
          style={{ opacity: overlayHidden ? 0 : 1 }}
        >
          <span className="bg-amber-400 text-charcoal font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
            {post.tag}
          </span>
        </div>
      )}

      {/* ── Center Play Button — fades OUT when THIS card is hovered on desktop ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 text-charcoal flex items-center justify-center shadow-2xl transition-all duration-300"
          style={{ opacity: overlayHidden ? 0 : 1, transform: overlayHidden ? 'scale(0.75)' : 'scale(1)' }}
        >
          <Play size={18} fill="currentColor" className="ml-0.5 text-charcoal" />
        </div>
      </div>

      {/* ── Bottom Handle — fades OUT when THIS card is hovered on desktop ── */}
      <div
        className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-10 pointer-events-none flex flex-col gap-1 transition-opacity duration-300"
        style={{ opacity: overlayHidden ? 0 : 1 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-purple-700 flex items-center justify-center font-black text-[10px] shadow-sm flex-shrink-0">
            <Instagram size={12} className="text-purple-700" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide truncate drop-shadow-md">
            {author}
          </span>
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
            ✓
          </span>
        </div>
        {post.caption && (
          <p className="text-[10px] text-white/85 line-clamp-1 leading-tight font-medium drop-shadow-xs pl-0.5">
            {post.caption}
          </p>
        )}
      </div>

      {/* ── "Watch" Badge — appears ONLY when THIS card is hovered on desktop ── */}
      {post.post_url && (
        <div
          className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 z-10 transition-opacity duration-300"
          style={{ opacity: overlayHidden ? 1 : 0 }}
        >
          <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Instagram size={9} /> Watch
          </span>
        </div>
      )}
    </div>
  )
}

/** Interactive Video Player Modal with sound & playback controls */
function VideoModal({
  post,
  cleanHandle,
  onClose
}: {
  post: InstagramPost
  cleanHandle: string
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleMute()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    if (total > 0) setProgress((current / total) * 100)
  }

  const author = post.author_name || cleanHandle

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-3xl overflow-hidden shadow-2xl w-full max-w-[380px] sm:max-w-[400px] aspect-[9/16] flex flex-col justify-between border border-white/10 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Floating Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Instagram size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white">@{author}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              </div>
              <span className="text-[10px] text-white/75">Instagram Reel</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          {post.video_url ? (
            <video
              ref={videoRef}
              src={post.video_url}
              poster={post.image_url}
              autoPlay
              playsInline
              loop
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={post.image_url || '/images/placeholder.jpg'}
              alt={post.caption || 'Reel'}
              className="w-full h-full object-cover"
            />
          )}

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/90 text-charcoal flex items-center justify-center shadow-2xl">
                <Play size={26} fill="currentColor" className="ml-1 text-charcoal" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Bar & Captions */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-3">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Caption & Tag */}
          <div className="space-y-1">
            {post.tag && (
              <span className="inline-block bg-amber-400 text-charcoal text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                {post.tag}
              </span>
            )}
            {post.caption && (
              <p className="text-xs text-white leading-snug drop-shadow-md">
                {post.caption}
              </p>
            )}
          </div>

          {/* CTA Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={togglePlay}
              className="text-white text-xs font-semibold flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <a
              href={post.post_url || `https://instagram.com/${cleanHandle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl hover:opacity-95 transition-all shadow-lg"
            >
              <Instagram size={13} />
              <span>Watch on Instagram</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstagramReelsGallery({ posts = [], instagramHandle = 'tots_clothingclub' }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)

  const cleanHandle = instagramHandle.replace(/^@/, '')
  const profileUrl = `https://instagram.com/${cleanHandle}`

  // Filter active posts
  const activePosts = posts.filter(p => p.is_active !== false).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  
  // If no posts in DB at all, use default sample reels
  const displayList = activePosts.length > 0 ? activePosts : DEFAULT_FALLBACK_REELS
  const isSingle = displayList.length === 1

  const updateScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || isSingle) return
    setCanScrollLeft(el.scrollLeft > 15)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 15)
    const card = el.firstElementChild as HTMLElement | null
    if (card) {
      const cw = card.offsetWidth + 16
      setActiveIndex(Math.min(Math.round(el.scrollLeft / cw), displayList.length - 1))
    }
  }, [displayList.length, isSingle])

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

      {/* ── Section Header (Matches exact reference screenshot) ── */}
      <div className="space-y-2 max-w-2xl mx-auto">
        {/* Purple Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold tracking-wider uppercase shadow-2xs">
          <Instagram size={13} className="text-purple-600" />
          <span>INSTAGRAM REELS</span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight">
          Latest from our Instagram
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-mid max-w-md mx-auto">
          Explore our recent moments, stories and updates.
        </p>
      </div>

      {/* ── Condition 1: When 1 Video exists -> Perfectly Centered ── */}
      {isSingle ? (
        <div className="flex justify-center py-2 px-4">
          <div className="w-[74vw] xs:w-[260px] sm:w-[280px] md:w-[300px] max-w-[320px]">
            <ReelCard
              post={displayList[0]}
              cleanHandle={cleanHandle}
              onOpen={setSelectedPost}
            />
          </div>
        </div>
      ) : (
        /* ── Condition 2: When Multiple Videos exist -> Multi-card Carousel with Peeking ── */
        <div className="relative group px-1">
          {/* Desktop Left Nav Button */}
          {displayList.length > 2 && (
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous"
              className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-border text-charcoal shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>
          )}

          {/* Desktop Right Nav Button */}
          {displayList.length > 2 && (
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next"
              className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-border text-charcoal shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight size={22} className="stroke-[2.5]" />
            </button>
          )}

          {/* Horizontal Carousel (Mobile peeking: px-4 with snap-center) */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 no-scrollbar px-4 sm:px-2 md:justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayList.map((post, idx) => (
              <div
                key={post.id || idx}
                className="snap-center sm:snap-start flex-shrink-0 w-[64vw] xs:w-[220px] sm:w-[245px] md:w-[260px] lg:w-[270px] max-w-[280px]"
              >
                <ReelCard
                  post={post}
                  cleanHandle={cleanHandle}
                  onOpen={setSelectedPost}
                />
              </div>
            ))}
          </div>

          {/* Mobile Pagination Dots & Swipe Indicator (Only for 2+ videos) */}
          <div className="flex flex-col items-center gap-1.5 pt-1 md:hidden">
            <div className="flex items-center gap-1.5">
              {displayList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIdx(idx)}
                  aria-label={`Go to video ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === idx ? 'w-6 bg-purple-700' : 'w-2 bg-purple-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-mid font-medium">
              &larr; Swipe to explore more &rarr;
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom Follow Banner Card (Matches exact reference screenshot) ── */}
      <div className="max-w-xl mx-auto pt-2 pb-6">
        <div className="bg-white rounded-2xl border border-[#e8dfd2] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            {/* Instagram Gradient Box */}
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

          {/* Follow Button */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6b46c1] hover:bg-[#553c9a] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
          >
            <span>Follow on Instagram</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>

      {/* ── Interactive Video Player Modal ── */}
      {selectedPost && (
        <VideoModal
          post={selectedPost}
          cleanHandle={cleanHandle}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  )
}

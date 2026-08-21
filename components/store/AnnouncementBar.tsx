'use client'

import React from 'react'
import Link from 'next/link'
import { Announcement } from '@/lib/types'

interface AnnouncementBarProps {
  announcements?: Announcement[]
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcements }) => {
  const text = announcements?.[0]?.text || '🚚 Free Shipping on Orders Above ₹999 | Express India Shipping'
  const link = announcements?.[0]?.link || '/shop'

  return (
    <div className="bg-tots-dark border-b border-tots-gold/20 text-tots-cream py-2 px-4 text-center text-xs tracking-wider font-medium flex items-center justify-center gap-2">
      <span>{text}</span>
      {link && (
        <Link href={link} className="underline text-tots-gold hover:text-white transition-colors ml-1">
          Shop Now
        </Link>
      )}
    </div>
  )
}

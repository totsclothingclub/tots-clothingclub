import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/context/CartContext'
import { WishlistProvider } from '@/lib/context/WishlistContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'TOTS — Premium Inclusive Fashion Brand (XS to 7XL)',
  description: 'Discover comfortable, stylish fashion designed for every body. Premium plus-size dresses, kurta sets, western wear, and modest abayas.',
  keywords: ['TOTS', 'TOTS Fashion', 'Plus Size Clothing India', 'XS to 7XL dresses', 'Modest Wear', 'Kurta Sets'],
  openGraph: {
    title: 'TOTS — Premium Inclusive Fashion Brand',
    description: 'Style Has No Size. Premium plus size and modest wear.',
    type: 'website',
    siteName: 'TOTS',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full max-w-full overflow-x-hidden">
      <body className="bg-cream text-charcoal min-h-screen flex flex-col antialiased w-full max-w-full overflow-x-hidden" style={{ background: 'var(--cream)', color: 'var(--charcoal)' }}>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Oswald, Lato } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CartProvider } from '@/lib/context/CartContext'
import { WishlistProvider } from '@/lib/context/WishlistContext'
import { AuthModal } from '@/components/store/AuthModal'

import { ConfirmProvider } from '@/components/ui/ConfirmationModal'
import { ToastProvider } from '@/components/ui/Toast'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
})

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
    <html lang="en" className={`${oswald.variable} ${lato.variable}`}>
      <body className={`${lato.className} font-sans bg-cream text-charcoal min-h-screen flex flex-col antialiased`} style={{ background: 'var(--cream)', color: 'var(--charcoal)' }}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <ConfirmProvider>
                  {children}
                  <AuthModal />
                </ConfirmProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import React from 'react'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import Link from 'next/link'
import { User, Package, Heart, Shield, LogOut, MapPin } from 'lucide-react'

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-tots-cream">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6 pb-24">
        
        {/* Profile Card Header */}
        <div className="bg-white p-6 rounded-2xl border border-tots-border shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-tots-dark text-tots-gold font-serif text-2xl font-bold flex items-center justify-center border-2 border-tots-gold">
              SK
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-tots-dark">Simran Kaur</h1>
              <p className="text-xs text-tots-gray">simran.k@example.com • +91 98765 12345</p>
              <span className="text-[10px] bg-tots-gold/20 text-tots-gold-dark font-bold px-2 py-0.5 rounded mt-1 inline-block">
                TOTS VIP Member
              </span>
            </div>
          </div>

          <Link
            href="/admin"
            className="bg-tots-wine text-white text-xs uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl hover:bg-tots-wine-hover transition-colors shadow-xs"
          >
            Switch to Admin Panel
          </Link>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link
            href="/account/orders"
            className="bg-white p-5 rounded-2xl border border-tots-border shadow-2xs hover:border-tots-gold transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-tots-beige rounded-xl text-tots-wine group-hover:bg-tots-wine group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-tots-dark group-hover:text-tots-wine transition-colors">
                My Orders & Track
              </h3>
              <p className="text-xs text-tots-gray">View recent order history and live shipping updates</p>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white p-5 rounded-2xl border border-tots-border shadow-2xs hover:border-tots-gold transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-tots-beige rounded-xl text-tots-gold group-hover:bg-tots-gold group-hover:text-white transition-colors">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-tots-dark group-hover:text-tots-wine transition-colors">
                Saved Wishlist
              </h3>
              <p className="text-xs text-tots-gray">Manage your saved dresses and outfits</p>
            </div>
          </Link>

          <div className="bg-white p-5 rounded-2xl border border-tots-border shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-tots-beige rounded-xl text-tots-dark">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-tots-dark">Saved Addresses</h3>
              <p className="text-xs text-tots-gray">42 Lotus Boulevard, Sector 128, Noida (201304)</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-tots-border shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-tots-beige rounded-xl text-tots-dark">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-tots-dark">Account Security</h3>
              <p className="text-xs text-tots-gray">Password & email authentication options</p>
            </div>
          </div>

        </div>

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

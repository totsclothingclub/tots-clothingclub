'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  FolderTree,
  Image as ImageIcon,
  PackageCheck,
  Ticket,
  MessageSquare,
  Settings,
  Users,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Instagram
} from 'lucide-react'

interface NavGroup {
  title: string
  items: {
    label: string
    href: string
    icon: React.ElementType
    badge?: string
  }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'STORE CATALOG',
    items: [
      { label: 'Products', href: '/admin/products', icon: ShoppingBag },
      { label: 'Add Product', href: '/admin/products/editor', icon: PlusCircle },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree }
    ]
  },
  {
    title: 'ORDERS',
    items: [
      { label: 'All Orders', href: '/admin/orders', icon: PackageCheck }
    ]
  },
  {
    title: 'CUSTOMERS',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare }
    ]
  },
  {
    title: 'MARKETING & CONTENT',
    items: [
      { label: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Seen on Instagram', href: '/admin/instagram', icon: Instagram },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket }
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Store Settings', href: '/admin/settings', icon: Settings }
    ]
  }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Derive active breadcrumb
  const getCurrentPageTitle = () => {
    if (pathname.includes('/admin/products/editor')) return 'Product Editor'
    if (pathname.includes('/admin/products')) return 'Products'
    if (pathname.includes('/admin/categories')) return 'Categories'
    if (pathname.includes('/admin/orders')) return 'Orders'
    if (pathname.includes('/admin/customers')) return 'Customers'
    if (pathname.includes('/admin/reviews')) return 'Reviews'
    if (pathname.includes('/admin/banners')) return 'Banners & Marketing'
    if (pathname.includes('/admin/instagram')) return 'Seen on Instagram'
    if (pathname.includes('/admin/coupons')) return 'Coupons'
    if (pathname.includes('/admin/settings')) return 'Store Settings'
    return 'Dashboard'
  }

  return (
    <div className="min-h-screen flex bg-[#f8f6f0] text-charcoal font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fadein"
        />
      )}

      {/* ── Desktop & Mobile Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-[#141414] text-cream flex flex-col justify-between border-r border-[#262626] transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {/* Logo Bar */}
          <div className="px-6 py-5 border-b border-[#222222] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <img
                src="/images/tots-logo.png"
                alt="TOTS Admin"
                className="h-7 w-auto object-contain"
              />
              <span className="w-px h-4 bg-gold/50" />
              <span className="text-[10px] uppercase tracking-widest text-gold font-medium">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-6 flex-1">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest2 text-gray-500">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isExact = pathname === item.href
                    const isSub = pathname.startsWith(item.href) && item.href !== '/admin/dashboard' && item.href !== '/admin/products'
                    const isActive = isExact || isSub || (item.href === '/admin/products' && pathname === '/admin/products')

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                          isActive
                            ? 'bg-wine text-white shadow-sm font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-[#202020]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={isActive ? 'text-gold' : 'text-gray-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] bg-gold text-charcoal px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Profile & Store link */}
        <div className="p-4 border-t border-[#222222] bg-[#0d0d0d] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#1c1c1c] text-gold text-xs font-medium rounded-lg border border-[#2a2a2a] hover:bg-gold hover:text-charcoal transition-all"
          >
            <span>Live Storefront</span>
            <ExternalLink size={13} />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center font-serif font-bold text-xs">
                TS
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">TOTS Admin</span>
                <span className="text-[10px] text-gray-400">admin@tots.in</span>
              </div>
            </div>
            <Link
              href="/"
              className="text-gray-400 hover:text-wine p-1.5 transition-colors"
              title="Return to site"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 text-charcoal hover:text-wine"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-mid">Admin</span>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="font-semibold text-charcoal">{getCurrentPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f5f1ea] border border-border rounded-lg text-xs w-56">
              <Search size={14} className="text-mid" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs w-full placeholder-gray-400"
              />
            </div>

            {/* Notification indicator */}
            <div className="relative p-2 text-charcoal hover:text-gold transition-colors cursor-pointer">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-wine rounded-full" />
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="hidden md:inline-block text-xs font-semibold text-charcoal">
                Studio Manager
              </span>
              <div className="w-7 h-7 rounded-full bg-charcoal text-cream font-serif font-bold text-xs flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import { useWishlist } from '@/lib/context/WishlistContext'
import { getAllOrders, getProducts } from '@/lib/supabase/data-service'
import { Order, Address, Product } from '@/lib/types'
import Link from 'next/link'
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Home as HomeIcon,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sparkles
} from 'lucide-react'
import { useConfirm } from '@/components/ui/ConfirmationModal'

export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth()

  const { addItem, setIsDrawerOpen } = useCart()
  const { wishlistProductIds, toggleWishlist } = useWishlist()
  const { confirm } = useConfirm()

  // Tab State: 'orders' | 'addresses' | 'wishlist' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders')

  // Auth Form State (for Guests)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Orders State
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Address Modal/Form State
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Office' | 'Other'>('Home')
  const [addrName, setAddrName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrApartment, setAddrApartment] = useState('')
  const [addrCity, setAddrCity] = useState('')
  const [addrState, setAddrState] = useState('')
  const [addrPincode, setAddrPincode] = useState('')
  const [addrIsDefault, setAddrIsDefault] = useState(false)

  // Profile Form State
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSavedMsg, setProfileSavedMsg] = useState('')

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setOrdersLoading(true)
      getAllOrders().then(orders => {
        // Filter orders for current user by email or user_id
        const filtered = orders.filter(
          o =>
            (user.email && o.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
            (user.id && o.user_id === user.id) ||
            (user.full_name && o.customer_name?.toLowerCase() === user.full_name?.toLowerCase())
        )
        setUserOrders(filtered)
        setOrdersLoading(false)
      })
    }
  }, [isAuthenticated, user?.email, user?.id, user?.full_name])

  // Fetch wishlist products when tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'wishlist') {
      setWishlistLoading(true)
      getProducts().then(products => {
        setWishlistProducts(products.filter(p => wishlistProductIds.includes(p.id)))
        setWishlistLoading(false)
      })
    }
  }, [isAuthenticated, activeTab, wishlistProductIds])

  // Sync profile fields
  useEffect(() => {
    if (user) {
      setProfileName(user.full_name || '')
      setProfilePhone(user.phone || '')
    }
  }, [user])

  // Handle Guest Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (isSignUp) {
        const res = await signup(authName, authEmail, authPhone, authPass || 'tots12345')
        if (!res.success) setAuthError(res.message || 'Failed to create account.')
      } else {
        const res = await login(authEmail, authPass || 'tots12345')
        if (!res.success) setAuthError(res.message || 'Invalid credentials.')
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Address Save
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addrName.trim() || !addrPhone.trim() || !addrStreet.trim() || !addrCity.trim() || !addrPincode.trim()) {
      return
    }

    const payload = {
      label: addrLabel,
      full_name: addrName.trim(),
      phone: addrPhone.trim(),
      street: addrStreet.trim(),
      apartment: addrApartment.trim(),
      city: addrCity.trim(),
      state: addrState.trim() || 'State',
      pincode: addrPincode.trim(),
      country: 'India',
      is_default: addrIsDefault,
    }

    if (editingAddressId) {
      await updateAddress(editingAddressId, payload)
    } else {
      await addAddress(payload)
    }

    setShowAddressModal(false)
    resetAddressForm()
  }

  const handleDeleteAddress = async (addrId: string, label?: string) => {
    const ok = await confirm({
      title: 'Delete Saved Address?',
      message: 'Are you sure you want to delete this delivery address? It will no longer be available during checkout.',
      itemName: label || 'Saved Address',
      confirmText: 'Delete Address',
      variant: 'danger',
    })
    if (ok) {
      await deleteAddress(addrId)
    }
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddrLabel('Home')
    setAddrName(user?.full_name || '')
    setAddrPhone(user?.phone || '')
    setAddrStreet('')
    setAddrApartment('')
    setAddrCity('')
    setAddrState('')
    setAddrPincode('')
    setAddrIsDefault(false)
  }

  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id || null)
    setAddrLabel((addr.label as any) || 'Home')
    setAddrName(addr.full_name)
    setAddrPhone(addr.phone)
    setAddrStreet(addr.street)
    setAddrApartment(addr.apartment || '')
    setAddrCity(addr.city)
    setAddrState(addr.state)
    setAddrPincode(addr.pincode)
    setAddrIsDefault(!!addr.is_default)
    setShowAddressModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Delivered
          </span>
        )
      case 'Processing':
      case 'Packed':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={12} /> {status}
          </span>
        )
      case 'Shipped':
      case 'Out for Delivery':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck size={12} /> {status}
          </span>
        )
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{status}</span>
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. GUEST / NOT LOGGED IN VIEW
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
        <Header />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-8 py-10 space-y-8 pb-24">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold block">
              TOTS CLUB ACCOUNT
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase text-charcoal tracking-wide">
              {isSignUp ? 'Create Your Account' : 'Sign In To Your Account'}
            </h1>
            <p className="text-xs text-mid leading-relaxed">
              Access your personalized order history, track live deliveries, manage multiple saved addresses & sync your wishlist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-w-3xl mx-auto">
            
            {/* Form Container */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-5">
              {/* Tab selector */}
              <div className="flex bg-[#ede8df] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    !isSignUp ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    isSignUp ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
                  }`}
                >
                  New Member
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                      <input
                        type="text"
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={e => setAuthPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                    <input
                      type="password"
                      value={authPass}
                      onChange={e => setAuthPass(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3.5 bg-wine text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-wine-dark transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>{authLoading ? 'Please wait...' : isSignUp ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* Benefits Sidebar */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#faf7f2] p-5 rounded-2xl border border-border space-y-3.5">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">
                  Member Privileges
                </h3>
                
                <div className="space-y-3 text-xs text-mid">
                  <div className="flex items-start gap-2.5">
                    <Package size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-charcoal block">Live Order Tracking</strong>
                      <span>Monitor every step from dispatch to door delivery.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-charcoal block">Multiple Saved Addresses</strong>
                      <span>Save and label Home, Office, or Other for 1-click checkout.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Heart size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-charcoal block">Exclusive Wishlist Sync</strong>
                      <span>Save designs across devices and get notified on stock drops.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED CUSTOMER PORTAL
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
        
        {/* Profile Card Header (Clean customer banner, NO admin switch) */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] text-gold font-heading text-xl font-bold flex items-center justify-center border-2 border-gold shadow-xs">
              {user?.full_name
                ? user.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                  {user?.full_name || 'Member'}
                </h1>
                <span className="text-[9px] bg-wine/10 text-wine font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-mid mt-0.5">
                {user?.email} {user?.phone && `• ${user.phone}`}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors border border-rose-200"
            aria-label="Sign Out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-white text-mid hover:text-charcoal hover:bg-beige/60 border border-border'
            }`}
          >
            <Package size={15} className={activeTab === 'orders' ? 'text-gold' : ''} />
            <span>My Orders & Track ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'addresses'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-white text-mid hover:text-charcoal hover:bg-beige/60 border border-border'
            }`}
          >
            <MapPin size={15} className={activeTab === 'addresses' ? 'text-gold' : ''} />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'wishlist'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-white text-mid hover:text-charcoal hover:bg-beige/60 border border-border'
            }`}
          >
            <Heart size={15} className={activeTab === 'wishlist' ? 'text-gold' : ''} />
            <span>Saved Wishlist ({wishlistProductIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-charcoal text-white shadow-xs'
                : 'bg-white text-mid hover:text-charcoal hover:bg-beige/60 border border-border'
            }`}
          >
            <User size={15} className={activeTab === 'profile' ? 'text-gold' : ''} />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: MY ORDERS & TRACKING
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-16 text-center text-xs text-mid">Loading your orders...</div>
            ) : userOrders.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-border p-8 space-y-3">
                <Package className="w-14 h-14 text-gold mx-auto stroke-1" />
                <h2 className="font-heading text-xl font-bold text-charcoal uppercase">
                  No orders placed yet
                </h2>
                <p className="text-xs text-mid max-w-sm mx-auto">
                  Your placed fashion orders and tracking updates will appear here automatically.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-wine text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-wine-dark transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              userOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mid block">ORDER ID</span>
                      <strong className="font-heading text-base text-charcoal">{order.order_number}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mid block">DATE PLACED</span>
                      <span className="text-xs font-semibold text-charcoal">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mid block">TOTAL AMOUNT</span>
                      <strong className="text-base text-wine font-bold">₹{order.total}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mid block">STATUS</span>
                      {getStatusBadge(order.order_status)}
                    </div>
                  </div>

                  {/* Tracking Strip */}
                  <div className="bg-[#faf7f2] p-3 rounded-xl border border-border/70 text-xs flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gold" />
                      <span>
                        Tracking ID: <strong className="font-mono text-charcoal">{order.tracking_number || 'TOTS-TRK-89210'}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-mid">
                      Payment: <strong>{order.payment_method} ({order.payment_status})</strong>
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2.5">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex gap-3.5 items-center p-2 rounded-xl bg-cream/40 border border-border/40">
                        <img
                          src={item.image_url || '/images/placeholder.jpg'}
                          alt={item.product_name}
                          className="w-12 h-14 object-cover rounded-lg border border-border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <h4 className="font-semibold text-charcoal truncate">{item.product_name}</h4>
                          <p className="text-[11px] text-mid mt-0.5">
                            Size: <strong className="text-charcoal">{item.size}</strong> • Color: <strong className="text-charcoal">{item.color}</strong> • Qty: <strong className="text-charcoal">{item.quantity}</strong>
                          </p>
                        </div>
                        <span className="font-bold text-xs text-wine flex-shrink-0">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: SAVED ADDRESSES (Multi-Address Manager with custom labels)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold uppercase text-charcoal">
                  Your Delivery Addresses
                </h3>
                <p className="text-xs text-mid">Save home, office, and custom addresses for instant checkout.</p>
              </div>

              <button
                type="button"
                onClick={() => { resetAddressForm(); setShowAddressModal(true); }}
                className="bg-wine text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-wine-dark transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-border p-6 space-y-3">
                <MapPin className="w-12 h-12 text-gold mx-auto stroke-1" />
                <h4 className="font-heading text-base font-bold uppercase text-charcoal">
                  No saved addresses
                </h4>
                <p className="text-xs text-mid max-w-sm mx-auto">
                  Add your primary delivery address to speed up your future orders.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => {
                  const labelIcon =
                    addr.label === 'Office' ? <Building2 size={13} /> : <HomeIcon size={13} />

                  return (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                        addr.is_default ? 'bg-white border-gold shadow-sm ring-1 ring-gold/40' : 'bg-white border-border shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 bg-[#ede8df] text-charcoal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                            {labelIcon}
                            <span>{addr.label || 'Home'}</span>
                          </span>

                          {addr.is_default && (
                            <span className="bg-gold/20 text-gold-dark text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Name & Details */}
                        <h4 className="font-bold text-charcoal text-sm">{addr.full_name}</h4>
                        <p className="text-xs text-mid mt-0.5 leading-relaxed">
                          {addr.apartment ? `${addr.apartment}, ` : ''}{addr.street}
                        </p>
                        <p className="text-xs text-mid font-medium">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-xs text-charcoal font-semibold mt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                        {!addr.is_default && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id!)}
                            className="text-xs font-semibold text-wine hover:text-gold transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                        {addr.is_default && <span className="text-[11px] text-gold font-medium">Default Delivery</span>}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(addr)}
                            className="p-1 text-mid hover:text-charcoal transition-colors"
                            aria-label="Edit address"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id!, `${addr.label || 'Address'} - ${addr.city}`)}
                            className="p-1 text-mid hover:text-rose-600 transition-colors"
                            aria-label="Delete address"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: SAVED WISHLIST
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold uppercase text-charcoal">
                  Your Saved Wishlist
                </h3>
                <p className="text-xs text-mid">Items you’ve marked as favorites for future purchases.</p>
              </div>
            </div>

            {wishlistLoading ? (
              <div className="py-16 text-center text-xs text-mid">Loading your wishlist...</div>
            ) : wishlistProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-border p-8 space-y-3">
                <Heart className="w-14 h-14 text-gold mx-auto stroke-1" />
                <h4 className="font-heading text-xl font-bold text-charcoal uppercase">
                  Your wishlist is empty
                </h4>
                <p className="text-xs text-mid max-w-sm mx-auto">
                  Click the heart icon on any product to save it to your club account.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-wine text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-wine-dark transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white rounded-2xl border border-border shadow-2xs flex gap-3.5 items-center justify-between"
                  >
                    <img
                      src={prod.primary_image}
                      alt={prod.name}
                      className="w-16 h-20 object-cover rounded-xl border border-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${prod.slug}`}>
                        <h4 className="font-semibold text-charcoal text-xs hover:text-wine transition-colors truncate">
                          {prod.name}
                        </h4>
                      </Link>
                      <p className="text-wine font-bold text-xs mt-0.5">
                        ₹{(prod.sale_price ?? prod.regular_price).toLocaleString('en-IN')}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (prod.variants?.[0]) {
                              addItem(prod, prod.variants[0], 1)
                              setIsDrawerOpen(true)
                            }
                          }}
                          className="bg-charcoal text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg hover:bg-wine transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(prod)}
                          className="p-1 text-mid hover:text-rose-600 transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: PROFILE SETTINGS
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs max-w-xl space-y-4">
            <h3 className="font-heading text-lg font-bold uppercase text-charcoal">
              Account Profile
            </h3>

            {profileSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full text-xs p-2.5 bg-gray-100 rounded-xl border border-border text-mid cursor-not-allowed"
                />
                <span className="text-[10px] text-mid mt-0.5 block">Email cannot be changed directly.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream rounded-xl border border-border focus:bg-white focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileSavedMsg('Profile updated successfully!')
                  setTimeout(() => setProfileSavedMsg(''), 3000)
                }}
                className="py-2.5 px-6 bg-wine text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-wine-dark transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────
          ADDRESS MODAL (ADD / EDIT)
      ───────────────────────────────────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadein">
          <div className="relative w-full max-w-md bg-cream border border-gold/30 rounded-2xl shadow-2xl overflow-hidden animate-fadeup">
            
            <div className="bg-[#141414] text-cream px-6 py-4 flex items-center justify-between border-b border-[#262626]">
              <h3 className="font-heading text-base font-bold uppercase tracking-wide">
                {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Close"
              >
                <LogOut size={16} className="rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-3.5">
              {/* Address Label Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {(['Home', 'Office', 'Other'] as const).map(lbl => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddrLabel(lbl)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        addrLabel === lbl
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-white text-mid border-border hover:border-gold'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={addrName}
                  onChange={e => setAddrName(e.target.value)}
                  placeholder="Enter recipient full name"
                  required
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={e => setAddrPhone(e.target.value)}
                  placeholder="+91 85940 41490"
                  required
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Street Address & House / Plot No. *
                </label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={e => setAddrStreet(e.target.value)}
                  placeholder="e.g. 42 Lotus Boulevard, Sector 128"
                  required
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Apartment / Suite / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addrApartment}
                  onChange={e => setAddrApartment(e.target.value)}
                  placeholder="e.g. Apt 402, Tower B"
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={e => setAddrCity(e.target.value)}
                    placeholder="e.g. Noida"
                    required
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={addrPincode}
                    onChange={e => setAddrPincode(e.target.value)}
                    placeholder="e.g. 201304"
                    required
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={e => setAddrIsDefault(e.target.checked)}
                  className="accent-wine w-4 h-4 rounded"
                />
                <span className="text-xs text-charcoal font-medium">Set as default delivery address</span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold hover:bg-beige"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-wine text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-wine-dark"
                >
                  Save Address
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

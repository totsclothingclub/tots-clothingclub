'use client'

import React, { useState } from 'react'
import { X, Lock, Mail, User, Phone, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMessage, login, signup } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (isSignUp && !fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const res = await signup(fullName, email, phone, password || 'tots12345')
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to TOTS.')
        } else {
          setErrorMsg(res.message || 'Failed to create account. Please try again.')
        }
      } else {
        const res = await login(email, password || 'tots12345')
        if (res.success) {
          setSuccessMsg('Signed in successfully!')
        } else {
          setErrorMsg(res.message || 'Invalid credentials. Please try again.')
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadein">
      <div className="relative w-full max-w-md bg-cream border border-gold/30 rounded-2xl shadow-2xl overflow-hidden animate-fadeup">
        
        {/* Header Ribbon */}
        <div className="bg-[#141414] text-cream px-6 py-5 flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <img src="/images/tots-logo.png" alt="TOTS" className="h-7 w-auto object-contain" />
          </div>
          <button
            onClick={closeAuthModal}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Banner if prompted by an action (like Wishlist) */}
        {authModalMessage && (
          <div className="bg-wine/10 border-b border-wine/20 px-6 py-3 flex items-center gap-2.5 text-xs text-wine font-medium">
            <Sparkles size={15} className="text-gold flex-shrink-0" />
            <span>{authModalMessage}</span>
          </div>
        )}

        <div className="p-6 sm:p-7 space-y-5">
          {/* Tabs */}
          <div className="flex bg-[#ede8df] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                !isSignUp ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isSignUp ? 'bg-white text-charcoal shadow-xs' : 'text-mid hover:text-charcoal'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center">
            <h2 className="font-heading text-xl font-bold text-charcoal uppercase tracking-wide">
              {isSignUp ? 'Join TOTS Clothing Club' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-mid mt-0.5">
              {isSignUp
                ? 'Create an account to save dresses, track orders & manage addresses'
                : 'Sign in to access your saved wishlist, orders & multiple addresses'}
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none text-charcoal"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none text-charcoal"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none text-charcoal"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-white rounded-xl border border-border focus:border-gold focus:outline-none text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-charcoal"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-wine text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-wine-dark transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create My Account' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

        </div>

      </div>
    </div>
  )
}

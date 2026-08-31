'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      // Successful login
      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setError('A network error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* Background decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-wine/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card Container */}
        <div className="bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <img
                src="/images/tots-logo.png"
                alt="TOTS Clothing Club"
                className="h-8 w-auto object-contain"
              />
              <span className="w-px h-5 bg-gold/60" />
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                Admin
              </span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-cream tracking-wide">
              Admin Portal
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-light">
              Enter your credentials to access the store management console
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User size={16} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#101012] border border-stone-800 rounded-xl text-cream text-sm placeholder-stone-600 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-[#101012] border border-stone-800 rounded-xl text-cream text-sm placeholder-stone-600 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-wine to-[#73182b] hover:from-[#73182b] hover:to-wine text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-wine/25 hover:shadow-wine/40 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck size={14} className="text-gold/80" />
            <span>End-to-End Encrypted Admin Session</span>
          </div>

        </div>

        {/* Back to Live Site link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-gold transition-colors font-medium inline-flex items-center gap-1.5"
          >
            <span>&larr; Return to Storefront</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-cream">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
    warning: (message: string, title?: string, duration?: number) => void
    info: (message: string, title?: string, duration?: number) => void
    custom: (item: Omit<ToastItem, 'id'>) => void
    dismiss: (id: string) => void
  }
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Global emitter so toast can also be called outside React tree if needed
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void
const listeners = new Set<ToastListener>()

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    listeners.forEach(l => l({ type: 'success', message, title, duration }))
  },
  error: (message: string, title?: string, duration?: number) => {
    listeners.forEach(l => l({ type: 'error', message, title, duration }))
  },
  warning: (message: string, title?: string, duration?: number) => {
    listeners.forEach(l => l({ type: 'warning', message, title, duration }))
  },
  info: (message: string, title?: string, duration?: number) => {
    listeners.forEach(l => l({ type: 'info', message, title, duration }))
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastItem = { ...item, id }
    setToasts(prev => [...prev.slice(-4), newToast]) // Keep max 5 toasts on screen
  }, [])

  useEffect(() => {
    const listener: ToastListener = (item) => addToast(item)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [addToast])

  const contextValue: ToastContextType = {
    toast: {
      success: (msg, title, duration) => addToast({ type: 'success', message: msg, title, duration }),
      error: (msg, title, duration) => addToast({ type: 'error', message: msg, title, duration }),
      warning: (msg, title, duration) => addToast({ type: 'warning', message: msg, title, duration }),
      info: (msg, title, duration) => addToast({ type: 'info', message: msg, title, duration }),
      custom: addToast,
      dismiss: removeToast,
    }
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Floating Toast Viewport */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map(t => (
          <ToastCard key={t.id} item={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const duration = item.duration ?? 4000
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef<number>(Date.now())
  const remainingRef = useRef<number>(duration)

  useEffect(() => {
    if (duration <= 0) return

    let animationFrame: number
    const updateProgress = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current
        const remaining = Math.max(0, remainingRef.current - elapsed)
        const pct = (remaining / duration) * 100
        setProgress(pct)

        if (remaining <= 0) {
          onDismiss()
          return
        }
      }
      animationFrame = requestAnimationFrame(updateProgress)
    }

    animationFrame = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(animationFrame)
  }, [isPaused, duration, onDismiss])

  const handleMouseEnter = () => {
    setIsPaused(true)
    remainingRef.current = (progress / 100) * duration
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    startTimeRef.current = Date.now()
  }

  const getVariant = () => {
    switch (item.type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={17} className="text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200/80',
          accentBorder: 'border-l-emerald-500',
          barColor: 'bg-emerald-500',
          defaultTitle: 'Success',
        }
      case 'error':
        return {
          icon: <AlertCircle size={17} className="text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200/80',
          accentBorder: 'border-l-rose-500',
          barColor: 'bg-rose-500',
          defaultTitle: 'Error',
        }
      case 'warning':
        return {
          icon: <AlertTriangle size={17} className="text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200/80',
          accentBorder: 'border-l-amber-500',
          barColor: 'bg-amber-500',
          defaultTitle: 'Warning',
        }
      case 'info':
      default:
        return {
          icon: <Info size={17} className="text-blue-600" />,
          iconBg: 'bg-blue-50 border-blue-200/80',
          accentBorder: 'border-l-blue-500',
          barColor: 'bg-blue-500',
          defaultTitle: 'Notice',
        }
    }
  }

  const { icon, iconBg, accentBorder, barColor, defaultTitle } = getVariant()

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md rounded-xl border border-border/80 border-l-[3.5px] ${accentBorder} shadow-panel p-3.5 transition-all animate-in slide-in-from-top-3 fade-in duration-200 hover:shadow-lg`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconBg}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0 pr-4 space-y-0.5">
          <p className="text-xs font-semibold text-charcoal tracking-tight">
            {item.title || defaultTitle}
          </p>
          <p className="text-[11px] text-mid leading-relaxed break-words">
            {item.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-mid/60 hover:text-charcoal p-1 rounded-md hover:bg-beige-light transition-colors -mr-1 -mt-1"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress countdown bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-border/40 overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

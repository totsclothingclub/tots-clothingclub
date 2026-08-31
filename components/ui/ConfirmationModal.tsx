'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Trash2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ConfirmVariant = 'danger' | 'warning' | 'info'

export interface ConfirmOptions {
  title?: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  itemName?: string
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })
  const [isBusy, setIsBusy] = useState(false)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    setIsBusy(false)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleClose = (result: boolean) => {
    setIsOpen(false)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const variant = options.variant || 'danger'

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
          Icon: AlertTriangle,
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        }
      case 'info':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
          Icon: Info,
          btnBg: 'bg-tots-wine hover:bg-tots-wine-hover text-white focus:ring-wine',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        }
      case 'danger':
      default:
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
          Icon: Trash2,
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        }
    }
  }

  const { iconBg, Icon, btnBg, badgeBg } = getVariantStyles()

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => handleClose(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-panel border border-border overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 space-y-5">
            {/* Close Button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 p-1.5 text-mid hover:text-charcoal hover:bg-beige-light rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}>
                <Icon size={22} />
              </div>
              <div className="space-y-1 pr-4">
                <h3 className="font-serif text-lg font-bold text-charcoal leading-snug">
                  {options.title || (variant === 'danger' ? 'Confirm Deletion' : 'Confirm Action')}
                </h3>
                {options.itemName && (
                  <div className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border max-w-full truncate ${badgeBg}`}>
                    {options.itemName}
                  </div>
                )}
              </div>
            </div>

            {/* Message Body */}
            <div className="text-xs text-mid leading-relaxed pl-15">
              {typeof options.message === 'string' ? (
                <p>{options.message}</p>
              ) : (
                options.message
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => handleClose(false)}
                disabled={isBusy}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-charcoal bg-white hover:bg-beige-light transition-all disabled:opacity-50"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setIsBusy(true)
                  handleClose(true)
                }}
                disabled={isBusy}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${btnBg}`}
              >
                {options.confirmText || (variant === 'danger' ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

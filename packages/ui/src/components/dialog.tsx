'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 模糊背景 */}
      <div className="absolute inset-0 bg-[var(--color-text-primary)]/30 backdrop-blur-sm animate-fade-in" />

      {/* 弹窗内容 */}
      <div className="glass-card relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in">
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {children}
      </div>
    </div>,
    document.body
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('pr-8', className)}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('flex justify-end gap-2', className)}>
      {children}
    </div>
  )
}

interface DialogCloseProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline'
  className?: string
}

export function DialogClose({ children, onClick, variant = 'default', className }: DialogCloseProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
        variant === 'default'
          ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
          : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        className
      )}
    >
      {children}
    </button>
  )
}

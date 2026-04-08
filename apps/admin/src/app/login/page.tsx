'use client'

import { useActionState } from 'react'
import { Button } from '@workspace/ui/button'
import { Input } from '@workspace/ui/input'
import { loginAction } from '@/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-bg">
      {/* 装饰性渐变球 */}
      <div className="blob blob-1 animate-float" />
      <div className="blob blob-2 animate-float" style={{ animationDelay: '-3s' }} />

      {/* 渐变网格 */}
      <div className="absolute inset-0 gradient-grid opacity-40" />

      {/* 登录卡片 */}
      <div className="relative w-full max-w-sm px-6">
        <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white shadow-xl shadow-[var(--color-primary)]/25">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L2 12l10 9 10-9-10-9z" />
                <path d="M12 8l4 4-4 4-4-4 4-4z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
              管理后台
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              即刻造梦 · 创意工作站
            </p>
          </div>

          {/* 表单 */}
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-xl bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                账号
              </label>
              <Input
                name="account"
                placeholder="请输入管理员账号"
                required
                className="h-12 rounded-xl border-[var(--color-border)] bg-white/80 transition-all duration-200 focus-visible:border-[var(--color-primary)] focus-visible:ring-[var(--color-primary)]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                密码
              </label>
              <Input
                name="password"
                type="password"
                placeholder="请输入密码"
                required
                className="h-12 rounded-xl border-[var(--color-border)] bg-white/80 transition-all duration-200 focus-visible:border-[var(--color-primary)] focus-visible:ring-[var(--color-primary)]/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] border-0 text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  登录
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12,5 19,12 12,19" />
                  </svg>
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* 底部版权 */}
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          © 2024 即刻造梦 Creative Workstation
        </p>
      </div>
    </div>
  )
}

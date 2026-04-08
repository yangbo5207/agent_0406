import { redirect } from 'next/navigation'
import { apiGetMe } from '@/lib/api/auth'
import { logoutAction } from '@/actions/auth'
import { DashboardIcon, UsersIcon, SettingsIcon, LogOutIcon } from './icons'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user
  try {
    user = await apiGetMe()
  } catch {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-xl">
        {/* Logo 区域 */}
        <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white shadow-lg shadow-[var(--color-primary)]/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 12l10 9 10-9-10-9z" />
              <path d="M12 8l4 4-4 4-4-4 4-4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-[var(--color-text-primary)]">即刻造梦</h1>
            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase">创作工作站</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a
            href="/dashboard"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-primary)]/8 hover:text-[var(--color-primary)]"
          >
            <UsersIcon className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            <span>用户管理</span>
          </a>
        </nav>

        {/* 用户信息 & 退出 */}
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--color-bg-elevated)]/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-sm font-semibold text-white">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{user.account}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>退出登录</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 ml-64">
        {/* 顶部条 */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">管理后台</span>
            <span className="text-[var(--color-text-muted)]">/</span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">用户管理</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </span>
          </div>
        </header>

        {/* 主内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

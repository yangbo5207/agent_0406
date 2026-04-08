import { apiGetUsers } from '@/lib/api/users'
import { UserTable } from './user-table'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>
}) {
  const { phone } = await searchParams
  const allUsers = await apiGetUsers()
  const users = allUsers.filter((u) => u.role !== 'ADMIN')

  const filteredUsers = phone
    ? users.filter((u) => u.phone?.includes(phone))
    : users

  // 计算统计数据
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length
  const totalCredits = users.reduce((sum, u) => sum + (Number(u.creditBalance) || 0), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
            用户管理
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            管理创意工作站的所有用户账户
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-1 animate-ready">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                总用户数
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">
                {users.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3.5" />
                <path d="M3 19v-1a5 5 0 0 1 5-5h1" />
                <path d="M16 11a4 4 0 0 1 4 4v2a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4a4 4 0 0 1 4-4h.5" />
                <circle cx="18" cy="7" r="2.5" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
            <span>{activeUsers} 位活跃用户</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-2 animate-ready">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                活跃用户
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">
                {activeUsers}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success)]/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span className="text-[var(--color-success)]">+12%</span>
            <span>较上月</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-3 animate-ready">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                总额度余额
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">
                {totalCredits.toLocaleString()}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-warning)]/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span>平台总消耗</span>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="animate-fade-in-up stagger-4 animate-ready">
        <UserTable users={filteredUsers} initialPhone={phone ?? ''} />
      </div>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Input } from '@workspace/ui/input'
import { Button } from '@workspace/ui/button'
import { Badge } from '@workspace/ui/badge'
import { Dialog, DialogHeader, DialogFooter, DialogClose } from '@workspace/ui/dialog'
import { SearchIcon } from '../icons'
import type { User } from '@/lib/api/types'

function getNextMonthDate() {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toISOString().split('T')[0]
}

function toDateInputValue(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toISOString().split('T')[0]
}

function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function UserTable({
  users,
  initialPhone,
}: {
  users: User[]
  initialPhone: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(initialPhone)

  const [renewUser, setRenewUser] = useState<User | null>(null)
  const [renewDate, setRenewDate] = useState(getNextMonthDate())

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue) {
      params.set('phone', searchValue)
    } else {
      params.delete('phone')
    }
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      {/* 搜索栏 */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            placeholder="搜索手机号..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 pl-9 rounded-xl border-[var(--color-border)] bg-white/80 transition-all duration-200 focus-visible:border-[var(--color-primary)] focus-visible:ring-[var(--color-primary)]/20"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isPending}
          className="h-10 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] border-0 text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--color-primary)]/25 disabled:opacity-60"
        >
          <SearchIcon className="h-4 w-4" />
          <span>搜索</span>
        </Button>
      </div>

      {/* 表格容器 */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isPending ? 'opacity-60' : ''}`}>
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  账号
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  名称
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  手机号
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  角色
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  状态
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  额度余额
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  最后登录
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  创建时间
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  到期时间
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-[var(--color-text-muted)]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="text-sm text-[var(--color-text-muted)]">暂无用户数据</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-[var(--color-primary)]/5"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-5 py-3.5 font-mono text-[var(--color-text-secondary)]">
                      {user.account}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--color-text-primary)]">
                      {user.name}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                      {user.phone ?? '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="rounded-lg bg-[var(--color-info)]/10 text-[var(--color-info)] border-0">
                        用户
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.status === 'ACTIVE' ? (
                        <Badge className="rounded-lg border-0 bg-[var(--color-success)]/10 text-[var(--color-success)]">
                          <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"></span>
                          正常
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-lg">
                          禁用
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-medium text-[var(--color-text-primary)]">
                        {user.creditBalance}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                      {formatDate(user.expiresAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRenewUser(user)
                          setRenewDate(getNextMonthDate())
                        }}
                        className="h-7 rounded-lg border-[var(--color-border)] text-xs font-medium transition-all duration-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        续期
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 表尾 */}
        {users.length > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30 px-5 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              共 <span className="font-medium text-[var(--color-text-primary)]">{users.length}</span> 位用户
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              当前页面显示 {users.length} 条
            </p>
          </div>
        )}
      </div>

      {/* 续期弹窗 */}
      <Dialog open={!!renewUser} onClose={() => setRenewUser(null)}>
        <div className="animate-scale-in">
          <DialogHeader className="font-display text-lg font-semibold">
            为 {renewUser?.name} 续期
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              选择到期时间
            </label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={renewDate}
              onChange={(e) => setRenewDate(e.target.value)}
              className="h-11 rounded-xl border-[var(--color-border)]"
            />
          </div>
          <DialogFooter className="mt-6 gap-2">
            <DialogClose
              onClick={() => setRenewUser(null)}
              className="h-10 rounded-xl px-4 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              取消
            </DialogClose>
            <DialogClose
              onClick={() => {
                console.log('Renew', renewUser?.id, 'to', renewDate)
                setRenewUser(null)
              }}
              className="h-10 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] border-0 px-4 text-sm font-medium text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/25"
            >
              确认续期
            </DialogClose>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  )
}

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiLogin } from '@/lib/api/auth'
import { setAuthCookies, clearAuthCookies } from '@/lib/api/fetch-client'

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData,
) {
  const account = formData.get('account') as string
  const password = formData.get('password') as string

  if (!account || !password) {
    return { error: '请输入账号和密码' }
  }

  try {
    const result = await apiLogin(account, password)
    const cookieStore = await cookies()
    setAuthCookies(cookieStore, result.accessToken, result.refreshToken)
  } catch {
    return { error: '账号或密码错误' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    try {
      await fetch(
        `${process.env.API_BASE_URL || 'http://localhost:3002'}/auth/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        },
      )
    } catch {
      // ignore — clear cookies regardless
    }
  }

  clearAuthCookies(cookieStore)
  redirect('/login')
}

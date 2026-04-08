import { cookies } from 'next/headers'
import type { ApiError } from './types'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

export class ApiRequestError extends Error {
  constructor(
    public statusCode: number,
    public body: ApiError,
  ) {
    super(typeof body.message === 'string' ? body.message : body.message[0])
  }
}

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
  skipAuth?: boolean
}

export async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...init } = options

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (response.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshTokens()
    if (refreshed) {
      const newCookieStore = await cookies()
      const newAccessToken = newCookieStore.get('access_token')?.value
      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`
      }
      response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      statusCode: response.status,
      message: response.statusText,
    }))
    throw new ApiRequestError(response.status, body)
  }

  return response.json() as Promise<T>
}

async function tryRefreshTokens(): Promise<boolean> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearAuthCookies(cookieStore)
      return false
    }

    const data = await response.json()
    setAuthCookies(cookieStore, data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

export function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  accessToken: string,
  refreshToken: string,
) {
  const secure = process.env.NODE_ENV === 'production'

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 900,
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })
}

export function clearAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

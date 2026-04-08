import { fetchApi } from './fetch-client'
import type { LoginResponse, User } from './types'

export async function apiLogin(account: string, password: string) {
  return fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account, password }),
    skipAuth: true,
  })
}

export async function apiGetMe() {
  return fetchApi<User>('/auth/me')
}

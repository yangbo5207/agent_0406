import { fetchApi } from './fetch-client'
import type { CreateUserRequest, User } from './types'

export async function apiGetUsers() {
  return fetchApi<User[]>('/users')
}

export async function apiGetUser(id: string) {
  return fetchApi<User>(`/users/${id}`)
}

export async function apiCreateUser(data: CreateUserRequest) {
  return fetchApi<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

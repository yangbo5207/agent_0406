// -- Response types (mirror server DTOs) --

export interface UserTokenQuota {
  gptTokens: number
  geminiTokens: number
  jmTokens: number
}

export interface User {
  id: string
  account: string
  phone: string | null
  name: string
  role: string
  status: string
  creditBalance: string
  expiresAt: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  quotas: UserTokenQuota
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// -- Request types --

export interface LoginRequest {
  account: string
  password: string
}

export interface CreateUserRequest {
  account?: string
  phone: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
  creditBalance?: number
  expiresAt?: string
  gptTokens?: number
  geminiTokens?: number
  jmTokens?: number
}

// -- Error shape from NestJS --

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

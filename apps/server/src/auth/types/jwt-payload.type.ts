export type JwtPayload = {
  sub: string
  account: string
  role: string
  sid: string
  type: 'access' | 'refresh'
}

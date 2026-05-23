export interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export interface CookieStorage {
  [domain: string]: Cookie[]
}
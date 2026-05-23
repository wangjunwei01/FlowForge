export type { AuthConfig, ProxyConfig, SSLConfig } from './node.types'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export type HTTPBodyType = 'json' | 'form' | 'raw' | 'binary' | 'none'

export type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2'

export type ProxyType = 'http' | 'socks5'

export interface HTTPBody {
  type: HTTPBodyType
  content: string
  binaryFilePath?: string
}

export interface HTTPRequestConfig {
  method: HTTPMethod
  url: string
  headers: Record<string, string>
  params: Record<string, string>
  body?: HTTPBody
  auth?: import('./node.types').AuthConfig
  timeout?: number
  followRedirects?: boolean
  proxy?: import('./node.types').ProxyConfig
  ssl?: import('./node.types').SSLConfig
}

export interface HTTPResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  duration: number
}
import { invoke } from '@tauri-apps/api/core'

export interface HttpRequestOptions {
  method: string
  url: string
  headers?: Record<string, string>
  params?: Record<string, string>
  body?: {
    type: 'json' | 'form' | 'raw' | 'binary' | 'none'
    content: string
    binaryFilePath?: string
  }
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'apikey'
    basic?: { username: string; password: string }
    bearer?: { token: string }
    apikey?: { key: string; value: string; addTo: 'header' | 'query' }
  }
  timeout?: number
  followRedirects?: boolean
}

export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
}

interface RustHttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  duration: number
}

/**
 * Execute an HTTP request via Tauri backend
 */
export async function executeHttpRequest(options: HttpRequestOptions, cancelTokenId?: string): Promise<HttpResponse> {
  try {
    // Build auth config matching Rust's tagged enum format
    let authConfig: Record<string, unknown> | undefined
    if (options.auth && options.auth.type !== 'none') {
      switch (options.auth.type) {
        case 'basic':
          authConfig = {
            type: 'basic',
            username: options.auth.basic?.username ?? '',
            password: options.auth.basic?.password ?? '',
          }
          break
        case 'bearer':
          authConfig = {
            type: 'bearer',
            token: options.auth.bearer?.token ?? '',
          }
          break
        case 'apikey':
          authConfig = {
            type: 'apikey',
            key: options.auth.apikey?.key ?? '',
            value: options.auth.apikey?.value ?? '',
            addTo: options.auth.apikey?.addTo ?? 'header',
          }
          break
      }
    }

    const response = await invoke<RustHttpResponse>('http_request', {
      request: {
        method: options.method,
        url: options.url,
        headers: options.headers ?? {},
        params: options.params ?? {},
        body: options.body && options.body.type !== 'none' ? {
          type: options.body.type,
          content: options.body.content ?? '',
          binaryFilePath: options.body.binaryFilePath,
        } : null,
        auth: authConfig ?? null,
        timeout: options.timeout ?? 30000,
        followRedirects: options.followRedirects ?? true,
      },
      cancelTokenId: cancelTokenId ?? null,
    })

    // Map Rust response to frontend format
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.body,
      time: response.duration,
      size: response.size,
    }
  } catch (error) {
    const err = error as { message?: string }
    throw new Error(err.message ?? 'HTTP request failed')
  }
}

/**
 * Cancel an in-progress HTTP request
 */
export async function cancelHttpRequest(cancelTokenId: string): Promise<void> {
  await invoke('http_cancel', { cancelTokenId })
}

/**
 * Parse cURL command and extract request options
 */
export function parseCurlCommand(curlCommand: string): HttpRequestOptions | null {
  try {
    const result: HttpRequestOptions = {
      method: 'GET',
      url: '',
      headers: {},
      params: {},
    }

    // Remove line breaks and extra spaces
    const cleaned = curlCommand.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim()

    // Extract method
    const methodMatch = cleaned.match(/-X\s+(['"]?)(\w+)\1/i)
    if (methodMatch) {
      result.method = methodMatch[2]!.toUpperCase()
    } else if (cleaned.includes('--data') || cleaned.includes('-d')) {
      result.method = 'POST'
    }

    // Extract URL - find the first argument that looks like a URL
    const urlMatch = cleaned.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/)
    if (urlMatch) {
      result.url = urlMatch[1]!
    }

    // Extract headers
    const headerRegex = /-H\s+(['"])([^'"]+)\1/g
    let headerMatch
    while ((headerMatch = headerRegex.exec(cleaned)) !== null) {
      const [key, ...valueParts] = headerMatch[2]!.split(':')
      if (key && valueParts.length > 0) {
        result.headers![key.trim()] = valueParts.join(':').trim()
      }
    }

    // Extract body data - handle quoted strings with escaped quotes
    const dataIdx = cleaned.indexOf('-d ')
    const dataRawIdx = cleaned.indexOf('--data ')
    const dataStart = dataIdx !== -1 ? dataIdx : dataRawIdx
    if (dataStart !== -1) {
      // Find the quote character after -d or --data
      const afterFlag = cleaned.slice(dataStart + (dataIdx !== -1 ? 3 : 7)).trim()
      const quoteChar = afterFlag[0]
      if (quoteChar === "'" || quoteChar === '"') {
        // Find the matching closing quote (handling escapes)
        let content = ''
        let i = 1
        while (i < afterFlag.length) {
          if (afterFlag[i] === '\\' && i + 1 < afterFlag.length) {
            // Handle escaped quote
            if (afterFlag[i + 1] === quoteChar) {
              content += quoteChar
              i += 2
            } else if (afterFlag[i + 1] === "'") {
              content += "'"
              i += 2
            } else {
              content += afterFlag[i]
              i += 1
            }
          } else if (afterFlag[i] === quoteChar) {
            // Closing quote found
            break
          } else {
            content += afterFlag[i]
            i += 1
          }
        }
        result.body = {
          type: 'raw',
          content,
        }
        // Check if it's JSON
        if (result.headers!['Content-Type']?.includes('json') || content.startsWith('{') || content.startsWith('[')) {
          result.body.type = 'json'
        }
      }
    }

    // Extract Basic auth
    const basicAuthMatch = cleaned.match(/-u\s+(['"])([^'"]+)\1/)
    if (basicAuthMatch) {
      const [username, password] = basicAuthMatch[2]!.split(':')
      result.auth = {
        type: 'basic',
        basic: { username: username ?? '', password: password ?? '' },
      }
    }

    // Extract Bearer token
    const bearerMatch = cleaned.match(/-H\s+(['"])Authorization:\s*Bearer\s+([^'"]+)\1/i)
    if (bearerMatch) {
      result.auth = {
        type: 'bearer',
        bearer: { token: bearerMatch[2]! },
      }
    }

    return result.url ? result : null
  } catch {
    return null
  }
}

/**
 * Convert request options to cURL command
 */
export function toCurlCommand(options: HttpRequestOptions): string {
  const parts: string[] = ['curl']

  // Method
  if (options.method !== 'GET') {
    parts.push(`-X ${options.method}`)
  }

  // URL
  parts.push(`'${options.url}'`)

  // Headers
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      parts.push(`-H '${key}: ${value}'`)
    }
  }

  // Body
  if (options.body && options.body.type !== 'none' && options.body.content) {
    parts.push(`-d '${options.body.content.replace(/'/g, "'\\''")}'`)
  }

  // Auth
  if (options.auth) {
    if (options.auth.type === 'basic' && options.auth.basic) {
      parts.push(`-u '${options.auth.basic.username}:${options.auth.basic.password}'`)
    } else if (options.auth.type === 'bearer' && options.auth.bearer) {
      parts.push(`-H 'Authorization: Bearer ${options.auth.bearer.token}'`)
    } else if (options.auth.type === 'apikey' && options.auth.apikey) {
      if (options.auth.apikey.addTo === 'header') {
        parts.push(`-H '${options.auth.apikey.key}: ${options.auth.apikey.value}'`)
      }
    }
  }

  return parts.join(' \\\n  ')
}

/**
 * Convert request options to Python requests code
 */
export function toPythonCode(options: HttpRequestOptions): string {
  const lines: string[] = ['import requests', '']

  // Build headers dict
  const headers: Record<string, string> = { ...options.headers }
  if (options.auth?.type === 'bearer' && options.auth.bearer) {
    headers['Authorization'] = `Bearer ${options.auth.bearer.token}`
  }

  if (Object.keys(headers).length > 0) {
    lines.push('headers = {')
    for (const [key, value] of Object.entries(headers)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('}')
    lines.push('')
  }

  // Build auth
  let authLine = ''
  if (options.auth?.type === 'basic' && options.auth.basic) {
    authLine = `, auth=('${options.auth.basic.username}', '${options.auth.basic.password}')`
  }

  // Build params
  if (options.params && Object.keys(options.params).length > 0) {
    lines.push('params = {')
    for (const [key, value] of Object.entries(options.params)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('}')
    lines.push('')
  }

  // Make request
  const hasHeaders = Object.keys(headers).length > 0
  const hasParams = options.params && Object.keys(options.params).length > 0
  const hasBody = options.body && options.body.type !== 'none'

  let requestLine = `response = requests.${options.method.toLowerCase()}('${options.url}'`
  if (hasHeaders) requestLine += ', headers=headers'
  if (hasParams) requestLine += ', params=params'
  if (hasBody && options.body) {
    if (options.body.type === 'json') {
      requestLine += `, json=${options.body.content}`
    } else {
      requestLine += `, data='${options.body.content}'`
    }
  }
  requestLine += authLine
  requestLine += ')'
  lines.push(requestLine)
  lines.push('')
  lines.push('print(response.status_code)')
  lines.push('print(response.json())')

  return lines.join('\n')
}

/**
 * Convert request options to axios code
 */
export function toAxiosCode(options: HttpRequestOptions): string {
  const lines: string[] = ['import axios from \'axios\'', '']

  // Build config object
  const configObj: Record<string, unknown> = {
    method: options.method.toLowerCase(),
    url: options.url,
  }

  // Headers
  const headers: Record<string, string> = { ...options.headers }
  if (options.auth?.type === 'bearer' && options.auth.bearer) {
    headers['Authorization'] = `Bearer ${options.auth.bearer.token}`
  }
  if (Object.keys(headers).length > 0) {
    configObj.headers = headers
  }

  // Params
  if (options.params && Object.keys(options.params).length > 0) {
    configObj.params = options.params
  }

  // Body
  if (options.body && options.body.type !== 'none' && options.body.content) {
    if (options.body.type === 'json') {
      configObj.data = options.body.content
    } else {
      configObj.data = options.body.content
    }
  }

  // Auth
  if (options.auth?.type === 'basic' && options.auth.basic) {
    configObj.auth = {
      username: options.auth.basic.username,
      password: options.auth.basic.password,
    }
  }

  // Build config code
  lines.push('const config = {')
  for (const [key, value] of Object.entries(configObj)) {
    if (key === 'headers' || key === 'params') {
      const obj = value as Record<string, string>
      lines.push(`  ${key}: {`)
      for (const [k, v] of Object.entries(obj)) {
        lines.push(`    '${k}': '${v}',`)
      }
      lines.push('  },')
    } else if (key === 'auth') {
      const auth = value as { username: string; password: string }
      lines.push(`  auth: {`)
      lines.push(`    username: '${auth.username}',`)
      lines.push(`    password: '${auth.password}',`)
      lines.push('  },')
    } else if (key === 'data') {
      const dataVal = value as string
      if (dataVal.startsWith('{') || dataVal.startsWith('[')) {
        lines.push(`  ${key}: ${dataVal},`)
      } else {
        lines.push(`  ${key}: '${dataVal}',`)
      }
    } else {
      lines.push(`  ${key}: '${value}',`)
    }
  }
  lines.push('}')
  lines.push('')

  lines.push('axios.request(config)')
  lines.push('  .then(response => {')
  lines.push('    console.log(response.status)')
  lines.push('    console.log(response.data)')
  lines.push('  })')
  lines.push('  .catch(error => {')
  lines.push('    console.error(error)')
  lines.push('  })')

  return lines.join('\n')
}

/**
 * Convert request options to fetch code
 */
export function toFetchCode(options: HttpRequestOptions): string {
  const lines: string[] = ['']

  // Build headers object
  const headers: Record<string, string> = { ...options.headers }
  if (options.auth?.type === 'bearer' && options.auth.bearer) {
    headers['Authorization'] = `Bearer ${options.auth.bearer.token}`
  }
  if (options.auth?.type === 'apikey' && options.auth.apikey && options.auth.apikey.addTo === 'header') {
    headers[options.auth.apikey.key] = options.auth.apikey.value
  }

  // Build init object
  lines.push('const init = {')
  lines.push(`  method: '${options.method}',`)

  if (Object.keys(headers).length > 0) {
    lines.push('  headers: {')
    for (const [key, value] of Object.entries(headers)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('  },')
  }

  // Body
  if (options.body && options.body.type !== 'none' && options.body.content) {
    if (options.body.type === 'json') {
      lines.push(`  body: JSON.stringify(${options.body.content}),`)
    } else {
      lines.push(`  body: '${options.body.content}',`)
    }
  }

  lines.push('}')
  lines.push('')

  // Add Basic auth note if present
  if (options.auth?.type === 'basic' && options.auth.basic) {
    lines.push('// Note: Basic auth requires manual header construction:')
    lines.push(`// init.headers['Authorization'] = 'Basic ' + btoa('${options.auth.basic.username}:${options.auth.basic.password}')`)
    lines.push('')
  }

  // URL with params
  let url = options.url
  if (options.params && Object.keys(options.params).length > 0) {
    const paramsStr = Object.entries(options.params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    url = `${options.url}?${paramsStr}`
  }

  lines.push(`fetch('${url}', init)`)
  lines.push('  .then(response => {')
  lines.push('    console.log(response.status)')
  lines.push('    return response.json()')
  lines.push('  })')
  lines.push('  .then(data => {')
  lines.push('    console.log(data)')
  lines.push('  })')
  lines.push('  .catch(error => {')
  lines.push('    console.error(error)')
  lines.push('  })')

  return lines.join('\n')
}

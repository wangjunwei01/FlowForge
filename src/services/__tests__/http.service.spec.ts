import { describe, it, expect } from 'vitest'
import { parseCurlCommand, toCurlCommand, toPythonCode, toAxiosCode, toFetchCode, type HttpRequestOptions } from '@/services/http.service'

describe('http.service', () => {
  describe('parseCurlCommand', () => {
    it('should parse simple GET request', () => {
      const curl = "curl 'https://api.example.com/users'"
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.method).toBe('GET')
      expect(result!.url).toBe('https://api.example.com/users')
    })

    it('should parse POST request with method flag', () => {
      const curl = "curl -X POST 'https://api.example.com/users'"
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.method).toBe('POST')
      expect(result!.url).toBe('https://api.example.com/users')
    })

    it('should parse request with headers', () => {
      const curl = `curl 'https://api.example.com/users' -H 'Content-Type: application/json' -H 'Authorization: Bearer token123'`
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.headers!['Content-Type']).toBe('application/json')
      expect(result!.headers!['Authorization']).toBe('Bearer token123')
    })

    it('should parse request with body data', () => {
      const curl = `curl -X POST 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{"name":"John"}'`
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.method).toBe('POST')
      expect(result!.body).toBeDefined()
      expect(result!.body!.type).toBe('json')
      expect(result!.body!.content).toBe('{"name":"John"}')
    })

    it('should parse Basic auth', () => {
      const curl = `curl -u 'user:pass' 'https://api.example.com/users'`
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.auth).toBeDefined()
      expect(result!.auth!.type).toBe('basic')
      expect(result!.auth!.basic!.username).toBe('user')
      expect(result!.auth!.basic!.password).toBe('pass')
    })

    it('should parse Bearer token from header', () => {
      const curl = `curl 'https://api.example.com/users' -H 'Authorization: Bearer mytoken'`
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.auth).toBeDefined()
      expect(result!.auth!.type).toBe('bearer')
      expect(result!.auth!.bearer!.token).toBe('mytoken')
    })

    it('should return null for invalid cURL command', () => {
      const result = parseCurlCommand('not a curl command')
      expect(result).toBeNull()
    })

    it('should handle multiline cURL commands', () => {
      const curl = `curl 'https://api.example.com/users' \\
        -H 'Content-Type: application/json' \\
        -d '{"test": true}'`
      const result = parseCurlCommand(curl)

      expect(result).not.toBeNull()
      expect(result!.method).toBe('POST') // Has data, so POST
    })
  })

  describe('toCurlCommand', () => {
    it('should generate simple GET request', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
      }
      const result = toCurlCommand(options)

      expect(result).toContain('curl')
      expect(result).toContain("'https://api.example.com/users'")
      expect(result).not.toContain('-X')
    })

    it('should generate POST request with body', () => {
      const options: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/users',
        body: {
          type: 'json',
          content: '{"name":"John"}',
        },
      }
      const result = toCurlCommand(options)

      expect(result).toContain('-X POST')
      expect(result).toContain("-d '{\"name\":\"John\"}'")
    })

    it('should include headers', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
        },
      }
      const result = toCurlCommand(options)

      expect(result).toContain("-H 'Content-Type: application/json'")
      expect(result).toContain("-H 'X-Custom-Header: value'")
    })

    it('should include Bearer auth', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        auth: {
          type: 'bearer',
          bearer: { token: 'mytoken' },
        },
      }
      const result = toCurlCommand(options)

      expect(result).toContain("'Authorization: Bearer mytoken'")
    })

    it('should include Basic auth', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        auth: {
          type: 'basic',
          basic: { username: 'user', password: 'pass' },
        },
      }
      const result = toCurlCommand(options)

      expect(result).toContain("-u 'user:pass'")
    })
  })

  describe('toPythonCode', () => {
    it('should generate simple GET request', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
      }
      const result = toPythonCode(options)

      expect(result).toContain('import requests')
      expect(result).toContain("requests.get('https://api.example.com/users')")
    })

    it('should generate POST request with JSON body', () => {
      const options: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/users',
        body: {
          type: 'json',
          content: '{"name":"John"}',
        },
      }
      const result = toPythonCode(options)

      expect(result).toContain("requests.post('https://api.example.com/users'")
      expect(result).toContain('json={"name":"John"}')
    })

    it('should include headers', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const result = toPythonCode(options)

      expect(result).toContain('headers = {')
      expect(result).toContain("'Content-Type': 'application/json'")
      expect(result).toContain('headers=headers')
    })

    it('should include query params', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        params: {
          page: '1',
          limit: '10',
        },
      }
      const result = toPythonCode(options)

      expect(result).toContain('params = {')
      expect(result).toContain("'page': '1'")
      expect(result).toContain("'limit': '10'")
      expect(result).toContain('params=params')
    })

    it('should include Basic auth', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        auth: {
          type: 'basic',
          basic: { username: 'user', password: 'pass' },
        },
      }
      const result = toPythonCode(options)

      expect(result).toContain("auth=('user', 'pass')")
    })
  })

  describe('round-trip conversion', () => {
    it('should round-trip simple GET request', () => {
      const original: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
      }
      const curlCmd = toCurlCommand(original)
      const parsed = parseCurlCommand(curlCmd)

      expect(parsed).not.toBeNull()
      expect(parsed!.method).toBe('GET')
      expect(parsed!.url).toBe('https://api.example.com/users')
    })

    it('should round-trip POST request with headers and body', () => {
      const original: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          type: 'json',
          content: '{"name":"John"}',
        },
      }
      const curlCmd = toCurlCommand(original)
      const parsed = parseCurlCommand(curlCmd)

      expect(parsed).not.toBeNull()
      expect(parsed!.method).toBe('POST')
      expect(parsed!.url).toBe('https://api.example.com/users')
      expect(parsed!.headers!['Content-Type']).toBe('application/json')
      expect(parsed!.body!.content).toBe('{"name":"John"}')
    })
  })

  describe('toAxiosCode', () => {
    it('should generate simple GET request', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
      }
      const result = toAxiosCode(options)

      expect(result).toContain('import axios')
      expect(result).toContain("method: 'get'")
      expect(result).toContain("url: 'https://api.example.com/users'")
    })

    it('should generate POST request with body', () => {
      const options: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/users',
        body: {
          type: 'json',
          content: '{"name":"John"}',
        },
      }
      const result = toAxiosCode(options)

      expect(result).toContain("method: 'post'")
      expect(result).toContain('data: {"name":"John"}')
    })

    it('should include headers', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'X-Custom-Header': 'value',
        },
      }
      const result = toAxiosCode(options)

      expect(result).toContain('headers: {')
      expect(result).toContain("'X-Custom-Header': 'value'")
    })

    it('should include Basic auth', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        auth: {
          type: 'basic',
          basic: { username: 'user', password: 'pass' },
        },
      }
      const result = toAxiosCode(options)

      expect(result).toContain('auth: {')
      expect(result).toContain("username: 'user'")
      expect(result).toContain("password: 'pass'")
    })
  })

  describe('toFetchCode', () => {
    it('should generate simple GET request', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
      }
      const result = toFetchCode(options)

      expect(result).toContain("method: 'GET'")
      expect(result).toContain("fetch('https://api.example.com/users'")
    })

    it('should generate POST request with JSON body', () => {
      const options: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/users',
        body: {
          type: 'json',
          content: '{"name":"John"}',
        },
      }
      const result = toFetchCode(options)

      expect(result).toContain("method: 'POST'")
      expect(result).toContain('JSON.stringify({"name":"John"})')
    })

    it('should include query params in URL', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        params: {
          page: '1',
          limit: '10',
        },
      }
      const result = toFetchCode(options)

      expect(result).toContain('page=1')
      expect(result).toContain('limit=10')
    })

    it('should include Bearer auth header', () => {
      const options: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/users',
        auth: {
          type: 'bearer',
          bearer: { token: 'mytoken' },
        },
      }
      const result = toFetchCode(options)

      expect(result).toContain("'Authorization': 'Bearer mytoken'")
    })
  })
})

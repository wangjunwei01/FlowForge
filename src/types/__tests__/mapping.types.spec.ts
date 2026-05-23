import { describe, it, expect } from 'vitest'
import { resolveVariables, isDataMappingType } from '@/types/mapping.types'

describe('resolveVariables', () => {
  it('replaces single variable', () => {
    const template = 'https://{{API_URL}}/users'
    const variables = { API_URL: 'api.example.com' }
    const result = resolveVariables(template, variables)
    expect(result).toBe('https://api.example.com/users')
  })

  it('replaces multiple variables', () => {
    const template = '{{BASE_URL}}/{{API_VERSION}}/{{RESOURCE}}'
    const variables = {
      BASE_URL: 'https://api.example.com',
      API_VERSION: 'v1',
      RESOURCE: 'users',
    }
    const result = resolveVariables(template, variables)
    expect(result).toBe('https://api.example.com/v1/users')
  })

  it('leaves unmatched variables unchanged', () => {
    const template = 'https://{{UNKNOWN_VAR}}/users'
    const variables = {}
    const result = resolveVariables(template, variables)
    expect(result).toBe('https://{{UNKNOWN_VAR}}/users')
  })

  it('handles empty template', () => {
    const template = ''
    const variables = { API_URL: 'api.example.com' }
    const result = resolveVariables(template, variables)
    expect(result).toBe('')
  })

  it('handles template with no variables', () => {
    const template = 'https://api.example.com/users'
    const variables = { API_URL: 'other.com' }
    const result = resolveVariables(template, variables)
    expect(result).toBe('https://api.example.com/users')
  })

  it('handles JSON content with variables', () => {
    const template = '{"name": "{{NAME}}", "email": "{{EMAIL}}"}'
    const variables = { NAME: 'John', EMAIL: 'john@example.com' }
    const result = resolveVariables(template, variables)
    expect(result).toBe('{"name": "John", "email": "john@example.com"}')
  })

  it('replaces variables in header value', () => {
    const template = 'Bearer {{TOKEN}}'
    const variables = { TOKEN: 'abc123' }
    const result = resolveVariables(template, variables)
    expect(result).toBe('Bearer abc123')
  })
})

describe('isDataMappingType', () => {
  it('returns true for valid types', () => {
    expect(isDataMappingType('jsonpath')).toBe(true)
    expect(isDataMappingType('script')).toBe(true)
    expect(isDataMappingType('visual')).toBe(true)
    expect(isDataMappingType('direct')).toBe(true)
  })

  it('returns false for invalid types', () => {
    expect(isDataMappingType('invalid')).toBe(false)
    expect(isDataMappingType('')).toBe(false)
    expect(isDataMappingType('JSONPATH')).toBe(false)
  })
})
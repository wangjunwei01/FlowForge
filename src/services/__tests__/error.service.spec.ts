import { describe, it, expect } from 'vitest'
import { createAppError, isAppError } from '@/services/error.service'

describe('error.service', () => {
  it('should create an AppError', () => {
    const error = createAppError('E001', 'Test error')
    expect(error.code).toBe('E001')
    expect(error.message).toBe('Test error')
    expect(error.details).toBeUndefined()
  })

  it('should create an AppError with details', () => {
    const error = createAppError('E002', 'IPC error', { foo: 'bar' })
    expect(error.details).toEqual({ foo: 'bar' })
  })

  it('should identify an AppError', () => {
    const error = createAppError('E001', 'Test error')
    expect(isAppError(error)).toBe(true)
    expect(isAppError(new Error('test'))).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError('string')).toBe(false)
  })
})

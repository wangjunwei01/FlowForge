import { invoke } from '@tauri-apps/api/core'

export interface AppError {
  code: string
  message: string
  details?: unknown
}

export function createAppError(code: string, message: string, details?: unknown): AppError {
  return { code, message, details }
}

export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

export async function invokeSafe<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    if (isAppError(error)) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    throw createAppError('E001', message)
  }
}

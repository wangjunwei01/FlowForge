export type ImportSource = 'curl' | 'postman' | 'insomnia' | 'openapi'

export interface ImportResult {
  success: boolean
  flows: Array<{
    name: string
    nodes: unknown[]
    edges: unknown[]
  }>
  errors: ImportError[]
}

export interface ImportError {
  source: ImportSource
  message: string
  line?: number
  column?: number
}

export function isImportSource(value: string): value is ImportSource {
  return ['curl', 'postman', 'insomnia', 'openapi'].includes(value)
}
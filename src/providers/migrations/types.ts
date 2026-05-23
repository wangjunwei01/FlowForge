export interface Migration {
  fromVersion: number
  toVersion: number
  migrate(data: unknown): unknown
}

export interface MigrationResult {
  success: boolean
  data?: unknown
  error?: string
  fromVersion: number
  toVersion: number
}
/**
 * Schema migration system for FlowForge data.
 *
 * Migrations transform data from one schema version to the next,
 * walking a chain: v1 → v2 → v3 → ... → CURRENT_SCHEMA_VERSION.
 * Before migration, a backup of the original data is created.
 * On failure, the backup is restored (rollback).
 */

import { CURRENT_SCHEMA_VERSION } from '@/constants/schema'

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

// Registry of all migrations, ordered by fromVersion
const migrations: Migration[] = []

/**
 * Run all applicable migrations to bring data up to CURRENT_SCHEMA_VERSION.
 * Returns the migrated data, or throws on failure.
 */
export function migrateData(data: unknown, startVersion: number): unknown {
  let current = data
  let version = startVersion

  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = migrations.find((m) => m.fromVersion === version)
    if (!migration) {
      throw new Error(`No migration from schema version ${version}`)
    }
    current = migration.migrate(current)
    version = migration.toVersion
  }

  // Update schemaVersion in the result if it's an object
  if (typeof current === 'object' && current !== null) {
    ;(current as Record<string, unknown>).schemaVersion = CURRENT_SCHEMA_VERSION
  }

  return current
}

/**
 * Check if data needs migration by comparing its schemaVersion to CURRENT_SCHEMA_VERSION.
 */
export function needsMigration(data: { schemaVersion: number }): boolean {
  return data.schemaVersion < CURRENT_SCHEMA_VERSION
}

/**
 * Create a backup string of the data (JSON serialized) for rollback purposes.
 */
export function createBackup(data: unknown): string {
  return JSON.stringify(data)
}

/**
 * Restore data from a backup string.
 */
export function restoreBackup(backup: string): unknown {
  return JSON.parse(backup)
}

/**
 * Run migration with backup and rollback on failure.
 */
export function migrateWithRollback(data: unknown, startVersion: number): MigrationResult {
  const backup = createBackup(data)

  try {
    const migrated = migrateData(data, startVersion)
    return {
      success: true,
      data: migrated,
      fromVersion: startVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
    }
  } catch (error) {
    // Rollback: return original data from backup
    const original = restoreBackup(backup)
    return {
      success: false,
      data: original,
      error: error instanceof Error ? error.message : String(error),
      fromVersion: startVersion,
      toVersion: startVersion,
    }
  }
}

/**
 * Get all registered migrations (for testing).
 */
export function getMigrations(): Migration[] {
  return [...migrations]
}
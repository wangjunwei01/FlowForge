/**
 * Migration registry.
 *
 * When adding new schema versions, add migration functions here
 * and update CURRENT_SCHEMA_VERSION in constants/schema.ts.
 *
 * Example for v1→v2 migration:
 * ```ts
 * const v1ToV2: Migration = {
 *   fromVersion: 1,
 *   toVersion: 2,
 *   migrate(data: unknown): unknown {
 *     const flow = data as Record<string, unknown>
 *     return { ...flow, newField: 'defaultValue' }
 *   }
 * }
 * ```
 */

import type { Migration } from './types'

const migrations: Migration[] = []

export function getMigrations(): Migration[] {
  return [...migrations]
}

export type { Migration, MigrationResult } from './types'
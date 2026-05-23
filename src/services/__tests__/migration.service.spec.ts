import { describe, it, expect } from 'vitest'
import { needsMigration, migrateWithRollback } from '@/services/migration.service'
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema'

describe('migration.service', () => {
  describe('needsMigration', () => {
    it('returns true when schemaVersion is less than current', () => {
      expect(needsMigration({ schemaVersion: 1 })).toBe(CURRENT_SCHEMA_VERSION > 1)
    })

    it('returns false when schemaVersion equals current', () => {
      expect(needsMigration({ schemaVersion: CURRENT_SCHEMA_VERSION })).toBe(false)
    })

    it('returns false when schemaVersion is greater than current', () => {
      expect(needsMigration({ schemaVersion: CURRENT_SCHEMA_VERSION + 1 })).toBe(false)
    })
  })

  describe('migrateWithRollback', () => {
    it('returns success with unchanged data when no migration needed', () => {
      const data = { schemaVersion: CURRENT_SCHEMA_VERSION, name: 'test' }
      const result = migrateWithRollback(data, CURRENT_SCHEMA_VERSION)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('returns success with data when migration starts below current but no migrations registered', () => {
      // Since no migrations are registered yet, v1 data stays as v1
      const data = { schemaVersion: 1, name: 'test' }
      const result = migrateWithRollback(data, 1)
      expect(result.success).toBe(true)
      // Data remains unchanged because there are no migration steps to apply
      expect(result.data).toEqual(data)
    })

    it('returns error when startVersion is negative', () => {
      const data = { schemaVersion: -1, name: 'test' }
      const result = migrateWithRollback(data, -1)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
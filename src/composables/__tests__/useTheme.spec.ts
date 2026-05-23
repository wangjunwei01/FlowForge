import { describe, it, expect } from 'vitest'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  it('should initialize with light theme by default', () => {
    const { currentTheme } = useTheme()
    expect(['light', 'dark']).toContain(currentTheme.value)
  })

  it('should toggle between light and dark', () => {
    const { currentTheme, toggleTheme, initTheme } = useTheme()
    initTheme()
    const initial = currentTheme.value
    toggleTheme()
    expect(currentTheme.value).not.toBe(initial)
  })
})

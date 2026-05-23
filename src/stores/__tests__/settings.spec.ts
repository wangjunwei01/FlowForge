import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct default values', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('light')
    expect(store.locale).toBe('zh-CN')
    expect(store.initialized).toBe(false)
  })

  it('applies theme to document', () => {
    const store = useSettingsStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    store.setTheme('light')
    expect(store.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets locale', () => {
    const store = useSettingsStore()
    store.setLocale('en-US')
    expect(store.locale).toBe('en-US')
  })

  it('resets settings to defaults', async () => {
    const store = useSettingsStore()
    await store.setTheme('dark')
    await store.setLocale('en-US')

    expect(store.theme).toBe('dark')
    expect(store.locale).toBe('en-US')

    await store.resetSettings()
    expect(store.theme).toBe('light')
    expect(store.locale).toBe('zh-CN')
  })
})
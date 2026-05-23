import { defineStore } from 'pinia'
import { ref } from 'vue'
import { readSetting, writeSetting } from '@/services/file.service'

type Theme = 'light' | 'dark'
type Locale = 'zh-CN' | 'en-US'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('light')
  const locale = ref<Locale>('zh-CN')
  let initialized = false

  async function loadSettings(): Promise<void> {
    if (initialized) return
    try {
      const savedTheme = await readSetting('theme')
      if (savedTheme) {
        theme.value = savedTheme as Theme
      }
      const savedLocale = await readSetting('locale')
      if (savedLocale) {
        locale.value = savedLocale as Locale
      }
    } catch {
      // Use defaults if settings can't be loaded
    }
    // Apply theme
    applyTheme(theme.value)
    initialized = true
  }

  async function setTheme(value: Theme): Promise<void> {
    theme.value = value
    applyTheme(value)
    try {
      await writeSetting('theme', value)
    } catch {
      // Fallback to localStorage
      localStorage.setItem('flowforge-theme', value)
    }
  }

  async function setLocale(value: Locale): Promise<void> {
    locale.value = value
    try {
      await writeSetting('locale', value)
    } catch {
      // Fallback: just update in memory
    }
  }

  function applyTheme(t: Theme): void {
    document.documentElement.setAttribute('data-theme', t)
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('flowforge-theme', t)
  }

  async function resetSettings(): Promise<void> {
    await setTheme('light')
    await setLocale('zh-CN')
  }

  return {
    theme,
    locale,
    initialized,
    loadSettings,
    setTheme,
    setLocale,
    resetSettings,
  }
})
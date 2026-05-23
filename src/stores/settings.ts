import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark'>('light')
  const locale = ref<'zh-CN' | 'en-US'>('zh-CN')

  function setTheme(value: 'light' | 'dark') {
    theme.value = value
  }

  function setLocale(value: 'zh-CN' | 'en-US') {
    locale.value = value
  }

  return {
    theme,
    locale,
    setTheme,
    setLocale,
  }
})

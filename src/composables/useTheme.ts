import { ref } from 'vue'

type Theme = 'light' | 'dark'

const currentTheme = ref<Theme>((localStorage.getItem('flowforge-theme') as Theme) || 'light')

export function useTheme() {
  function setTheme(theme: Theme) {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('flowforge-theme', theme)
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }

  function initTheme() {
    setTheme(currentTheme.value)
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
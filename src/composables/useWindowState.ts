import { ref } from 'vue'

export interface WindowState {
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
}

const STORAGE_KEY = 'flowforge-window-state'

export function useWindowState() {
  const isMaximized = ref(false)

  function loadWindowState(): WindowState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as WindowState
      }
    } catch {
      // Ignore parse errors
    }
    return null
  }

  function saveWindowState(state: WindowState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }

  return {
    isMaximized,
    loadWindowState,
    saveWindowState,
  }
}

import { ref } from 'vue'
import type { WindowState } from '@/types'
import { readSetting, writeSetting } from '@/services/file.service'

const WINDOW_STATE_KEY = 'window_state'

const defaultState: WindowState = {
  x: 0,
  y: 0,
  width: 1280,
  height: 800,
  isMaximized: false,
}

const windowState = ref<WindowState>({ ...defaultState })
let loaded = false

/**
 * Composable for persisting and restoring window state (position, size, maximized).
 * Uses Tauri backend settings for persistence, falling back to localStorage.
 */
export function useWindowState() {
  const isMaximized = ref(false)

  async function loadWindowState(): Promise<WindowState> {
    if (loaded) return windowState.value

    // Try Tauri backend first
    try {
      const json = await readSetting(WINDOW_STATE_KEY)
      if (json) {
        const parsed = JSON.parse(json) as WindowState
        windowState.value = {
          x: parsed.x ?? defaultState.x,
          y: parsed.y ?? defaultState.y,
          width: Math.max(parsed.width ?? defaultState.width, 400),
          height: Math.max(parsed.height ?? defaultState.height, 300),
          isMaximized: parsed.isMaximized ?? defaultState.isMaximized,
        }
        isMaximized.value = windowState.value.isMaximized
        loaded = true
        return windowState.value
      }
    } catch {
      // Backend not available, fall through to localStorage
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('flowforge-window-state')
      if (stored) {
        const parsed = JSON.parse(stored) as WindowState
        windowState.value = {
          x: parsed.x ?? defaultState.x,
          y: parsed.y ?? defaultState.y,
          width: Math.max(parsed.width ?? defaultState.width, 400),
          height: Math.max(parsed.height ?? defaultState.height, 300),
          isMaximized: parsed.isMaximized ?? defaultState.isMaximized,
        }
        isMaximized.value = windowState.value.isMaximized
      }
    } catch {
      windowState.value = { ...defaultState }
    }

    loaded = true
    return windowState.value
  }

  async function saveWindowState(state: WindowState): Promise<void> {
    windowState.value = { ...state }
    isMaximized.value = state.isMaximized

    // Save to Tauri backend
    try {
      await writeSetting(WINDOW_STATE_KEY, JSON.stringify(state))
    } catch {
      // Fallback: save to localStorage
      try {
        localStorage.setItem('flowforge-window-state', JSON.stringify(state))
      } catch {
        // Ignore storage errors
      }
    }
  }

  async function resetWindowState(): Promise<void> {
    windowState.value = { ...defaultState }
    isMaximized.value = false
    try {
      await writeSetting(WINDOW_STATE_KEY, JSON.stringify(defaultState))
    } catch {
      // Ignore
    }
  }

  return {
    windowState,
    isMaximized,
    loadWindowState,
    saveWindowState,
    resetWindowState,
  }
}
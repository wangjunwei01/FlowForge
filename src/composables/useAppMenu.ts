import { ref } from 'vue'
import type { MenuItem } from '@tauri-apps/api/menu'

export interface AppMenu {
  file: MenuItem[]
  edit: MenuItem[]
  view: MenuItem[]
  run: MenuItem[]
  help: MenuItem[]
}

const isMenuRegistered = ref(false)

export function useAppMenu() {
  async function setupMenu(): Promise<void> {
    if (isMenuRegistered.value) return

    try {
      // Menu setup will be implemented with @tauri-apps/api/menu
      // when building the actual menu structure in TODO1 step 1.7
      isMenuRegistered.value = true
    } catch (error) {
      console.error('[FlowForge] Failed to setup menu:', error)
    }
  }

  return {
    isMenuRegistered,
    setupMenu,
  }
}

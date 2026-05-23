import { ref } from 'vue'

export type ContextMenuTarget =
  | { type: 'node'; id: string; x: number; y: number }
  | { type: 'edge'; id: string; x: number; y: number }
  | { type: 'canvas'; x: number; y: number }

export function useContextMenu() {
  const menuTarget = ref<ContextMenuTarget | null>(null)
  const visible = ref(false)

  function show(target: ContextMenuTarget): void {
    menuTarget.value = target
    visible.value = true
  }

  function hide(): void {
    visible.value = false
    menuTarget.value = null
  }

  return {
    menuTarget,
    visible,
    show,
    hide,
  }
}
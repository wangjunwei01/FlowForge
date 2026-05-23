import { NodeType } from '@/types'

const DRAG_DATA_KEY = 'application/flowforge-node'

export function useDragDrop() {
  function onDragStart(event: DragEvent, nodeType: NodeType): void {
    if (!event.dataTransfer) return

    const data = JSON.stringify({ nodeType })
    event.dataTransfer.setData(DRAG_DATA_KEY, data)
    event.dataTransfer.effectAllowed = 'move'

    const ghost = document.createElement('div')
    ghost.className = 'drag-ghost'
    ghost.textContent = nodeType.replace(/_/g, ' ')
    document.body.appendChild(ghost)

    event.dataTransfer.setDragImage(ghost, 50, 20)

    setTimeout(() => {
      document.body.removeChild(ghost)
    }, 0)
  }

  function getDragData(event: DragEvent): { nodeType: NodeType } | null {
    if (!event.dataTransfer) return null

    const data = event.dataTransfer.getData(DRAG_DATA_KEY)
    if (!data) return null

    try {
      return JSON.parse(data) as { nodeType: NodeType }
    } catch {
      return null
    }
  }

  return {
    onDragStart,
    getDragData,
  }
}
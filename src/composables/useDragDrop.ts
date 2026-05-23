import { NodeType } from '@/types'

export function useDragDrop() {
  function onDragStart(event: DragEvent, nodeType: NodeType): void {
    if (!event.dataTransfer) {
      console.warn('No dataTransfer in dragstart')
      return
    }

    // Use 'text/plain' for broader compatibility
    const data = JSON.stringify({ nodeType })
    event.dataTransfer.setData('text/plain', data)
    event.dataTransfer.effectAllowed = 'move'

    console.log('Drag started:', nodeType)
  }

  function getDragData(event: DragEvent): { nodeType: NodeType } | null {
    if (!event.dataTransfer) return null

    // Try text/plain first, then application/flowforge-node
    let data = event.dataTransfer.getData('text/plain')
    if (!data) {
      data = event.dataTransfer.getData('application/flowforge-node')
    }

    if (!data) {
      console.warn('No drag data found')
      return null
    }

    try {
      const parsed = JSON.parse(data) as { nodeType: NodeType }
      console.log('Got drag data:', parsed)
      return parsed
    } catch (e) {
      console.error('Failed to parse drag data:', e)
      return null
    }
  }

  return {
    onDragStart,
    getDragData,
  }
}
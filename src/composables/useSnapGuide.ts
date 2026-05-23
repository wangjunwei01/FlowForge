import { ref, type Ref } from 'vue'
import type { GraphNode } from '@vue-flow/core'

interface SnapLine {
  type: 'horizontal' | 'vertical'
  position: number
  start: number
  end: number
}

const SNAP_THRESHOLD = 5

export function useSnapGuide(nodes: Ref<GraphNode[]>) {
  const snapLines = ref<SnapLine[]>([])

  function getCenterPosition(node: GraphNode): { x: number; y: number } {
    const width = (node.dimensions?.width ?? 180) / 2
    const height = (node.dimensions?.height ?? 80) / 2
    return {
      x: node.position.x + width,
      y: node.position.y + height,
    }
  }

  function onNodeDrag(dragNode: GraphNode): void {
    snapLines.value = []
    const dragCenter = getCenterPosition(dragNode)
    const dragWidth = dragNode.dimensions?.width ?? 180
    const dragHeight = dragNode.dimensions?.height ?? 80

    const lines: SnapLine[] = []

    for (const node of nodes.value) {
      if (node.id === dragNode.id) continue

      const otherCenter = getCenterPosition(node)
      const otherWidth = node.dimensions?.width ?? 180
      const otherHeight = node.dimensions?.height ?? 80

      const otherLeft = node.position.x
      const otherRight = node.position.x + otherWidth
      const otherTop = node.position.y
      const otherBottom = node.position.y + otherHeight
      const otherCenterX = otherCenter.x
      const otherCenterY = otherCenter.y

      const dragLeft = dragNode.position.x
      const dragRight = dragNode.position.x + dragWidth
      const dragTop = dragNode.position.y
      const dragBottom = dragNode.position.y + dragHeight
      const dragCenterX = dragCenter.x
      const dragCenterY = dragCenter.y

      // Vertical alignment (left edge)
      if (Math.abs(dragLeft - otherLeft) < SNAP_THRESHOLD) {
        lines.push({
          type: 'vertical',
          position: otherLeft,
          start: Math.min(dragTop, otherTop),
          end: Math.max(dragBottom, otherBottom),
        })
      }

      // Vertical alignment (right edge)
      if (Math.abs(dragRight - otherRight) < SNAP_THRESHOLD) {
        lines.push({
          type: 'vertical',
          position: otherRight,
          start: Math.min(dragTop, otherTop),
          end: Math.max(dragBottom, otherBottom),
        })
      }

      // Vertical alignment (center)
      if (Math.abs(dragCenterX - otherCenterX) < SNAP_THRESHOLD) {
        lines.push({
          type: 'vertical',
          position: otherCenterX,
          start: Math.min(dragTop, otherTop),
          end: Math.max(dragBottom, otherBottom),
        })
      }

      // Horizontal alignment (top edge)
      if (Math.abs(dragTop - otherTop) < SNAP_THRESHOLD) {
        lines.push({
          type: 'horizontal',
          position: otherTop,
          start: Math.min(dragLeft, otherLeft),
          end: Math.max(dragRight, otherRight),
        })
      }

      // Horizontal alignment (bottom edge)
      if (Math.abs(dragBottom - otherBottom) < SNAP_THRESHOLD) {
        lines.push({
          type: 'horizontal',
          position: otherBottom,
          start: Math.min(dragLeft, otherLeft),
          end: Math.max(dragRight, otherRight),
        })
      }

      // Horizontal alignment (center)
      if (Math.abs(dragCenterY - otherCenterY) < SNAP_THRESHOLD) {
        lines.push({
          type: 'horizontal',
          position: otherCenterY,
          start: Math.min(dragLeft, otherLeft),
          end: Math.max(dragRight, otherRight),
        })
      }
    }

    snapLines.value = lines
  }

  function onNodeDragStop(): void {
    snapLines.value = []
  }

  return {
    snapLines,
    onNodeDrag,
    onNodeDragStop,
  }
}
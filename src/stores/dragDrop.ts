import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NodeType } from '@/types'

export const useDragDropStore = defineStore('dragDrop', () => {
  const isDragging = ref(false)
  const draggedNodeType = ref<NodeType | null>(null)

  function startDrag(nodeType: NodeType) {
    // Toggle off if clicking the same type
    if (draggedNodeType.value === nodeType && isDragging.value) {
      endDrag()
      return
    }
    isDragging.value = true
    draggedNodeType.value = nodeType
    console.log('DragDropStore: startDrag', nodeType)
  }

  function endDrag() {
    console.log('DragDropStore: endDrag')
    isDragging.value = false
    draggedNodeType.value = null
  }

  return {
    isDragging,
    draggedNodeType,
    startDrag,
    endDrag,
  }
})
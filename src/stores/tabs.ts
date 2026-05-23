import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Tab {
  id: string
  flowId: string
  title: string
  isDirty: boolean
}

export const useTabStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) ?? null)

  function openTab(tab: Tab): void {
    const existing = tabs.value.find((t) => t.flowId === tab.flowId)
    if (existing) {
      activeTabId.value = existing.id
      return
    }
    tabs.value.push(tab)
    activeTabId.value = tab.id
  }

  function closeTab(id: string): void {
    const index = tabs.value.findIndex((t) => t.id === id)
    if (index === -1) return
    tabs.value.splice(index, 1)
    if (activeTabId.value === id) {
      const next = tabs.value[Math.min(index, tabs.value.length - 1)]
      activeTabId.value = next ? next.id : null
    }
  }

  function markDirty(id: string): void {
    const tab = tabs.value.find((t) => t.id === id)
    if (tab) tab.isDirty = true
  }

  function markClean(id: string): void {
    const tab = tabs.value.find((t) => t.id === id)
    if (tab) tab.isDirty = false
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    markDirty,
    markClean,
  }
})

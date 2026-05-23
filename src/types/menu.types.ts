export interface AppMenu {
  file: {
    newProject: string
    openProject: string
    save: string
    saveAs: string
    exportFlow: string
    importFlow: string
    settings: string
    quit: string
  }
  edit: {
    undo: string
    redo: string
    cut: string
    copy: string
    paste: string
    delete: string
    selectAll: string
    find: string
  }
  view: {
    zoomIn: string
    zoomOut: string
    resetZoom: string
    toggleSidebar: string
    toggleDarkMode: string
    toggleMinimap: string
  }
  run: {
    runFlow: string
    debugFlow: string
    stepOver: string
    stop: string
  }
  help: {
    documentation: string
    keyboardShortcuts: string
    about: string
  }
}
import { create } from 'zustand'
import { Project, ProjectFile, getProjectFiles, updateFile } from '@/lib/storage'
import type { editor } from 'monaco-editor'

type View = 'editor' | 'preview'

interface EditorState {
  // Current project
  project: Project | null
  files: ProjectFile[]
  activeFileId: string | null

  // Monaco editor instance
  monacoEditor: editor.IStandaloneCodeEditor | null

  // View state
  view: View
  sidebarOpen: boolean
  commandPaletteOpen: boolean

  // Actions
  setProject: (project: Project | null) => void
  setFiles: (files: ProjectFile[]) => void
  setActiveFile: (fileId: string | null) => void
  setMonacoEditor: (editor: editor.IStandaloneCodeEditor | null) => void
  setView: (view: View) => void
  toggleSidebar: () => void
  toggleCommandPalette: () => void

  // File operations
  loadProjectFiles: (projectId: string) => Promise<void>
  saveFile: (fileId: string, content: string) => Promise<void>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  files: [],
  activeFileId: null,
  monacoEditor: null,
  view: 'editor',
  sidebarOpen: false,
  commandPaletteOpen: false,

  setProject: (project) => set({ project }),
  setFiles: (files) => set({ files }),
  setActiveFile: (activeFileId) => set({ activeFileId }),
  setMonacoEditor: (monacoEditor) => set({ monacoEditor }),
  setView: (view) => set({ view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCommandPalette: () => {
    const { monacoEditor } = get()
    // Close Monaco's widgets (autocomplete, hover, etc.) before opening command palette
    if (monacoEditor) {
      monacoEditor.trigger('keyboard', 'hideSuggestWidget', null)
      monacoEditor.trigger('keyboard', 'closeParameterHints', null)
    }
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }))
  },

  loadProjectFiles: async (projectId) => {
    const files = await getProjectFiles(projectId)
    set({ files })
    // Auto-select index.html or first file
    const indexFile = files.find((f) => f.path === 'index.html')
    if (indexFile) {
      set({ activeFileId: indexFile.id })
    } else if (files.length > 0) {
      set({ activeFileId: files[0].id })
    }
  },

  saveFile: async (fileId, content) => {
    await updateFile(fileId, content)
    // Update local state
    set((state) => ({
      files: state.files.map((f) =>
        f.id === fileId ? { ...f, content, updatedAt: Date.now() } : f
      ),
    }))
  },
}))

// Selector hooks for performance
export const useActiveFile = () =>
  useEditorStore((state) =>
    state.files.find((f) => f.id === state.activeFileId)
  )

export const useView = () => useEditorStore((state) => state.view)
export const useSidebarOpen = () => useEditorStore((state) => state.sidebarOpen)

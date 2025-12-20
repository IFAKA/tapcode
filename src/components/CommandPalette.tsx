'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useEditorStore } from '@/store/editor'
import { createFile } from '@/lib/storage'
import { useRouter } from 'next/navigation'

interface Command {
  id: string
  label: string
  shortcut?: string
  action: () => void
}

export function CommandPalette() {
  const router = useRouter()
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    files,
    setActiveFile,
    view,
    setView,
    toggleSidebar,
    project,
    loadProjectFiles,
  } = useEditorStore()

  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      {
        id: 'toggle-preview',
        label: view === 'editor' ? 'Open Preview' : 'Back to Editor',
        shortcut: '⌘P',
        action: () => setView(view === 'editor' ? 'preview' : 'editor'),
      },
      {
        id: 'toggle-sidebar',
        label: 'Toggle Sidebar',
        shortcut: '⌘B',
        action: toggleSidebar,
      },
      {
        id: 'new-file',
        label: 'New File',
        shortcut: '⌘N',
        action: async () => {
          const name = prompt('File name:')
          if (name && project) {
            await createFile(project.id, name)
            await loadProjectFiles(project.id)
          }
        },
      },
      {
        id: 'go-home',
        label: 'Go to Projects',
        action: () => router.push('/'),
      },
    ]

    // Add file switching commands
    files.forEach((file) => {
      cmds.push({
        id: `file-${file.id}`,
        label: `Go to ${file.path}`,
        action: () => setActiveFile(file.id),
      })
    })

    return cmds
  }, [view, setView, toggleSidebar, files, setActiveFile, project, loadProjectFiles, router])

  const filteredCommands = useMemo(() => {
    if (!search) return commands
    const lower = search.toLowerCase()
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower))
  }, [commands, search])

  const executeCommand = useCallback(
    (command: Command) => {
      command.action()
      toggleCommandPalette()
      setSearch('')
      setSelectedIndex(0)
    },
    [toggleCommandPalette]
  )

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          toggleCommandPalette()
          setSearch('')
          setSelectedIndex(0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, filteredCommands, selectedIndex, executeCommand, toggleCommandPalette])

  // Global shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCommandPalette])

  if (!commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50"
      onClick={() => {
        toggleCommandPalette()
        setSearch('')
      }}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedIndex(0)
          }}
          placeholder="Type a command..."
          className="w-full bg-transparent text-white px-4 py-3 outline-none border-b border-zinc-700"
          autoFocus
        />
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.map((cmd, index) => (
            <div
              key={cmd.id}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                index === selectedIndex ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
              onClick={() => executeCommand(cmd)}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                  {cmd.shortcut}
                </span>
              )}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-3 text-zinc-500 text-center">No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}

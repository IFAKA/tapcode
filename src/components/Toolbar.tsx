'use client'

import { useEditorStore, useActiveFile } from '@/store/editor'
import Link from 'next/link'

export function Toolbar() {
  const project = useEditorStore((s) => s.project)
  const view = useEditorStore((s) => s.view)
  const setView = useEditorStore((s) => s.setView)
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar)
  const toggleCommandPalette = useEditorStore((s) => s.toggleCommandPalette)
  const activeFile = useActiveFile()

  return (
    <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-3">
      {/* Sidebar toggle */}
      {view === 'editor' && (
        <button
          onClick={toggleSidebar}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Back button in preview */}
      {view === 'preview' && (
        <button
          onClick={() => setView('editor')}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>
      )}

      {/* Project name / breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-white">
          Projects
        </Link>
        {project && (
          <>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{project.name}</span>
          </>
        )}
        {activeFile && view === 'editor' && (
          <>
            <span className="text-zinc-600">/</span>
            <span className="text-white">{activeFile.path}</span>
          </>
        )}
        {view === 'preview' && (
          <>
            <span className="text-zinc-600">/</span>
            <span className="text-blue-400">Preview</span>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* View toggle */}
      <button
        onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
        className={`px-3 py-1.5 text-sm rounded ${
          view === 'preview'
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        {view === 'editor' ? 'Preview' : 'Editor'}
      </button>

      {/* Command palette trigger */}
      <button
        onClick={toggleCommandPalette}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
        title="Command palette (⌘K)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </header>
  )
}

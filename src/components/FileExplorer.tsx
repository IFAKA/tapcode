'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editor'
import { createFile, deleteFile, renameFile } from '@/lib/storage'

export function FileExplorer() {
  const { files, activeFileId, setActiveFile, project, loadProjectFiles } = useEditorStore()
  const [newFileName, setNewFileName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !project) return
    await createFile(project.id, newFileName.trim())
    await loadProjectFiles(project.id)
    setNewFileName('')
    setIsCreating(false)
  }

  const handleDelete = async (fileId: string) => {
    if (!project) return
    if (confirm('Delete this file?')) {
      await deleteFile(fileId)
      await loadProjectFiles(project.id)
    }
  }

  const handleRename = async (fileId: string) => {
    if (!editingName.trim() || !project) return
    await renameFile(fileId, editingName.trim())
    await loadProjectFiles(project.id)
    setEditingId(null)
  }

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html':
        return '📄'
      case 'css':
        return '🎨'
      case 'js':
      case 'ts':
        return '⚡'
      case 'json':
        return '📋'
      default:
        return '📝'
    }
  }

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">Files</span>
        <button
          onClick={() => setIsCreating(true)}
          className="text-zinc-400 hover:text-white text-lg px-2"
          title="New file"
        >
          +
        </button>
      </div>

      {isCreating && (
        <div className="p-2 border-b border-zinc-800">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile()
              if (e.key === 'Escape') setIsCreating(false)
            }}
            placeholder="filename.ext"
            className="w-full bg-zinc-800 text-white text-sm px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-800 ${
              activeFileId === file.id ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
            onClick={() => setActiveFile(file.id)}
          >
            <span className="text-sm">{getFileIcon(file.path)}</span>
            {editingId === file.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(file.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onBlur={() => setEditingId(null)}
                className="flex-1 bg-zinc-700 text-white text-sm px-1 rounded outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="flex-1 text-sm truncate">{file.path}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(file.id)
                      setEditingName(file.path)
                    }}
                    className="text-xs text-zinc-500 hover:text-white px-1"
                    title="Rename"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(file.id)
                    }}
                    className="text-xs text-zinc-500 hover:text-red-400 px-1"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

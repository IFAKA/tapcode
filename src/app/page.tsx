'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects, createProject, deleteProject, Project } from '@/lib/storage'

export default function Home() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    const project = await createProject(newName.trim())
    setNewName('')
    setShowNew(false)
    router.push(`/${project.id}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this project?')) {
      await deleteProject(id)
      loadProjects()
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h1 className="text-lg font-semibold">TapCode</h1>
        <button
          onClick={() => setShowNew(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
        >
          + New
        </button>
      </header>

      {/* New Project Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-medium">New Project</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Project name"
              autoFocus
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project List */}
      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="text-5xl">{"</>"}</div>
            <p className="text-zinc-500">No projects yet</p>
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/${project.id}`)}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{project.name}</h3>
                  <p className="text-sm text-zinc-500">{formatDate(project.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className="ml-4 p-2 text-zinc-500 hover:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject } from '@/lib/storage'
import { useEditorStore } from '@/store/editor'
import { Editor, FileExplorer, Preview, CommandPalette, Toolbar } from '@/components'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { setProject, loadProjectFiles, view, sidebarOpen } = useEditorStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const project = await getProject(projectId)
      if (!project) {
        router.push('/')
        return
      }
      setProject(project)
      await loadProjectFiles(projectId)
      setLoading(false)
    }
    load()
  }, [projectId, setProject, loadProjectFiles, router])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        {view === 'editor' ? (
          <>
            {sidebarOpen && <FileExplorer />}
            <Editor />
          </>
        ) : (
          <Preview />
        )}
      </div>
      <CommandPalette />
    </div>
  )
}

'use client'

import { useRef, useCallback, useEffect } from 'react'
import MonacoEditor, { OnMount } from '@monaco-editor/react'
import { useEditorStore, useActiveFile } from '@/store/editor'

export function Editor() {
  const activeFile = useActiveFile()
  const saveFile = useEditorStore((s) => s.saveFile)
  const setMonacoEditor = useEditorStore((s) => s.setMonacoEditor)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      setMonacoEditor(null)
    }
  }, [setMonacoEditor])

  const handleMount: OnMount = useCallback((editor) => {
    setMonacoEditor(editor)
    editor.focus()
  }, [setMonacoEditor])

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activeFile || value === undefined) return

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveFile(activeFile.id, value)
      }, 500)
    },
    [activeFile, saveFile]
  )

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a file to edit
      </div>
    )
  }

  return (
    <div className="flex-1 h-full">
      <MonacoEditor
        height="100%"
        path={activeFile.id}
        language={activeFile.language}
        value={activeFile.content}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleMount}
        loading={<div className="flex-1 flex items-center justify-center text-zinc-500">Loading...</div>}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  )
}

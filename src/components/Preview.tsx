'use client'

import { useMemo } from 'react'
import { useEditorStore } from '@/store/editor'

export function Preview() {
  const files = useEditorStore((s) => s.files)

  const previewContent = useMemo(() => {
    const htmlFile = files.find((f) => f.path === 'index.html')
    const cssFile = files.find((f) => f.path === 'style.css')
    const jsFile = files.find((f) => f.path === 'script.js')

    if (!htmlFile) {
      return '<html><body><p style="color:#888;font-family:system-ui;">No index.html found</p></body></html>'
    }

    let html = htmlFile.content

    // Inject CSS inline if style.css exists
    if (cssFile) {
      const styleTag = `<style>${cssFile.content}</style>`
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}</head>`)
      } else if (html.includes('<body')) {
        html = html.replace('<body', `${styleTag}<body`)
      } else {
        html = styleTag + html
      }
    }

    // Inject JS inline if script.js exists
    if (jsFile) {
      const scriptTag = `<script>${jsFile.content}</script>`
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}</body>`)
      } else {
        html = html + scriptTag
      }
    }

    return html
  }, [files])

  const srcDoc = previewContent

  return (
    <div className="flex-1 h-full bg-white">
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
        title="Preview"
      />
    </div>
  )
}

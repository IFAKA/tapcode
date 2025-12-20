# TapCode

Touch-focused web IDE for mobile development.

## Tech Stack
- Next.js 16 (App Router + Turbopack)
- Monaco Editor
- IndexedDB via `idb`
- Zustand
- Tailwind CSS

## Structure
```
src/
├── app/              # Routes
│   ├── page.tsx      # Project list
│   └── [projectId]/  # Editor
├── components/       # UI components
├── lib/              # Storage layer
└── store/            # Zustand stores
```

## Key Patterns
- One screen philosophy: Editor OR Preview, never both
- Command palette: Cmd+K
- Auto-save with 500ms debounce
- New projects get index.html, style.css, script.js

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
```

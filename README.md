# TapCode

Touch-focused web IDE for mobile development.

## Quick Start

```bash
npm install && npm run dev
```

Open `localhost:3000`

## Features

| Feature | What it does |
|---------|--------------|
| **Monaco Editor** | VS Code's editor, on mobile |
| **Auto-save** | 500ms debounce, never lose work |
| **Live Preview** | See changes instantly |
| **Cmd+K** | Command palette for everything |
| **Offline** | IndexedDB storage, works anywhere |

## Philosophy

**One screen at a time.** Editor OR Preview, never both. Your phone is small. Deal with it.

## Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Command palette |
| `Cmd+S` | Force save |
| `Cmd+P` | Preview toggle |

## Stack

Next.js 16 / Monaco / IndexedDB / Zustand / Tailwind

## Structure

```
src/
├── app/           # Routes
├── components/    # UI
├── lib/           # Storage
└── store/         # State
```

## License

MIT

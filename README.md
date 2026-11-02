<img width="1280" height="640" alt="image" src="https://github.com/user-attachments/assets/da73ade2-7934-4153-b4b4-ddc072d07324" />

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

---

## Support

If this project is useful to you, you can support my work:

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/zfaka)

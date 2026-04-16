# TaskBoard

A Kanban-style task management board built with Next.js, Supabase, drag-and-drop via dnd-kit, and Tailwind CSS v4.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the board.

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Learning

The `learning/` directory contains documentation for understanding and rebuilding this app:

| File | What it covers |
|---|---|
| `howItWorks.md` | Codebase overview — stack, data model, component breakdown, key flows |
| `howToRebuild.md` | Step-by-step guide to rebuilding with the real stack (Next.js + Supabase + dnd-kit + Tailwind v4) |
| `howToBuildPrototype.md` | Vanilla JS prototype — same UI, no libraries, localStorage, drag-and-drop from scratch |
| `howToBuildBasicPrototype.md` | Stripped-down vanilla prototype (~80 lines of JS) to understand the core loop |

To read them with syntax highlighting and a table of contents, serve the `learning/` directory with a local server and open `renderer.html`:

```bash
cd learning
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000) (or whichever port `serve` picks) and select a doc from the dropdown.

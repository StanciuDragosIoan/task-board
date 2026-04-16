---
name: generate-learning-dir
description: Generates a learning/ directory with howItWorks, howToRebuild, vanilla prototype guides, and a markdown renderer — tailored to the current project's actual stack and codebase.
---

# Skill: Generate Learning Directory for a Web App Project

## Purpose

When invoked, this skill produces a `learning/` directory inside the current project containing a complete set of documentation and a markdown renderer. The docs explain how the app works, how to rebuild it with its real stack, how to build a vanilla JS prototype of it, and how to build a stripped-down basic prototype to understand the fundamentals.

Use this skill whenever you finish building a web app and want to create learning material that lets you (or someone else) fully understand and recreate it from scratch.

---

## What to produce

Create a `learning/` directory at the project root containing these 5 files:

```
learning/
├── howItWorks.md
├── howToRebuild.md
├── howToBuildPrototype.md
├── howToBuildBasicPrototype.md
└── renderer.html
```

---

## File 1 — `howItWorks.md`

A concise reference doc explaining the existing codebase. Include:

- **What it is** — one paragraph describing the app
- **Stack** — table listing framework, database, libraries, styling
- **File structure** — annotated directory tree
- **Data model** — every type/interface with field-level descriptions
- **Component breakdown** — one section per component/module explaining what it owns and why
- **Key flows** — step-by-step explanation of the most important user interactions (e.g. drag-and-drop, auth, data fetch)
- **Environment variables** — table of required env vars and their purpose

Write this by reading the actual codebase. Be specific — name real files, real functions, real line numbers where helpful.

---

## File 2 — `howToRebuild.md`

A step-by-step guide to rebuilding the app from scratch using the **real tech stack** (same framework, same libraries, same database). The reader should be able to follow it and produce a working app identical to the original.

Structure:
1. Project setup — exact CLI commands, versions, why each dependency is needed
2. External service setup (database, auth, etc.) — schema SQL, env vars, any configuration
3. Types and constants — the data model file first, since everything depends on it
4. Infrastructure files — DB client, config, layout
5. Components from leaf to root — build things with no dependencies first, work up to the root
6. For each component: paste the full code, then explain every non-obvious decision with `>` blockquotes

Key things to explain in blockquotes:
- Why certain patterns are used (refs vs state, optimistic updates, etc.)
- Any version-specific gotchas (e.g. Tailwind v3 vs v4 syntax differences)
- Why certain APIs require specific calling conventions
- Security decisions (XSS escaping, auth token handling, etc.)

---

## File 3 — `howToBuildPrototype.md`

A guide to rebuilding the same app as a **vanilla JS prototype** — no framework, no libraries, just `index.html`, `style.css`, and `app.js`. Data stored in `localStorage`. Visual design should be close to the real app.

Structure:
1. What you're building — screenshot/diagram of the UI
2. Comparison table: real stack vs vanilla (rendering, state, DnD/interactions, persistence)
3. `index.html` — static shell, explain why it's empty
4. `style.css` — full CSS with theming via CSS custom properties, explain the approach
5. `app.js` broken into sections:
   - Constants and state
   - localStorage (load/save)
   - CRUD functions
   - Rendering (render, renderX, renderY functions)
   - The main interactive feature (DnD, infinite scroll, etc.) — explain the browser API in depth
   - Modal or form handling
   - Theme or other secondary features
   - Utility functions
   - Init

For the main interactive feature (e.g. drag and drop), explain:
- The underlying browser API and its events
- The most common gotcha (e.g. `dragover` needing `preventDefault`)
- Any counter/workaround patterns needed (e.g. dragenter/dragleave flicker fix)
- Why `requestAnimationFrame` is needed in certain places
- How `data-*` attributes bridge the DOM and data

End with a data flow diagram showing how user actions → data mutations → save → render.

---

## File 4 — `howToBuildBasicPrototype.md`

A minimal version of the vanilla prototype that strips away everything except the absolute core. The goal is to teach the fundamental loop without noise.

Rules:
- Absolute minimum data model — as few fields as possible (e.g. just `{ id, title, columnId }`)
- No modal — use an inline input or `prompt()`
- No secondary features (no theme toggle, no reordering, no filters)
- Aim for ~80 lines of JS
- Every function must be explainable in one sentence

Structure mirrors `howToBuildPrototype.md` but shorter. For every non-obvious line, add a `>` blockquote explaining:
- Why `textContent` instead of `innerHTML`
- Why `e.currentTarget` vs `e.target`
- Why `tasks.map()` instead of direct mutation
- Why `saveTasks()` + `render()` appear at the end of every mutation
- Why the inline add input disappears automatically after `render()`

End with:
1. A "full picture" flow diagram (same format as `howToBuildPrototype.md`)
2. A table listing what's missing vs the full prototype and why each thing was left out

---

## File 5 — `renderer.html`

A single-file markdown renderer for reading the `.md` files above in a browser. The reader picks a file from a dropdown and it renders with syntax highlighting and a table of contents.

Features to include:
- Fixed top bar with project name and file picker dropdown (one `<option>` per `.md` file)
- Reading progress bar
- TOC sidebar (desktop only) built from `h2`/`h3` headings, highlights active section on scroll
- Markdown rendered via `marked.js` (CDN)
- Syntax highlighting via `highlight.js` (CDN) — use `highlight.min.js`, not `/lib/highlight.min.js`
- Copy button on every code block — appears on hover, shows "Copied!" feedback for 2s
- Dark theme (hardcoded — no toggle needed)

**Critical implementation notes:**
- Guard the `hljs` call: `if (typeof hljs !== 'undefined')` — if the CDN fails, the rest of the page should still work
- Copy buttons must be injected by wrapping each `<pre>` in a `<div class="pre-wrapper" style="position:relative">` and appending the button to the wrapper, NOT inside the `<pre>` itself. `overflow-x: auto` on `<pre>` clips absolutely-positioned children — the wrapper sidesteps this
- Use `marked.js` custom renderer to add `id` attributes to headings for TOC anchor links
- Use `IntersectionObserver` to track which heading is in view and highlight the TOC link
- Default to loading the first `.md` file on init

PostCSS plugin for the copy button: none needed — pure vanilla JS and CSS.

---

## Tone and style for all `.md` files

- Write every `>` blockquote as "Why X?" — explain the decision, not just what the code does
- Use tables for comparisons (React vs vanilla, v3 vs v4, etc.)
- Use ASCII diagrams for data flow and component trees
- Never leave a non-obvious pattern unexplained
- Code blocks should be complete and copy-pasteable — no `...` ellipsis placeholders
- Build order matters: always go leaf → root so each file only depends on things already written

---

## How to invoke this skill

After finishing a web app, say:

> "Generate the learning directory for this project"

Claude will read the codebase, then produce all 5 files tailored to the specific app — its actual stack, its actual components, its actual data model. The files in `template/learning/` are examples from a Kanban board app built with Next.js + Supabase + dnd-kit + Tailwind v4. Use them as reference for tone, depth, and structure.

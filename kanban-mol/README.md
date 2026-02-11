# Kanban Board - $mol

A kanban board built with the [$mol](https://mol.hyoo.ru/) framework.

## Features

- Drag-and-drop kanban board with 4 columns (Backlog, Todo, In Progress, Done)
- Card management with tags, assignees, descriptions
- Comments on cards
- Card detail panel with inline editing
- Theme toggle (light/dark)
- Virtual scrolling via `$mol_list`
- Reactive state management via `$mol_mem`

## Tech Stack

- **Framework**: $mol (MAM build system)
- **UI**: `$mol_book2`, `$mol_page`, `$mol_card`, `$mol_list`
- **Drag & Drop**: `$mol_drag` + `$mol_drop`
- **State**: `$mol_mem`, `$mol_state_arg` (URL routing)
- **Data**: Client-side mock (no server/DB)

## Why Docker?

$mol uses [MAM](https://github.com/hyoo-ru/mam) — a zero-config build system that resolves dependencies by filesystem path. Class `$kanban`must live at path`kanban/`inside a MAM workspace root. MAM auto-downloads`mol/` and other dependencies via git at build time.

Docker provides an isolated MAM workspace out of the box — no manual setup needed.

## Quick Start

```bash
docker compose up --build
# Open http://localhost:9080/kanban/-/test.html
```

## Local Development (MAM workspace)

If you already have a MAM workspace:

```bash
cp -r kanban/ /path/to/mam/kanban/
cd /path/to/mam
npm start
# Open http://localhost:9080/kanban/-/test.html
```

## Project Structure

```
kanban-mol/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── kanban/
    ├── index.html                # Entry point
    ├── kanban.view.tree          # Root component ($mol_book2)
    ├── kanban.view.ts            # Root logic (routing, domain)
    ├── kanban.view.css.ts        # Root styles
    ├── board/
    │   ├── board.view.tree       # Board page with columns
    │   ├── board.view.ts
    │   └── board.view.css.ts
    ├── column/
    │   ├── column.view.tree      # Column with drag-n-drop
    │   ├── column.view.ts
    │   └── column.view.css.ts
    ├── card/
    │   ├── card.view.tree        # Card component
    │   ├── card.view.ts
    │   └── card.view.css.ts
    ├── detail/
    │   ├── detail.view.tree      # Card detail/edit panel
    │   ├── detail.view.ts
    │   └── detail.view.css.ts
    └── domain/
        └── domain.ts             # Data models and mock data
```

## How It Works

- **`$mol_book2`** provides responsive panel navigation (board + detail side-by-side)
- **`$mol_drag` + `$mol_drop`** handle native HTML5 drag-and-drop between columns
- **`$mol_state_arg`** maps URL params to selected card (deep-linkable)
- **`$mol_mem`** provides automatic dependency tracking and caching
- **`.view.tree`** files define component structure declaratively
- **`.view.ts`** files add reactive logic
- **`.view.css.ts`** files provide type-safe styling

## License

MIT

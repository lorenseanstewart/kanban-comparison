# Kanban Nuxt

Kanban board built with Nuxt 3, Vue 3 Composition API, and SQLite.

## Setup

```bash
npm install
```

## Database

Initialize and seed the database:

```bash
npx drizzle-kit push
npm run seed
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm run preview
```

## Features

- Vue 3 Composition API with `<script setup>`
- Auto-imports for composables and components
- Valibot validation
- Typed API routes with Nuxt server handlers
- Error handling with loading states
- Server ID reconciliation for optimistic updates

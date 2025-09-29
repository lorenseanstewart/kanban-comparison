# Trello Solid

## Overview

Kanban-style board built with SolidStart, Drizzle ORM, and SQLite. Each board has the static lists `Todo`, `In-Progress`, `QA`, and `Done`; cards support assignees, tags, and comments with real-time-friendly data structures.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Database

### Generate Schema

```bash
npx drizzle-kit generate
```

### Apply Migrations

Remove any existing database file if you want a clean slate:

```bash
rm -f drizzle/db.sqlite
```

Then apply migrations:

```bash
npx drizzle-kit push
```

### Seed Data

```bash
npm run seed
```

The seed script inserts deterministic users, boards, lists, cards, tags, tag links, and comments.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

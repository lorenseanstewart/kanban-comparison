# kanban-analog

This project was generated with [Analog](https://analogjs.org), the fullstack meta-framework for Angular.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database (reset, migrate, and seed):
```bash
npm run setup
```

Alternatively, you can run the database commands individually:
- `npm run db:reset` - Delete database files
- `npm run db:migrate` - Run database migrations
- `npm run seed` - Seed the database with sample data

## Development

Run `npm start` for a dev server. Navigate to `http://localhost:5173/`. The application automatically reloads if you change any of the source files.

## Database Commands

- `npm run db:generate` - Generate new migrations from schema changes
- `npm run db:migrate` - Run pending database migrations
- `npm run db:push` - Push schema changes directly to the database
- `npm run db:reset` - Delete all database files
- `npm run seed` - Seed the database with sample data
- `npm run setup` - Complete database setup (reset + migrate + seed)

## Build

Run `npm run build` to build the client/server project. The client build artifacts are located in the `dist/analog/public` directory. The server for the API build artifacts are located in the `dist/analog/server` directory.

## Community

- Visit and Star the [GitHub Repo](https://github.com/analogjs/analog)
- Join the [Discord](https://chat.analogjs.org)
- Follow us on [Twitter](https://twitter.com/analogjs)
- Become a [Sponsor](https://github.com/sponsors/brandonroberts)

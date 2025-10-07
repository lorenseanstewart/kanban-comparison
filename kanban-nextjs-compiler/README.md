# Kanban Next.js (with React Compiler)

Experimental variant with **React 19's compiler** enabled for automatic optimization.

## What's Different?

- Enables `experimental.reactCompiler: true` in `next.config.ts`
- Auto-memoizes renders, computations, and callbacks without manual `useMemo`/`useCallback`
- Same code as standard Next.js app - compiler optimizes automatically
- ~3% smaller bundle size

**Note**: Still experimental - not recommended for production.

## Setup

```bash
npm install
```

## Database

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
npm start
```

## More Info

- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Next.js Integration](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)

# State Management

This document explains state management patterns using SolidJS primitives.

## Reactive Primitives

SolidJS provides fine-grained reactivity through signals and derived state.

### Signals

Local mutable state:

```tsx
import { createSignal } from "solid-js";

const [count, setCount] = createSignal(0);

// Read
console.log(count());

// Write
setCount(count() + 1);
setCount(prev => prev + 1); // Updater function
```

### Memos (Derived State)

Computed values that update when dependencies change:

```tsx
import { createMemo } from "solid-js";

const [firstName, setFirstName] = createSignal("John");
const [lastName, setLastName] = createSignal("Doe");

const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"
```

**Memos are cached** - Only recompute when dependencies change.

### Effects

Side effects that run when dependencies change:

```tsx
import { createEffect } from "solid-js";

createEffect(() => {
  console.log("Count changed:", count());
});
```

**Used sparingly** - Most reactivity handled by JSX.

## State Patterns in This App

### 1. Server State (Cached Queries)

```tsx
const boardData = createAsync(() => fetchBoard({ id: params.id }));
```

**Characteristics:**
- Source of truth is the server
- Cached by SolidStart router
- Automatically refetched on navigation
- Preloaded in route definitions

**Location:** `src/api/index.ts`

---

### 2. Local UI State

```tsx
const [board, setBoard] = createSignal<BoardDetails | null>(null);
```

**Characteristics:**
- Mutable copy for optimistic updates
- Synced with server state via `createEffect`
- Isolated to component or page

**Sync Pattern:**
```tsx
createEffect(() => {
  const data = boardData();
  if (data) {
    setBoard(data);
  }
});
```

---

### 3. Modal State

```tsx
const [isModalOpen, setIsModalOpen] = createSignal(false);
```

**Characteristics:**
- Boolean flags for open/closed
- Scoped to parent component
- Passed to modal as props

---

### 4. Form State

```tsx
const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(new Set());
```

**Characteristics:**
- Transient state (cleared after submission)
- Not persisted to server until form submit
- Can use controlled or uncontrolled inputs

---

## Data Flow

### Read Path (Server → UI)

```
1. Route loads
2. Preload function runs → fetchBoard()
3. Server query executes
4. Data returned and cached
5. createAsync() signal updates
6. createEffect() syncs to local state
7. Components re-render
```

### Write Path (UI → Server → UI)

```
1. User action
2. Local state updated (optimistic)
3. UI re-renders immediately
4. Server action called
5. Database mutated
6. Cache invalidated
7. Server query refetches
8. Local state syncs with fresh data
```

## Why Not Global State Management?

This app intentionally avoids global state libraries (Zustand, Redux, etc.) because:

1. **Server state is cached** - SolidStart router handles caching
2. **Local state is scoped** - Each page/component owns its state
3. **No shared client state** - No need for global stores
4. **Prop drilling is minimal** - Components are small and focused

**When to use global state:**
- User authentication (not in this app)
- Theme preferences
- Multi-page wizards
- Shopping cart state

## Context API (Not Used)

SolidJS provides context for shared state:

```tsx
import { createContext, useContext } from "solid-js";

const ThemeContext = createContext();

function ThemeProvider(props) {
  const [theme, setTheme] = createSignal("light");
  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {props.children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}
```

**Not needed in this app** - State is localized to routes.

## Best Practices

1. **Prefer signals over stores** - For local state
2. **Use memos for expensive computations** - Avoid recalculation
3. **Sync server state to local state** - Via `createEffect`
4. **Keep state close to usage** - Avoid prop drilling
5. **Use optimistic updates** - For instant UI feedback
6. **Revalidate after mutations** - Keep server state fresh

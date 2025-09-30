# Error Handling

This document explains error handling strategies used throughout the application.

## Error Boundaries

SolidJS provides `ErrorBoundary` components to catch errors in the component tree.

### Implementation

```tsx
import { ErrorBoundary } from "~/components/ErrorBoundary";

<ErrorBoundary>
  <BoardOverview data={board} />
</ErrorBoundary>
```

**Location:** `src/components/ErrorBoundary.tsx`

### Custom Error Boundary

```tsx
import { ErrorBoundary as SolidErrorBoundary } from "solid-js";

export function ErrorBoundary(props: { children: any }) {
  return (
    <SolidErrorBoundary
      fallback={(error) => (
        <div class="alert alert-error">
          <h3>Something went wrong</h3>
          <p>{error.message || "An unexpected error occurred"}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}
```

### Placement Strategy

Error boundaries are placed at strategic levels:

1. **Page Level** - Wraps entire page content
2. **Section Level** - Wraps major sections (overview, lists)
3. **Component Level** - Wraps individual components (modals, charts)

**Example from board page:**
```tsx
<ErrorBoundary>
  <BoardOverview data={data} />
</ErrorBoundary>

<ErrorBoundary>
  <CardList list={list} />
</ErrorBoundary>
```

**Benefit:** If one section fails, others continue working.

## Server Action Errors

All server actions use try-catch blocks:

```tsx
export async function createCard(formData: FormData) {
  try {
    // Validation
    // Database operations
    // Cache invalidation
  } catch (error) {
    console.error("Failed to create card:", error);
    throw new Error("Failed to create card. Please try again.");
  }
}
```

### Error Flow

1. Server action throws error
2. Error propagates to client
3. Client's error boundary catches it
4. Fallback UI displayed
5. Optimistic update reverted (if applicable)

## Database Connection Errors

Database initialization includes error handling:

```tsx
try {
  sqlite = new Database('./drizzle/db.sqlite');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
} catch (error) {
  console.error("Failed to initialize database:", error);
  throw new Error("Database connection failed.");
}
```

**Effect:** App fails fast at startup if database is unavailable.

## Drag-Drop Error Handling

Drag-drop operations revert on failure:

```tsx
try {
  await updateCardList(cardId, newListId);
} catch (error) {
  console.error("Failed to persist card move:", error);
  revertToServerState(); // Revert UI
}
```

**User Experience:** Card "snaps back" to original position if server update fails.

## Loading States

While not technically errors, loading states prevent user confusion:

```tsx
<Show
  when={board()}
  fallback={
    <div class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>
  }
>
  {(data) => <BoardContent data={data} />}
</Show>
```

## Future Improvements

1. **Toast Notifications** - Show errors without disrupting UI
2. **Retry Mechanisms** - Allow users to retry failed operations
3. **Offline Detection** - Gracefully handle offline state
4. **Sentry Integration** - Track errors in production
5. **Validation Error Display** - Show inline validation errors in forms

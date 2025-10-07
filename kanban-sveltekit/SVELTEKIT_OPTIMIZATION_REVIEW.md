# SvelteKit Implementation Review & Optimization Recommendations

## Summary
This document outlines SvelteKit-specific optimizations and convention improvements for the Kanban board application.

## Issues & Recommendations

### 1. ❌ Inefficient Data Syncing in `+page.svelte`

**Current Code (lines 12-16):**
```svelte
$effect(() => {
  if (JSON.stringify(data.boards) !== JSON.stringify(boards)) {
    boards = data.boards;
  }
});
```

**Problem:**
- JSON.stringify is expensive and unnecessary
- SvelteKit's `data` prop already handles reactivity
- This creates an anti-pattern where you're maintaining duplicate state

**Solution:**
Remove the local state entirely and use `data.boards` directly, or use `$state.raw()` without the effect:

```svelte
let { data }: { data: PageData } = $props();
// Just use data.boards directly in the template
```

### 2. ❌ Manual Fetch Instead of Form Actions

**Current Code (`board/[id]/+page.svelte`, lines 109-131):**
```svelte
await fetch(`?/updateCardList`, {
  method: 'POST',
  body: formData
});
```

**Problem:**
- Bypasses SvelteKit's progressive enhancement
- No automatic error handling
- Doesn't benefit from `use:enhance` optimizations
- Manual fetch doesn't integrate with SvelteKit's data invalidation

**Solution:**
Use hidden forms with `use:enhance`:

```svelte
<form
  method="POST"
  action="?/updateCardList"
  use:enhance={() => {
    return async ({ result, update }) => {
      if (result.type === 'success') {
        await invalidate('board:data');
      }
      await update();
    };
  }}
>
  <input type="hidden" name="cardId" value={cardId} />
  <input type="hidden" name="newListId" value={newListId} />
</form>
```

Or create a programmatic submission helper:

```svelte
async function submitAction(action: string, data: FormData) {
  const response = await fetch(`?/${action}`, {
    method: 'POST',
    body: data
  });

  if (response.ok) {
    await invalidate('board:data');
  }

  return response;
}
```

### 3. ❌ Missing Proper Invalidation Strategy

**Current Code:**
Uses `invalidateAll()` which refetches ALL data on every mutation.

**Problem:**
- Inefficient - refetches unrelated data
- Doesn't follow SvelteKit's granular invalidation pattern

**Solution:**
Use dependency tracking in load functions:

```ts
// +page.server.ts
export const load: PageServerLoad = async ({ params, depends }) => {
  depends('board:data');

  const board = await getBoard(params.id);
  // ...
};
```

Then use specific invalidation:
```svelte
import { invalidate } from '$app/navigation';

// After mutations:
await invalidate('board:data');
```

### 4. ❌ Optimistic Updates Don't Handle Failures

**Current Code:**
Updates UI immediately but doesn't revert on error.

**Problem:**
- If server action fails, UI shows incorrect state
- No user feedback on errors

**Solution:**
Add rollback logic:

```svelte
async function handleFinalize(listId: string, e: CustomEvent<DndEvent<BoardCard>>) {
  const { items } = e.detail;
  const previousBoard = structuredClone(board);

  // Optimistic update
  board = {
    ...board,
    lists: board.lists.map((list) =>
      list.id === listId ? { ...list, cards: items } : list
    )
  };

  try {
    // Submit to server
    const response = await submitAction('updateCardPositions', formData);

    if (!response.ok) {
      // Rollback on error
      board = previousBoard;
      // Show error toast/notification
    }
  } catch (error) {
    // Rollback on error
    board = previousBoard;
  }
}
```

### 5. ❌ Missing Error Boundaries and Server Error Handling

**Current Code:**
No try-catch in server functions like `getBoard()`.

**Problem:**
- Database errors crash the page
- No graceful degradation

**Solution:**

Add error handling in `src/lib/server/boards.ts`:

```ts
export async function getBoard(boardId: string): Promise<BoardDetails | null> {
  try {
    const board = await db
      .select({
        id: boards.id,
        title: boards.title,
        description: boards.description
      })
      .from(boards)
      .where(eq(boards.id, boardId))
      .get();

    if (!board) {
      return null;
    }

    // ... rest of the function
  } catch (error) {
    console.error('Error fetching board:', error);
    throw error; // Re-throw to trigger error page
  }
}
```

Add `+error.svelte` page:

```svelte
<!-- src/routes/board/[id]/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-error">Error Loading Board</h2>
      <p>{$page.error?.message || 'An unexpected error occurred'}</p>
      <div class="card-actions">
        <a href="/" class="btn btn-primary">Back to Boards</a>
      </div>
    </div>
  </div>
</div>
```

### 6. ❌ `$state.raw()` Misuse

**Current Code (`+page.svelte`, line 8):**
```svelte
let boards = $state.raw<BoardSummary[]>(data.boards);
```

**Problem:**
- `$state.raw()` makes the array non-reactive
- Then you try to sync it with an effect, which defeats the purpose

**Solution:**
Either use regular `$state()` for reactivity or work directly with `data.boards`:

```svelte
// Option 1: Direct usage (best for this case)
let { data }: { data: PageData } = $props();
// Use data.boards directly in template

// Option 2: If you need local mutations
let boards = $state<BoardSummary[]>(data.boards);

// Update when data changes
$effect(() => {
  boards = data.boards;
});
```

### 7. ✅ Good Patterns to Keep

1. **Progressive Enhancement** - Forms work without JavaScript via `use:enhance`
2. **Optimistic UI** - Immediate feedback for user actions
3. **Transaction Usage** - Database operations are properly wrapped in transactions
4. **Validation** - Using Valibot for server-side validation
5. **Type Safety** - Strong typing with TypeScript throughout

### 8. 🔧 Additional Optimizations

#### A. Add Request Deduplication
For drag-and-drop, debounce position updates:

```svelte
import { debounce } from '$lib/utils';

const debouncedUpdatePositions = debounce(async (cardIds: string[]) => {
  const formData = new FormData();
  cardIds.forEach(id => formData.append('cardIds', id));
  await submitAction('updateCardPositions', formData);
}, 300);
```

#### B. Add Loading States
Show loading indicators during mutations:

```svelte
let isUpdating = $state(false);

async function handleFinalize(...) {
  isUpdating = true;
  try {
    // ... mutation logic
  } finally {
    isUpdating = false;
  }
}
```

#### C. Use `afterNavigate` for Scroll Restoration

```svelte
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
  // Custom scroll restoration logic if needed
});
```

#### D. Preload Board Data

```svelte
<!-- In board list -->
<a
  href="/board/{board.id}"
  data-sveltekit-preload-data="hover"
  class="card ..."
>
```

## Priority Fixes

1. **HIGH**: Remove manual `fetch()` calls, use form actions with `use:enhance`
2. **HIGH**: Add error handling in server functions and create error pages
3. **MEDIUM**: Implement proper optimistic update rollback
4. **MEDIUM**: Use `depends()` and `invalidate()` for granular data updates
5. **LOW**: Add debouncing for drag-and-drop position updates
6. **LOW**: Add loading states and better UX feedback

## Performance Checklist

- [ ] Remove unnecessary `$effect` in `+page.svelte`
- [ ] Replace `fetch()` with form actions
- [ ] Add `depends()` to load functions
- [ ] Use `invalidate()` instead of `invalidateAll()`
- [ ] Add error boundaries (`+error.svelte`)
- [ ] Add try-catch in server functions
- [ ] Implement optimistic update rollback
- [ ] Add debouncing for frequent updates
- [ ] Enable preloading with `data-sveltekit-preload-data`
- [ ] Add loading states for better UX

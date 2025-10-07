# Qwik City App Optimization Review

## Executive Summary

The Qwik City Kanban application has been reviewed against the latest Qwik best practices (2025). While the app demonstrates good understanding of core Qwik concepts, several areas need optimization to align with framework conventions and maximize performance.

---

## Critical Issues ⚠️

### 1. **Excessive use of `useVisibleTask$`**

**Location:**
- `src/components/BoardOverview.tsx:14`
- `src/components/modals/AddBoardModal.tsx:15`
- `src/components/modals/CardEditModal.tsx:30,44`
- `src/components/charts/BarChart.tsx:54`

**Problem:**
`useVisibleTask$()` eagerly loads and executes JavaScript on the client, blocking the main thread and defeating Qwik's resumability benefits. The Qwik docs explicitly state: "useVisibleTask$() should be used as a last resort."

**Current Usage:**
```tsx
// BoardOverview - checking if mounted
useVisibleTask$(() => {
  mounted.value = true;
});

// Modals - controlling dialog show/close
useVisibleTask$(({ track }) => {
  track(() => isOpen.value);
  if (dialogRef.value) {
    if (isOpen.value) {
      dialogRef.value.showModal();
    } else {
      dialogRef.value.close();
    }
  }
});
```

**Recommended Solutions:**

1. **For Chart Mounting:** Use CSS-only transitions or server-side rendering with progressive enhancement
```tsx
// Remove useVisibleTask$ entirely, use CSS animations
export const BoardOverview = component$<BoardOverviewProps>(({ data }) => {
  const chartData = useComputed$(() => {
    return data.lists.map((list) => ({
      label: list.title,
      value: list.cards.length,
    }));
  });

  return (
    <section class="animate-fade-in">
      <BarChart data={chartData.value} colors={pastelColors} title="Cards per List" />
      <PieChart data={chartData.value} colors={pastelColors} title="Distribution" />
    </section>
  );
});
```

2. **For Modal Dialog Control:** Use declarative rendering with `<dialog>` attributes
```tsx
// Remove useVisibleTask$, use open attribute
export const AddBoardModal = component$<AddBoardModalProps>(({ isOpen, action, onBoardAdd }) => {
  return (
    <dialog open={isOpen.value} class="modal">
      {/* modal content */}
    </dialog>
  );
});
```

Alternatively, use `useTask$` with `isServer` guard if client-side effects are truly needed:
```tsx
useTask$(({ track }) => {
  track(() => isOpen.value);

  if (!isServer && dialogRef.value) {
    if (isOpen.value) {
      dialogRef.value.showModal();
    } else {
      dialogRef.value.close();
    }
  }
});
```

### 2. **Inefficient State Synchronization**

**Location:** `src/routes/index.tsx:89-91`

**Problem:**
State synchronization uses `JSON.stringify` for deep comparison on every render:

```tsx
if (boardsLoader.value && JSON.stringify(boardsState.value) !== JSON.stringify(boardsLoader.value)) {
  boardsState.value = boardsLoader.value;
}
```

**Issues:**
- Performs expensive serialization on every component execution
- Runs synchronously in the component body instead of a reactive context
- Doesn't track changes properly with Qwik's reactivity system

**Recommended Solution:**
```tsx
// Use useTask$ for reactive data synchronization
useTask$(({ track }) => {
  const loaderData = track(() => boardsLoader.value);
  if (loaderData) {
    boardsState.value = loaderData;
  }
});
```

### 3. **Missing Error Rollback in Optimistic Updates**

**Location:** `src/routes/board/[id]/index.tsx:564-617`

**Problem:**
The card drop handler stores original state but doesn't always restore it properly on error:

```tsx
const handleCardDrop = $(async (cardId: string, targetListId: string, newPosition: number) => {
  const originalState = JSON.parse(JSON.stringify(boardState.value));

  // Optimistically update UI
  boardState.value = updatedState;

  // Call server action
  const result = await moveCardAction.submit({...});

  // Only reverts on explicit failure
  if (!result.value?.success) {
    boardState.value = originalState;
  }
});
```

**Issues:**
- Doesn't handle network errors or timeouts
- No user feedback during optimistic update
- Uses expensive `JSON.parse(JSON.stringify())` for cloning

**Recommended Solution:**
```tsx
const handleCardDrop = $(async (cardId: string, targetListId: string, newPosition: number) => {
  if (!boardState.value) return;

  // Store original state
  const originalState = structuredClone(boardState.value);

  try {
    // Optimistically update the UI
    const updatedLists = /* ... optimistic update logic ... */;
    boardState.value = { ...boardState.value, lists: updatedLists };

    // Call server action
    const result = await moveCardAction.submit({ cardId, targetListId, newPosition });

    // Revert on error
    if (!result.value?.success) {
      boardState.value = originalState;
      // Show error toast/notification
      console.error("Failed to move card:", result.value?.error);
    }
  } catch (error) {
    // Revert on exception
    boardState.value = originalState;
    console.error("Network error moving card:", error);
  }
});
```

---

## Major Issues 🔴

### 4. **routeAction$ Not Using Zod/Valibot for Validation**

**Location:** Multiple route actions

**Problem:**
Actions manually extract and validate form data instead of using Qwik's built-in validation with Valibot:

```tsx
export const useCreateBoardAction = routeAction$(
  async (formData) => {
    const data = extractFormData(formData);
    const title = data.title as string;

    const result = v.safeParse(BoardSchema, { title, description });
    if (!result.success) {
      return { success: false, error: result.issues[0].message };
    }
    // ...
  }
);
```

**Recommended Solution:**
Use Qwik City's built-in validation with `valibot$()`:

```tsx
import { valibot$ } from '@builder.io/qwik-city';

export const useCreateBoardAction = routeAction$(
  async (data, requestEvent) => {
    // data is already validated and typed
    const boardId = crypto.randomUUID();

    await db.insert(boards).values({
      id: boardId,
      title: data.title,
      description: data.description,
    });

    return { success: true, boardId };
  },
  valibot$(BoardSchema)
);
```

**Benefits:**
- Automatic type inference
- Cleaner code
- Better error handling with `action.value.fieldErrors`
- Progressive enhancement support

### 5. **Not Using `useComputed$` for Derived Values**

**Location:** `src/components/BoardOverview.tsx:26-32`

**Current:**
```tsx
const chartData = useComputed$(() => {
  return data.lists.map((list) => ({
    label: list.title,
    value: list.cards.length,
  }));
});
```

**Issue:** This is actually correct! The app IS using `useComputed$` properly here. ✅

However, there are other places where computed values could be used:

**Location:** `src/routes/board/[id]/index.tsx:654`

```tsx
// Instead of inline calculation in JSX
key={JSON.stringify(boardState.value?.lists.map(l => ({ id: l.id, count: l.cards.length })))}
```

**Recommended:**
```tsx
const boardListsKey = useComputed$(() =>
  boardState.value?.lists.map(l => ({ id: l.id, count: l.cards.length })) ?? []
);

// In JSX
<BoardOverview
  key={JSON.stringify(boardListsKey.value)}
  data={boardState.value || board.value}
/>
```

### 6. **Form Data Extraction Utility Is Unnecessary**

**Location:** `src/routes/index.tsx:16-26`, `src/routes/board/[id]/index.tsx:30-40`

**Problem:**
Custom `extractFormData()` function is used to handle both FormData and objects, but Qwik's `routeAction$` with validation handles this automatically.

**Current:**
```tsx
function extractFormData(data: FormData | Record<string, any>): Record<string, any> {
  if (data instanceof FormData) {
    const result: Record<string, any> = {};
    for (const [key, value] of data.entries()) {
      result[key] = value;
    }
    return result;
  }
  return data;
}
```

**Recommended:**
Remove this entirely and use Qwik's built-in validation. With `valibot$()`, the action receives a typed object automatically.

---

## Performance Optimizations ⚡

### 7. **Inline Template Operations**

**Status:** ✅ Good!

The app correctly inlines most operations in templates:

```tsx
// Good example from CardList
{list.cards.length === 0 ? (
  <div class="alert alert-info text-sm">
    <span>No cards yet</span>
  </div>
) : (
  // render cards
)}
```

### 8. **Signal Reads and Reactivity**

**Status:** ⚠️ Mixed

Some places read signals in component functions (causing re-renders), while others properly use `useComputed$` and `useTask$`.

**Problem Example:** `src/routes/board/[id]/index.tsx:654`
```tsx
// Reading signal directly in JSX causes full component re-render
<BoardOverview
  key={JSON.stringify(boardState.value?.lists.map(l => ({ id: l.id, count: l.cards.length })))}
  data={boardState.value || board.value}
/>
```

**Recommended:**
```tsx
const boardOverviewData = useComputed$(() => boardState.value || board.value);
const boardKey = useComputed$(() =>
  JSON.stringify(boardOverviewData.value?.lists.map(l => ({ id: l.id, count: l.cards.length })) ?? [])
);

<BoardOverview key={boardKey.value} data={boardOverviewData.value} />
```

### 9. **Database Queries Optimization**

**Location:** `src/db/actions.ts:29-117`

**Problem:**
The `updateCardListAndPosition` function performs multiple sequential database operations in a loop:

```tsx
for (const c of oldListCards) {
  await db.update(cards)
    .set({ position: c.position - 1 })
    .where(eq(cards.id, c.id))
    .run();
}
```

**Recommended:**
Use batch operations or SQL UPDATE with range conditions:

```tsx
// Instead of loop, use single query with WHERE clause
await db.update(cards)
  .set({ position: sql`${cards.position} - 1` })
  .where(and(
    eq(cards.listId, oldListId),
    gte(cards.position, oldPosition + 1)
  ))
  .run();
```

This reduces N database round-trips to 1.

---

## Code Quality Issues 🔧

### 10. **Missing Type Safety for Actions**

**Location:** All `routeAction$` declarations

**Problem:**
Action return types are not explicitly defined:

```tsx
updateCardAction?: ActionStore<any, any, true>;
```

**Recommended:**
```tsx
type UpdateCardActionReturn =
  | { success: true }
  | { success: false; error: string };

updateCardAction?: ActionStore<UpdateCardActionReturn, Record<string, any>, true>;
```

### 11. **Inconsistent Error Handling**

**Problem:**
Some actions use try/catch, others don't. Error messages are inconsistent.

**Recommended Pattern:**
```tsx
export const useCreateCardAction = routeAction$(
  async (data, requestEvent) => {
    try {
      const cardId = crypto.randomUUID();
      // ... db operations

      return { success: true, cardId } as const;
    } catch (error) {
      console.error("Failed to create card:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create card"
      } as const;
    }
  },
  valibot$(CardSchema)
);
```

### 12. **No Loading States During Navigation**

**Problem:**
No visual feedback when actions are running (though `action.isRunning` is checked in some places).

**Recommendation:**
Consistently use loading states:

```tsx
<button type="submit" class="btn btn-primary" disabled={action.isRunning}>
  {action.isRunning ? (
    <>
      <span class="loading loading-spinner loading-sm"></span>
      Saving...
    </>
  ) : (
    "Save Changes"
  )}
</button>
```

---

## Best Practices Summary ✅

### What's Working Well:

1. ✅ **Route structure** - Proper use of `layout.tsx` and `index.tsx`
2. ✅ **Component composition** - Good separation of concerns
3. ✅ **Server actions** - Correctly using `routeAction$` and `routeLoader$`
4. ✅ **Progressive enhancement** - Forms work without JS
5. ✅ **DaisyUI integration** - Clean UI with proper theming
6. ✅ **Type safety** - Good TypeScript usage overall
7. ✅ **useComputed$** - Used in BoardOverview for derived data

### Priority Fixes:

1. 🔴 **High:** Replace all `useVisibleTask$` with alternatives
2. 🔴 **High:** Add proper error handling and rollback for optimistic updates
3. 🟡 **Medium:** Use `valibot$()` in all routeAction$ validators
4. 🟡 **Medium:** Optimize database queries to batch operations
5. 🟢 **Low:** Add consistent loading states
6. 🟢 **Low:** Improve type safety for action returns

---

## Migration Checklist

- [ ] Replace `useVisibleTask$` in BoardOverview with CSS animations
- [ ] Replace `useVisibleTask$` in modals with declarative rendering or `useTask$`
- [ ] Replace `useVisibleTask$` in BarChart with CSS-only animations
- [ ] Refactor state sync in index.tsx to use `useTask$`
- [ ] Add proper error handling to all optimistic updates
- [ ] Migrate all `routeAction$` to use `valibot$()` validation
- [ ] Remove `extractFormData` utility functions
- [ ] Optimize database queries in `updateCardListAndPosition`
- [ ] Add explicit return types for all actions
- [ ] Add consistent loading states across all forms

---

## References

- [Qwik Best Practices](https://qwik.dev/docs/guides/best-practices/)
- [routeAction$ Documentation](https://qwik.dev/docs/action/)
- [Tasks and Lifecycle](https://qwik.dev/docs/components/tasks/)
- [Serialization Guide](https://qwik.dev/docs/guides/serialization/)

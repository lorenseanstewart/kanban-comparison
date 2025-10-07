# Optimistic Updates

This document explains the optimistic update pattern used throughout the application for instant UI feedback.

## What Are Optimistic Updates?

Optimistic updates are a UI pattern where the interface updates immediately when a user performs an action, before waiting for server confirmation.

**Traditional Flow (Pessimistic):**
```
User Action → Server Request → Wait → Server Response → Update UI
                                ↑
                          (User waits here)
```

**Optimistic Flow:**
```
User Action → Update UI Immediately → Server Request (background)
                  ↑
          (User sees instant feedback)

              → Server Response → Success: Keep UI as-is
                                → Error: Revert UI
```

## Benefits

1. **Perceived Performance**: UI feels instant, even with network latency
2. **Better UX**: Users can continue interacting without waiting
3. **Offline-First Ready**: UI updates work even before server confirms
4. **Reduced Perceived Latency**: 500ms feels like 0ms

## Implementation Pattern

All optimistic updates in this app follow the same 3-step pattern:

### 1. Update Local State

```tsx
const [board, setBoard] = createSignal<BoardDetails | null>(null);

// Optimistically update local state
const updatedBoard = {
  ...board(),
  lists: board().lists.map(list =>
    list.id === listId ? { ...list, cards: newCardOrder } : list
  ),
};
setBoard(updatedBoard);
```

### 2. Persist to Server (Background)

```tsx
try {
  await updateCardPositions(cardIds);
} catch (error) {
  console.error("Failed to persist update:", error);
  revertToServerState();
}
```

### 3. Revert on Error

```tsx
const revertToServerState = () => {
  const serverData = boardData(); // Original data from server
  if (serverData) {
    setBoard(serverData);
  }
};
```

---

## Examples from the App

### 1. Board Creation

**Location:** `src/routes/index.tsx:28`

```tsx
const handleBoardAdd = (boardData: { title: string; description: string | null }) => {
  // 1. Optimistic update
  const newBoard: BoardSummary = {
    id: crypto.randomUUID(),
    title: boardData.title,
    description: boardData.description,
  };
  setBoards([...boards(), newBoard]);

  // 2. Server persist (happens in background via form submission)
  // 3. Revert is handled by form revalidation
};
```

**User Experience:**
- User clicks "Add Board" and sees new board immediately
- Can click on it before server confirms creation
- If creation fails, board disappears and error is shown

---

### 2. Card Creation

**Location:** `src/routes/board/[id].tsx:86`

```tsx
const handleCardAdd = (cardData: { title: string; ... }) => {
  // 1. Optimistic update
  const newCard: BoardCard = {
    id: crypto.randomUUID(),
    title: cardData.title,
    position: todoList.cards.length,
    tags: allTags().filter(t => cardData.tagIds.includes(t.id)),
    comments: [],
    ...cardData,
  };

  const updatedBoard = {
    ...currentBoard(),
    lists: currentBoard().lists.map(list =>
      list.title === "Todo"
        ? { ...list, cards: [...list.cards, newCard] }
        : list
    ),
  };
  setBoard(updatedBoard);

  // 2. Server persist (modal form submission)
  // 3. Revert on error via revalidation
};
```

**User Experience:**
- User submits card form and modal closes immediately
- New card appears in Todo list instantly
- User can drag it around before server confirms
- If creation fails, card disappears

---

### 3. Card Update

**Location:** `src/routes/board/[id].tsx:68`

```tsx
const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
  // 1. Optimistic update
  const updatedBoard = {
    ...currentBoard(),
    lists: currentBoard().lists.map(list => ({
      ...list,
      cards: list.cards.map(card =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    })),
  };
  setBoard(updatedBoard);

  // 2. Server persist (happens in edit modal)
  // 3. Revert on error via revalidation
};
```

**User Experience:**
- User edits card title and clicks Save
- Modal closes and card title updates instantly
- If update fails, card reverts to original state

---

### 4. Drag-and-Drop Move

**Location:** `src/lib/drag-drop/hooks.ts:26`

```tsx
const handleDragEnd: DragEventHandler = async (event) => {
  // 1. Optimistic update (with view transition)
  withViewTransition(() => {
    setBoard(createCrossListUpdate(board(), dragResult));
  });

  // 2. Server persist
  try {
    await updateCardList(dragResult.cardId, dragResult.targetListId);
  } catch (error) {
    // 3. Revert on error
    console.error("Failed to persist card move:", error);
    revertToServerState();
  }
};
```

**User Experience:**
- User drags card to new list
- Card moves immediately with smooth animation
- If server update fails, card "snaps back" to original position

---

### 5. Comment Addition

**Location:** `src/components/DraggableCard.tsx:31`

```tsx
const handleCommentAdd = (comment: { userId: string; text: string }) => {
  // 1. Optimistic update
  const newComment = {
    id: crypto.randomUUID(),
    cardId: props.card.id,
    userId: comment.userId,
    text: comment.text,
    createdAt: new Date(),
  };

  props.onCardUpdate(props.card.id, {
    comments: [...props.card.comments, newComment],
  });

  // 2. Server persist (modal form submission)
  // 3. Revert on error via revalidation
};
```

**User Experience:**
- User types comment and hits Submit
- Comment appears instantly in the list
- If server fails, comment disappears

---

## Cache Revalidation

After server operations complete, SolidStart's cache is revalidated:

```tsx
import { revalidate } from "@solidjs/router";

// Revalidate specific cache keys
revalidate(["boards:detail"]);
revalidate(["boards:list", "boards:detail"]);
```

**Effect:**
- Refetches data from server
- Updates `createAsync` signals
- Overwrites optimistic updates with confirmed data
- Corrects any discrepancies (e.g., server-generated IDs)

---

## UUID Generation

Optimistic updates require client-side ID generation:

```tsx
const newId = crypto.randomUUID(); // Browser-native UUID v4
```

**Why UUIDs?**
- No server round-trip needed for ID assignment
- Prevents ID collisions between client and server
- Enables offline-first architectures

**Alternative:**
- Use temporary IDs (e.g., `temp-123`) and replace with server IDs
- **Trade-off:** More complex state reconciliation

---

## Rollback Strategies

### 1. Revalidation Rollback (Current Approach)

```tsx
try {
  await serverMutation();
} catch (error) {
  // Trigger refetch of server data
  const serverData = boardData();
  setBoard(serverData);
}
```

**Pros:**
- Simple implementation
- Always shows correct server state after error

**Cons:**
- Requires network request to revert
- Won't work if offline

---

### 2. State Snapshot Rollback (Alternative)

```tsx
const snapshot = board(); // Save state before optimistic update

try {
  setBoard(optimisticUpdate);
  await serverMutation();
} catch (error) {
  setBoard(snapshot); // Restore saved state
}
```

**Pros:**
- Works offline
- Instant rollback (no network)

**Cons:**
- Must manually save state before each update
- Risk of stale data if concurrent updates occur

---

## Edge Cases & Considerations

### 1. Concurrent Updates

**Problem:** User A and User B both edit the same card simultaneously.

**Solution (Not Implemented):**
- Use optimistic locking (version numbers)
- Last-write-wins (current behavior)
- Conflict resolution UI

---

### 2. Failed Server Updates

**Problem:** Optimistic update succeeds, but server fails (network error, validation error, etc.)

**Current Behavior:**
- Console error logged
- UI reverts to server state
- User sees change disappear

**Improvement:**
- Show error toast notification
- Allow user to retry
- Queue failed updates for retry when online

---

### 3. Offline Mode

**Current Support:** Partial
- Optimistic updates work offline
- Rollback requires network (revalidation)
- Server mutations fail silently

**Future Enhancement:**
- Detect offline state
- Queue mutations for later
- Sync when reconnected

---

## Testing Optimistic Updates

### Manual Testing

1. **Slow Network Simulation:**
   - Open DevTools → Network → Throttling → Slow 3G
   - Perform actions and verify instant UI updates
   - Verify eventual server confirmation

2. **Offline Testing:**
   - Open DevTools → Network → Offline
   - Perform actions and verify optimistic updates work
   - Reconnect and verify sync (or graceful error handling)

3. **Server Error Testing:**
   - Modify server action to `throw new Error("Test")`
   - Perform action and verify UI reverts

---

### Automated Testing

**Not Currently Implemented**

**Recommended Approach:**
```tsx
test("optimistic card creation", async () => {
  // Mock server delay
  mockServerDelay(1000);

  // Trigger card creation
  await addCard({ title: "Test Card" });

  // Assert: Card appears immediately (before server responds)
  expect(screen.getByText("Test Card")).toBeInTheDocument();

  // Wait for server response
  await waitFor(() => {
    // Assert: Card still visible after server confirms
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Always Provide Rollback

```tsx
// ❌ Bad: No error handling
setBoard(optimisticUpdate);
await serverMutation();

// ✅ Good: Rollback on error
setBoard(optimisticUpdate);
try {
  await serverMutation();
} catch (error) {
  setBoard(originalState);
}
```

---

### 2. Use Immutable Updates

```tsx
// ❌ Bad: Mutates state directly
board().lists[0].cards.push(newCard);

// ✅ Good: Creates new object
setBoard({
  ...board(),
  lists: board().lists.map(list =>
    list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
  ),
});
```

---

### 3. Show Loading States for Critical Actions

```tsx
// For non-critical updates: Optimistic only
handleCardUpdate(cardId, updates);

// For critical updates: Show loading spinner
const [isDeleting, setIsDeleting] = createSignal(false);

const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteCard(cardId);
  } finally {
    setIsDeleting(false);
  }
};
```

---

### 4. Generate Stable Temporary IDs

```tsx
// ✅ Good: Stable UUID
const tempId = crypto.randomUUID();

// ❌ Bad: Random number (risk of collision)
const tempId = `temp-${Math.random()}`;
```

---

## Summary

Optimistic updates make the app feel instant, but require:
1. Client-side ID generation (UUIDs)
2. Immutable state updates
3. Error handling with rollback
4. Cache revalidation after server confirms

The pattern is consistently applied across all mutations in this app (card creation, updates, drag-drop, comments, etc.).

# Drag & Drop System

This document explains how drag-and-drop functionality is implemented using `@thisbeyond/solid-dnd`.

## Library Choice

**@thisbeyond/solid-dnd** is a SolidJS-native drag-and-drop library that provides:
- Fine-grained reactivity (leverages SolidJS signals)
- Collision detection algorithms
- Drag overlays for visual feedback
- Sortable lists
- Full TypeScript support

Alternative considered: Native HTML5 Drag & Drop API (rejected due to complexity and browser inconsistencies)

## Architecture

### Component Hierarchy

```
DragDropBoard (provider)
├── DragDropSensors (mouse/touch detection)
│   └── DragOverlay (preview during drag)
├── CardList (droppable zone)
│   └── DroppableList (wrapper)
│       └── SortableProvider (manages card order)
│           └── DraggableCard (sortable item)
```

## Key Components

### 1. DragDropBoard

Provider component that wraps the entire board and manages drag state.

```tsx
<DragDropProvider
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  collisionDetector={closestCenter}
>
  <DragDropSensors>
    {children}
    <DragOverlay>{/* Active card preview */}</DragOverlay>
  </DragDropSensors>
</DragDropProvider>
```

**Features:**
- **Collision Detection**: `closestCenter` algorithm determines drop target
- **Drag Overlay**: Shows a preview of the dragged card
- **Event Handlers**: `onDragStart` captures card, `onDragEnd` processes the drop
- **Client-Only Rendering**: Uses `onMount` to prevent SSR hydration mismatches

**Location:** `src/components/DragDropBoard.tsx`

---

### 2. DroppableList

Defines a droppable zone (list column) that accepts cards.

```tsx
<Droppable id={listId}>
  <SortableProvider ids={cardIds}>{children}</SortableProvider>
</Droppable>
```

**Features:**
- **Unique ID**: Each list has an ID like `list-123`
- **Sortable Cards**: Inner `SortableProvider` manages card ordering
- **Visual Feedback**: Highlights when a draggable hovers over

**Location:** `src/components/DroppableList.tsx`

---

### 3. DraggableCard

Individual card that can be dragged and reordered.

```tsx
const sortable = createSortable(cardId);

<div ref={(el) => sortable(el)}>
  {/* Card content */}
</div>
```

**Features:**
- **Sortable Directive**: `sortable(el)` registers the element as draggable
- **Transform Styles**: `transformStyle()` applies smooth position changes
- **Active State**: `sortable.isActiveDraggable` dims the original while dragging
- **View Transitions**: Assigns `view-transition-name` for smooth animations

**Location:** `src/components/DraggableCard.tsx`

---

## Drag Event Flow

### 1. Drag Start

```tsx
const handleDragStart: DragEventHandler = ({ draggable }) => {
  const cardId = draggable.id as string;
  // Find and store the active card for the overlay
  setActiveCard(currentBoard.lists.flatMap(l => l.cards).find(c => c.id === cardId));
};
```

**Purpose:** Capture the dragged card to show in the drag overlay.

---

### 2. Drag Over (Implicit)

The library automatically handles:
- Collision detection with droppable zones
- Visual feedback (hover states)
- Sortable reordering preview

---

### 3. Drag End

```tsx
const handleDragEnd: DragEventHandler = async (event) => {
  const { draggable, droppable } = event;

  // Parse event to determine source/target
  const result = parseDragEvent(draggable.id, droppable.id, currentBoard);

  if (result.isSameList) {
    // Reorder within same list
    const reorderedCards = calculateReorder(list.cards, result.cardId, result.droppableId);
    setBoard(optimisticUpdate);
    await updateCardPositions(reorderedCards);
  } else {
    // Move to different list
    setBoard(optimisticCrossListUpdate);
    await updateCardList(result.cardId, result.targetListId);
  }
};
```

**Two Scenarios:**

#### A. Same-List Reorder

1. **Parse**: Determine card position relative to drop target
2. **Calculate**: Compute new card order (splice and reinsert)
3. **Optimistic Update**: Instantly reorder UI
4. **Persist**: Update position fields in database
5. **Revalidate**: Refresh from server on error

#### B. Cross-List Move

1. **Parse**: Identify source and target lists
2. **Optimistic Update**: Remove from source, append to target
3. **Persist**: Update card's `listId` in database
4. **Revalidate**: Refresh from server on error

---

## Logic Functions

### parseDragEvent

**Purpose:** Extract source/target information from drag event.

```tsx
export function parseDragEvent(
  cardId: string,
  droppableId: string,
  board: BoardDetails
): DragDropResult | null;
```

**Returns:**
```tsx
{
  cardId: string;              // ID of dragged card
  sourceListId: string;        // Original list
  targetListId: string;        // Destination list
  droppableId: string;         // Drop zone ID (list or card)
  isSameList: boolean;         // Whether it's a reorder or move
  card: BoardCard;             // Full card object
}
```

**Location:** `src/lib/drag-drop/logic.ts:55`

---

### calculateReorder

**Purpose:** Compute new card order within a list.

```tsx
export function calculateReorder(
  cards: BoardCard[],
  draggedCardId: string,
  droppedOnCardId: string
): ReorderResult | null;
```

**Algorithm:**
1. Find index of dragged card
2. Find index of drop target card
3. Remove dragged card from array
4. Insert at target index

**Returns:**
```tsx
{
  reorderedIds: string[];      // New order of card IDs
  reorderedCards: BoardCard[]; // New order of full card objects
}
```

**Location:** `src/lib/drag-drop/logic.ts:97`

---

### createReorderUpdate / createCrossListUpdate

**Purpose:** Generate optimistic UI state.

```tsx
export function createReorderUpdate(
  board: BoardDetails,
  result: DragDropResult,
  reorderedCards: BoardCard[]
): BoardDetails;

export function createCrossListUpdate(
  board: BoardDetails,
  result: DragDropResult
): BoardDetails;
```

**Immutability:** Both functions return a new `BoardDetails` object, never mutating the original.

**Location:** `src/lib/drag-drop/logic.ts:133`, `src/lib/drag-drop/logic.ts:162`

---

## Server Actions

### updateCardPositions

**Triggered By:** Same-list reorder

```tsx
export async function updateCardPositions(cardIds: string[]);
```

**Database Update:**
```sql
UPDATE cards SET position = ? WHERE id = ?;
-- Repeated for each card in the new order
```

**Location:** `src/api/drag-drop-actions.ts:23`

---

### updateCardList

**Triggered By:** Cross-list move

```tsx
export async function updateCardList(cardId: string, newListId: string);
```

**Database Update:**
```sql
UPDATE cards SET list_id = ? WHERE id = ?;
```

**Location:** `src/api/drag-drop-actions.ts:8`

---

## Hydration Handling

### Problem

Server renders static HTML without drag-drop handlers. Client hydration must attach handlers without causing mismatches.

### Solution

```tsx
const [mounted, setMounted] = createSignal(false);

onMount(() => {
  setMounted(true);
});

<Show when={mounted()} fallback={<StaticCard />}>
  <DraggableCard />
</Show>
```

**Effect:** SSR renders fallback (static card). After hydration, client replaces with draggable version.

---

## Visual Feedback

### 1. Drag Overlay

```tsx
<DragOverlay>
  <div class="rotate-3 scale-105 shadow-2xl">
    {/* Active card preview */}
  </div>
</DragOverlay>
```

**Styling:** Slightly rotated and scaled for a "lifted" effect.

---

### 2. Active Draggable Opacity

```tsx
<div classList={{ "opacity-25": sortable.isActiveDraggable }}>
  {/* Original card */}
</div>
```

**Effect:** Original card fades while dragging to indicate it's being moved.

---

### 3. View Transitions

```tsx
style={`view-transition-name: card-${cardId};`}
```

Combined with `withViewTransition()` wrapper for smooth position changes.

---

## Performance Considerations

### 1. Collision Detection

**Algorithm:** `closestCenter` (computes distance to center of each droppable)

**Alternatives:**
- `closestCorners` - Faster for many droppables
- `pointerWithin` - Only considers overlapping zones

**Current Choice:** `closestCenter` balances accuracy and performance for our use case.

---

### 2. Optimistic Updates

**Benefit:** UI responds instantly (no waiting for server round-trip)

**Trade-off:** Must handle rollback on server errors

---

### 3. Debouncing Position Updates

**Not Implemented (Yet):** Rapid drag-and-drop could trigger many database writes.

**Future Optimization:** Debounce position updates or batch them into a single transaction.

---

## Error Handling

### Revert on Failure

```tsx
try {
  await updateCardList(cardId, targetListId);
} catch (error) {
  console.error("Failed to persist card move:", error);
  setBoard(originalBoardData()); // Revert to server state
}
```

**User Experience:** Card "snaps back" to original position if server update fails.

---

## Testing Checklist

- [ ] Drag card within same list (reorder)
- [ ] Drag card to different list (move)
- [ ] Drag card to empty list
- [ ] Rapid consecutive drags
- [ ] Drag while offline (should see error and revert)
- [ ] SSR hydration (no console errors)
- [ ] Mobile touch gestures
- [ ] Keyboard navigation (not currently supported)

---

## Future Enhancements

1. **Keyboard Accessibility**: Add keyboard shortcuts for drag-drop
2. **Undo/Redo**: Store drag history for quick rollback
3. **Batch Updates**: Debounce rapid drags into single transaction
4. **Animation Customization**: Allow users to disable view transitions
5. **Multi-Select Drag**: Drag multiple cards simultaneously

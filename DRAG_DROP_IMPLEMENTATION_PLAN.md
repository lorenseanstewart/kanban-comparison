# Drag and Drop Implementation Plan

## Overview
Add drag and drop functionality to the Trello board using `@thisbeyond/solid-dnd` library, allowing cards to be:
1. Dragged within the same column to reorder
2. Dragged between different columns
3. Visual feedback during dragging

## Implementation Steps

### Step 1: Install solid-dnd Library
```bash
npm install @thisbeyond/solid-dnd
```

### Step 2: Create New Components

#### DraggableCard.tsx
Wrapper component for individual cards that can be dragged
- Location: `src/components/DraggableCard.tsx`
- Wraps existing card content with draggable functionality
- Uses `createDraggable` from solid-dnd
- Maintains all existing card styling and content

#### DroppableList.tsx
Wrapper component for card lists that can receive dropped cards
- Location: `src/components/DroppableList.tsx`
- Wraps card list containers with droppable functionality
- Uses `createDroppable` from solid-dnd
- Handles visual feedback for valid drop zones

#### DragDropBoard.tsx
Board-level component managing drag and drop state
- Location: `src/components/DragDropBoard.tsx`
- Manages overall drag and drop context
- Handles drag end events and state updates
- Coordinates between draggable cards and droppable lists

### Step 3: Update Data Layer

#### API Functions
Create new server actions for updating card positions:
- `updateCardPosition(cardId, newListId, newPosition)` - Move card between/within lists
- `reorderCardsInList(listId, cardIds)` - Bulk reorder within same list
- Add to existing API files in `src/api/`

#### State Management
- Modify board state to handle optimistic updates
- Add local signals for drag state management
- Implement rollback mechanism for failed updates

### Step 4: Integrate Drag and Drop Provider

#### Board Page Updates
Modify `src/routes/board/[id].tsx`:
```jsx
import {
  DragDropProvider,
  DragDropSensors,
  useDragDropContext
} from "@thisbeyond/solid-dnd";

export default function BoardPage() {
  const [board, setBoard] = createSignal();
  const [, { onDragEnd }] = useDragDropContext();

  onDragEnd(({ draggable, droppable }) => {
    // Handle card repositioning logic
  });

  return (
    <DragDropProvider>
      <DragDropSensors>
        <main className="...">
          {/* existing board content */}
        </main>
      </DragDropSensors>
    </DragDropProvider>
  );
}
```

### Step 5: Update Board Components

#### Modify CardList Component
Update existing `CardList` component to use `DroppableList`:
```jsx
import { DroppableList } from "./DroppableList";

export function CardList({ list, users }) {
  return (
    <DroppableList listId={list.id}>
      <article className="card bg-base-200...">
        {/* existing list header */}
        <For each={list.cards}>
          {card => (
            <DraggableCard card={card} users={users} />
          )}
        </For>
      </article>
    </DroppableList>
  );
}
```

#### Update Card Rendering
Wrap individual cards with `DraggableCard` component while maintaining existing styling.

### Step 6: Handle State Updates

#### Same-Column Reordering
```jsx
const handleSameListDrop = (cardId, newPosition, listId) => {
  // Update local state optimistically
  updateCardPosition(cardId, listId, newPosition);

  // Persist to database
  try {
    await updateCardPositionAPI(cardId, listId, newPosition);
  } catch (error) {
    // Rollback on failure
    revertCardPosition(cardId);
  }
};
```

#### Cross-Column Moves
```jsx
const handleCrossListDrop = (cardId, newListId, newPosition) => {
  // Update local state optimistically
  moveCardToList(cardId, newListId, newPosition);

  // Persist to database
  try {
    await updateCardListAPI(cardId, newListId, newPosition);
  } catch (error) {
    // Rollback on failure
    revertCardMove(cardId);
  }
};
```

### Step 7: Visual Enhancements

#### Drag Handles
Add subtle drag handles to cards:
```jsx
<div className="drag-handle cursor-grab active:cursor-grabbing">
  <svg><!-- drag icon --></svg>
</div>
```

#### Drag Overlay
Implement ghost element during drag:
- Semi-transparent version of dragged card
- Follows cursor during drag operation
- Maintains card dimensions and styling

#### Drop Zone Indicators
- Highlight valid drop zones when dragging
- Show insertion point indicators within lists
- Visual feedback for invalid drop zones

#### Animations
- Smooth transitions when cards are repositioned
- CSS transforms for drag operations
- Transition animations for non-dragged cards moving to make space

## Technical Implementation Details

### Core Drag/Drop Structure
```jsx
<DragDropProvider>
  <DragDropSensors>
    <BoardOverview data={data} />
    <section className="flex gap-7 overflow-x-auto pb-8">
      <For each={data.lists}>
        {list => (
          <DroppableList listId={list.id}>
            <article className="card bg-base-200 min-w-[20rem] shadow-xl">
              <div className="card-body gap-4">
                <header><!-- list header --></header>
                <For each={list.cards}>
                  {card => (
                    <DraggableCard
                      cardId={card.id}
                      card={card}
                      users={users()}
                    />
                  )}
                </For>
              </div>
            </article>
          </DroppableList>
        )}
      </For>
    </section>
  </DragDropSensors>
</DragDropProvider>
```

### Database Schema Considerations
Current schema already supports:
- `cards.listId` - for moving between lists
- `cards.position` - for ordering within lists

No schema changes needed.

### Error Handling
- Optimistic updates with rollback on API failure
- Visual feedback for failed operations
- Graceful degradation if drag/drop fails

### Performance Considerations
- Use solid-dnd's performance optimizations
- Minimize re-renders during drag operations
- Efficient position calculations for large lists

## Testing Strategy
1. Unit tests for drag/drop logic
2. Integration tests for API updates
3. E2E tests for drag/drop user interactions
4. Test edge cases (empty lists, single cards, etc.)

## Accessibility
- Keyboard navigation support for drag/drop
- Screen reader announcements for card moves
- Focus management during drag operations
- ARIA labels for drag handles and drop zones

## Browser Support
- Modern browsers supporting CSS transforms
- Touch device support for mobile drag/drop
- Fallback for browsers without drag/drop API

This plan maintains the existing component structure while adding comprehensive drag and drop functionality that feels native to a Trello-style board interface.
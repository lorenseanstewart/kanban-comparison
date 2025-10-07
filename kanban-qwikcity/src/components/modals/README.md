# Modal Components Usage Guide

This directory contains four modal components for the Qwik City Kanban application.

## Components

### 1. AddBoardModal

Used to create a new board.

```tsx
import { useSignal } from "@builder.io/qwik";
import { AddBoardModal } from "~/components/modals";

// In your component:
const isAddBoardModalOpen = useSignal(false);

<AddBoardModal
  isOpen={isAddBoardModalOpen}
  onBoardAdd={(board) => {
    // Handle optimistic UI update
    console.log("Board added:", board);
  }}
/>

// To open the modal:
<button onClick$={() => { isAddBoardModalOpen.value = true; }}>
  Add Board
</button>
```

### 2. AddCardModal

Used to create a new card on a board.

```tsx
import { useSignal } from "@builder.io/qwik";
import { AddCardModal } from "~/components/modals";

// In your component:
const isAddCardModalOpen = useSignal(false);

<AddCardModal
  boardId={board.id}
  users={users}
  tags={tags}
  isOpen={isAddCardModalOpen}
  onCardAdd={(card) => {
    // Handle optimistic UI update
    console.log("Card added:", card);
  }}
/>
```

### 3. CardEditModal

Used to edit an existing card.

```tsx
import { useSignal } from "@builder.io/qwik";
import { CardEditModal } from "~/components/modals";

// In your component:
const isEditModalOpen = useSignal(false);
const selectedCard = useSignal<BoardCard | null>(null);

<CardEditModal
  card={selectedCard.value!}
  users={users}
  tags={tags}
  isOpen={isEditModalOpen}
  onUpdate={(updatedCard) => {
    // Handle optimistic UI update
    console.log("Card updated:", updatedCard);
  }}
/>
```

### 4. CommentModal

Used to view and add comments to a card.

```tsx
import { useSignal } from "@builder.io/qwik";
import { CommentModal } from "~/components/modals";

// In your component:
const isCommentModalOpen = useSignal(false);
const selectedCard = useSignal<BoardCard | null>(null);

<CommentModal
  card={selectedCard.value!}
  users={users}
  isOpen={isCommentModalOpen}
  onCommentAdd={(comment) => {
    // Handle optimistic UI update
    console.log("Comment added:", comment);
  }}
/>
```

## Key Qwik Patterns Used

1. **component$()** - All components use the `component$()` wrapper for optimization
2. **useSignal()** - For reactive state management (isOpen, selectedTagIds, etc.)
3. **useVisibleTask$()** - For side effects that need to run in the browser (opening/closing dialogs)
4. **$()** - For event handlers that need to be serialized (onClick$, onSubmit$)
5. **Signal<T>** - Type for signal props that need to be reactive across components

## Features

- DaisyUI modal styling with backdrop
- Form validation
- Tag multi-select with color display
- Optimistic UI updates via callbacks
- Close on backdrop click
- Close button and cancel button
- Server actions to be integrated later

## Notes

- All modals use the HTML `<dialog>` element
- Modal open/close state is managed via Signal props
- Forms use `preventdefault:submit` to handle submission in Qwik
- Server actions (TODO comments) will be added in a future step

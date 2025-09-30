# View Transitions

This document explains how the View Transitions API is used for smooth animations.

## What Are View Transitions?

The View Transitions API enables smooth, animated transitions between DOM states without JavaScript animation libraries.

**Browser Support:**
- Chrome 111+
- Edge 111+
- Safari Technology Preview
- Firefox: In development

## Implementation

### Utility Function

```tsx
// src/lib/utils/view-transitions.ts
export function withViewTransition(updateFn: () => void): void {
  if (document.startViewTransition) {
    document.startViewTransition(updateFn);
  } else {
    updateFn(); // Fallback for unsupported browsers
  }
}
```

**Progressive Enhancement:** Works in all browsers, enhances in supported ones.

### Usage in Drag-Drop

```tsx
import { withViewTransition } from "~/lib/utils/view-transitions";

const handleDragEnd: DragEventHandler = async (event) => {
  // Wrap state update in view transition
  withViewTransition(() => {
    setBoard(createCrossListUpdate(board(), dragResult));
  });

  await updateCardList(cardId, targetListId);
};
```

**Effect:** Card smoothly animates from source to target list.

## View Transition Names

Assign unique names to elements for targeted transitions:

```tsx
<div
  style={`view-transition-name: card-${card.id};`}
  class="card"
>
  {/* Card content */}
</div>
```

**Benefit:** Browser tracks this specific element across state changes and animates its position.

## How It Works

1. **Capture "before" snapshot** - Browser takes screenshot of current state
2. **Execute state update** - React/Solid updates DOM
3. **Capture "after" snapshot** - Browser takes screenshot of new state
4. **Animate transition** - Browser morphs between snapshots

**All handled by browser** - No JavaScript animation code needed.

## CSS Customization

Customize transition behavior with CSS:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

::view-transition-old(card-123) {
  animation: slide-out 0.2s ease-in;
}

::view-transition-new(card-123) {
  animation: slide-in 0.2s ease-out;
}
```

**Not implemented in this app** - Uses browser defaults.

## Use Cases

### 1. Drag-and-Drop

**Location:** `src/lib/drag-drop/hooks.ts:59`

```tsx
withViewTransition(() => {
  setBoard((prev) =>
    prev ? createReorderUpdate(prev, result, reorderedCards) : prev
  );
});
```

**Effect:** Cards smoothly animate to new positions.

---

### 2. Route Navigation (Potential)

```tsx
// Not currently implemented
import { useNavigate } from "@solidjs/router";

const navigate = useNavigate();

const goToBoard = (boardId: string) => {
  withViewTransition(() => {
    navigate(`/board/${boardId}`);
  });
};
```

**Effect:** Smooth fade/slide between pages.

---

### 3. Modal Open/Close (Potential)

```tsx
// Not currently implemented
const openModal = () => {
  withViewTransition(() => {
    setIsModalOpen(true);
  });
};
```

**Effect:** Modal grows from trigger button.

## Performance

View Transitions are hardware-accelerated by the browser:

**Pros:**
- Smooth 60fps animations
- No JavaScript overhead
- Automatically optimized by browser

**Cons:**
- Limited browser support (needs fallback)
- Less control than JS animations
- Can't interrupt mid-transition

## Fallback Strategy

The `withViewTransition` helper gracefully degrades:

```tsx
if (document.startViewTransition) {
  // Use native API
  document.startViewTransition(updateFn);
} else {
  // Instant update (no animation)
  updateFn();
}
```

**User Experience:**
- Supported browsers: Smooth animations
- Unsupported browsers: Instant updates (no animation, but still functional)

## Future Enhancements

1. **Named Transitions** - Different animations for different elements
2. **Gesture Cancellation** - Cancel animation on rapid drags
3. **Route Transitions** - Animate page navigation
4. **Custom CSS** - Fine-tune transition timing and easing
5. **Reduced Motion** - Respect `prefers-reduced-motion` setting

## Resources

- [MDN: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome Developers Guide](https://developer.chrome.com/docs/web-platform/view-transitions/)

# SolidStart Review Follow-Ups

## Critical
- Stop seeding optimistic boards/cards with throwaway UUIDs. Reconcile with the server-generated IDs returned by `createBoard`/`createCard`, or block navigation until the action resolves, otherwise routes and downstream mutations break.
- Action error handling: Server actions don't return typed error responses; wrap in try/catch and return `{ success: boolean; data?: T; error?: string }` for UI consumption.

## Major
- Capture and display errors from the server actions during modal submissions (currently users get silent failures). Provide rollback logic so the local signals stay in sync if the mutation throws.
- Hoist the optimistic board/card arrays into store-like structures or use `produce` so updates don't close over stale values; `setBoards([...boards(), newBoard])` can drop concurrent updates.
- Improve drag-drop persistence: after cross-list moves, also update ordering positions in the target list, and guard against rapid successive drops racing the optimistic state.
- Ensure `useBoardDragDrop` always normalizes droppable IDs—when dragging to empty lists, `result.droppableId` already equals `list-${id}` so persist the clean ID instead of the prefixed value.
- Add Suspense fallbacks (or guard clauses) around `allUsers()`/`allTags()` usages so modals don't render with `undefined` arrays during initial load.
- Action submission state: Add `submission.pending` checks to disable form buttons during server actions—users can double-submit currently.
- Revalidation strategy: After mutations, use `revalidate()` or `refetch()` on relevant resources to ensure fresh data loads.

## Minor
- Replace ad-hoc `crypto.randomUUID()` imports in components with IDs supplied from server actions to keep the view-transition naming stable across revalidations.
- Share reusable Valibot schema validation between client optimistic paths and server actions to avoid divergence.
- Remove development-only console warnings from the drag/drop hook (or gate them behind dev checks).
- Type safety: Server action responses are untyped; add explicit return type annotations for type-safe destructuring.
- Resource cleanup: Verify createEffect/createMemo don't leak subscriptions when components unmount during pending actions.
- Form reset timing: Modal forms don't clear after successful submission—add explicit form.reset() calls in the success path.


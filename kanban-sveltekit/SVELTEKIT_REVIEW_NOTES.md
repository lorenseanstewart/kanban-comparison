# SvelteKit Review Follow-Ups

## Critical
- Replace optimistic board IDs with the actual server-generated ID (or reconcile after the action resolves). Right now the UI links to a UUID that the database never knows about, so opening the board fails until a hard refresh.
- Do the same reconciliation for optimistic cards. Modals and drag/drop submit the optimistic UUID and the server rejects the request because that card never existed.
- Form actions should return typed responses (`{ success: boolean; data?: T; error?: string }`) instead of throwing errors, so client code can differentiate between validation failures and system errors.

## Major
- Track loader data with an effect that only runs when `data.boards` truly changes; the unconditional reassign wipes optimistic inserts and can fight user edits.
- Rework drag-and-drop persistence so card moves rely on the live board state, not the initial `data.board`. Newly added cards never appear in that snapshot, so cross-list moves skip the `updateCardList` action.
- Add error handling/rollback for the `fetch` calls that persist list changes; failures currently leave the UI in a bad state with no user feedback.
- Modal error display: Extract error messages from form action results and show them in the modal UI (currently errors disappear silently).
- Loading states: Add disabled states to form inputs and buttons during submission to prevent double-submits and provide visual feedback.
- Use `$state.raw()` or `$derived` for arrays/objects that change frequently to avoid unnecessary reactivity overhead and keep updates predictable.

## Minor
- Tighten invalidation scope after board creation (`invalidate('/board')` instead of `invalidateAll`) to avoid extra network work.
- Audit the modal `enhance` handlers so they don't append duplicate `tagIds` entries between submissions; clear the `FormData` or rebuild it when needed.
- Standardize on Valibot validators for both optimistic checks and server actions to keep enforcement in sync.
- Add form reset after successful modal submissions (`form.reset()`) to clear input state.
- Type safety: Add explicit return type annotations to form actions for better IDE support and type inference.
- Consider using `enhance` return callback pattern to handle navigation and state updates in a centralized way rather than scattered across modal components.


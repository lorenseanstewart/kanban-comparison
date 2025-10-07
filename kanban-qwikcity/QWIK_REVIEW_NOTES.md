# Qwik Code Review Follow-Ups

## Critical
- Align optimistic board creation with server IDs. The UI stores a locally generated UUID and never reconciles it with the server action's UUID, so newly created boards point to nonexistent routes until a reload.
- Fix optimistic card creation so client state adopts the server-generated card ID. Actions currently receive the optimistic UUID and fail to find the record.
- Action error handling: Route actions don't return typed error responses; failures are silent or throw unhandled exceptions—wrap in try/catch and return `{ success: false, error: string }` for UI consumption.
- Signal mutation timing: Optimistic signal updates fire before action completion; if the action fails, there's no rollback mechanism—store previous state for recovery.

## Major
- Re-sync the board list signal whenever loader data changes. Guarding only on length leaves edits and validation corrections stale.
- Refactor route actions to consume their provided form data instead of re-reading `requestEvent.request.formData()`. This also enables object submissions.
- Resource revalidation: After mutations, loaders don't automatically refetch—add explicit `invalidate()` calls or rely on navigation to trigger fresh data.
- Form submission race conditions: Multiple rapid submissions can fire concurrent actions; the last write wins but earlier optimistic updates stay in the signal—add submission guards or request deduplication.
- Type safety for actions: `routeAction$` responses are untyped; destructuring `{ value }` loses compile-time safety—define explicit return types like `ActionReturn<{ id: string }>`.

## Minor
- Remove lingering `console.log` debugging output in drag-and-drop components (`CardList`, `Card`).
- Drop unused imports such as `sync$` to keep generated chunks minimal.
- Introduce shared Valibot schemas for form validation so client-side guards stay aligned with route actions.
- Signal effect cleanup: Effects that subscribe to signals may not clean up properly on component unmount—verify `useVisibleTask$` cleanup functions prevent memory leaks.
- Form reset timing: After successful submission, form fields don't clear until manual reset—call `(event.target as HTMLFormElement).reset()` in the action handler.
- Loading states: No visual feedback during action execution; users can double-submit—add `action.isRunning` checks to disable buttons.


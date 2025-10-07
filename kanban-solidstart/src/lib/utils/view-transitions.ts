/**
 * Executes a state update with the View Transitions API if available
 * Falls back to immediate execution if not supported
 */
export function withViewTransition(updateFn: () => void): void {
  if (typeof document === "undefined") {
    updateFn();
    return;
  }

  if (document.startViewTransition) {
    document.startViewTransition(updateFn);
  } else {
    updateFn();
  }
}
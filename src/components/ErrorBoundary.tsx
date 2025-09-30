import { ErrorBoundary as SolidErrorBoundary } from "solid-js";
import type { JSX } from "solid-js";

export function ErrorBoundary(props: {
  children: JSX.Element;
  fallback?: (error: Error, reset: () => void) => JSX.Element;
}) {
  const defaultFallback = (error: Error, reset: () => void) => (
    <div class="alert alert-error shadow-lg">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">Error!</h3>
          <div class="text-xs">{error.message}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" onClick={reset}>
        Retry
      </button>
    </div>
  );

  return (
    <SolidErrorBoundary fallback={props.fallback || defaultFallback}>
      {props.children}
    </SolidErrorBoundary>
  );
}

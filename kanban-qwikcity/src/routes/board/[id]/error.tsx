import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <main class="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div class="card bg-error/10">
        <div class="card-body items-center text-center">
          <h1 class="card-title text-2xl text-error">Board Error</h1>
          <p class="text-base-content/70">
            Failed to load this board. It may not exist or there was an error.
          </p>
          <div class="card-actions justify-center gap-4 mt-4">
            <button
              onClick$={() => window.location.reload()}
              class="btn btn-primary"
            >
              Try Again
            </button>
            <Link href="/" class="btn btn-ghost">
              Back to Boards
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
});

import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div data-theme="pastel" class="min-h-screen bg-base-300 text-base-content">
      <nav class="navbar bg-base-100 shadow-lg mb-8">
        <div class="flex-1">
          <Link href="/" class="btn btn-ghost text-xl">
            Kanban Boards
          </Link>
        </div>
      </nav>

      <div class="container mx-auto px-4">
        <Slot />
      </div>
    </div>
  );
});

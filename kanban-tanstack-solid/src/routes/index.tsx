import { createFileRoute } from "@tanstack/solid-router";
import { fetchBoards } from "~/utils/api";
import { HomePageClient } from "~/components/HomePageClient";
import { createEffect } from "solid-js";

function LoadingFallback() {
  return (
    <main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header class="text-center space-y-3">
        <p class="text-sm uppercase tracking-wide text-secondary">
          Your workspace
        </p>
        <h1 class="text-4xl font-black text-primary">Boards</h1>
        <p class="text-base text-base-content/60">Loading your boards...</p>
      </header>
      <div class="flex justify-center py-16">
        <span
          class="loading loading-spinner loading-lg text-primary"
          aria-label="Loading boards"
        />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const boards = await fetchBoards();
    return { boards };
  },
  component: Home,
  pendingComponent: LoadingFallback,
});

function Home() {
  const loaderData = Route.useLoaderData();

  return <HomePageClient initialBoards={loaderData().boards} />;
}

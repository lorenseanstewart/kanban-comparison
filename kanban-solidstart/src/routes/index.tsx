import { createAsync, A, type RouteDefinition } from "@solidjs/router";
import { For, Show, createMemo, createSignal } from "solid-js";
import { listBoards } from "~/api";
import type { BoardSummary } from "~/api/boards";
import { AddBoardModal } from "~/components/modals/AddBoardModal";
import { ErrorBoundary } from "~/components/ErrorBoundary";

export const route = {
  preload() {
    listBoards();
  },
} satisfies RouteDefinition;

export default function Home() {
  const boardsData = createAsync(() => listBoards());
  const [localBoards, setLocalBoards] = createSignal<BoardSummary[]>([]);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = createSignal(false);

  const boards = createMemo(() => {
    const data = boardsData();
    const additions = localBoards();
    if (!data) {
      return null;
    }
    if (additions.length === 0) {
      return data;
    }
    return [...data, ...additions];
  });

  const handleBoardAdd = (boardData: {
    id: string;
    title: string;
    description: string | null;
  }) => {
    setLocalBoards((prev) => [...prev, boardData]);
  };

  return (
    <main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header class="text-center space-y-3">
        <p class="text-sm uppercase tracking-wide text-secondary">
          Your workspace
        </p>
        <h1 class="text-4xl font-black text-primary">Boards</h1>
        <p class="text-base text-base-content/60">
          Choose a board to jump into your Kanban flow.
        </p>
      </header>

      <div class="flex justify-end">
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => setIsAddBoardModalOpen(true)}
        >
          Add Board
        </button>
      </div>

      <ErrorBoundary>
        <Show
          when={boards()}
          fallback={
            <div class="flex justify-center py-16">
              <span class="loading loading-spinner loading-lg text-primary" aria-label="Loading boards" />
            </div>
          }
        >
          {(items) => (
            <Show
              when={items().length > 0}
              fallback={
                <div class="card bg-base-200 dark:bg-base-300 shadow-xl">
                  <div class="card-body items-center text-center">
                    <h2 class="card-title text-secondary">No boards yet</h2>
                    <p class="text-base-content/60">
                      Create your first board to get started.
                    </p>
                  </div>
                </div>
              }
            >
              <section class="grid gap-8 md:grid-cols-2">
                <For each={items()}>
                  {(board) => (
                    <A
                      href={`/board/${board.id}`}
                      class="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                    >
                      <div class="card-body">
                        <h2 class="card-title text-primary">{board.title}</h2>
                        {board.description ? (
                          <p class="text-sm text-base-content/60">
                            {board.description}
                          </p>
                        ) : (
                          <p class="badge badge-secondary badge-outline w-fit shadow">
                            No description
                          </p>
                        )}
                        <div class="card-actions justify-end">
                          <span class="btn btn-secondary btn-sm shadow-lg">
                            Open board
                          </span>
                        </div>
                      </div>
                    </A>
                  )}
                </For>
              </section>
            </Show>
          )}
        </Show>
      </ErrorBoundary>

      <ErrorBoundary>
        <AddBoardModal
          isOpen={isAddBoardModalOpen()}
          onClose={() => setIsAddBoardModalOpen(false)}
          onBoardAdd={handleBoardAdd}
        />
      </ErrorBoundary>
    </main>
  );
}

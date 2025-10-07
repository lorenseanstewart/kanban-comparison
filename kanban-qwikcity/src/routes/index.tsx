import { component$, useSignal, $, useTask$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Link, valibot$ } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getBoards } from "~/db/queries";
import type { BoardSummary } from "~/db/queries";
import { db } from "~/db/index";
import { boards, lists } from "~/lib/db/schema";
import { AddBoardModal } from "~/components/modals/AddBoardModal";
import { BoardSchema } from "~/lib/validation";

export const useBoards = routeLoader$(async () => {
  return await getBoards();
});

type CreateBoardActionReturn =
  | { success: true; boardId: string }
  | { success: false; error: string };

export const useCreateBoardAction = routeAction$<CreateBoardActionReturn>(
  async (data) => {
    try {
      const boardId = crypto.randomUUID();

      await db.insert(boards).values({
        id: boardId,
        title: data.title,
        description: data.description ?? null,
      });

      // Create 4 default lists
      const listTitles = ["Todo", "In-Progress", "QA", "Done"];
      await db.insert(lists).values(
        listTitles.map((listTitle, index) => ({
          id: crypto.randomUUID(),
          boardId,
          title: listTitle,
          position: index,
        }))
      );

      return {
        success: true,
        boardId,
      };
    } catch (error) {
      console.error("Failed to create board:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create board. Please try again.",
      };
    }
  },
  valibot$(BoardSchema)
);

export default component$(() => {
  const boardsLoader = useBoards();
  const createBoardAction = useCreateBoardAction();
  const isAddBoardModalOpen = useSignal(false);
  const boardsState = useSignal<BoardSummary[]>(boardsLoader.value);

  useTask$(({ track }) => {
    const loaderValue = track(() => boardsLoader.value);
    if (loaderValue) {
      boardsState.value = loaderValue;
    }
  });

  const sortedBoards = useComputed$(() => {
    return [...boardsState.value].sort((a, b) => a.title.localeCompare(b.title));
  });

  // Handle board creation with server-generated ID
  const handleBoardAdd = $((boardData: {
    id: string;
    title: string;
    description: string | null;
  }) => {
    const newBoard: BoardSummary = {
      id: boardData.id,
      title: boardData.title,
      description: boardData.description,
    };

    boardsState.value = [...boardsState.value, newBoard];
  });

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
          onClick$={() => isAddBoardModalOpen.value = true}
        >
          Add Board
        </button>
      </div>

      <section class="grid gap-8 md:grid-cols-2">
        {sortedBoards.value.length === 0 ? (
          <div class="card bg-base-200 dark:bg-base-300 shadow-xl">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-secondary">No boards yet</h2>
              <p class="text-base-content/60">
                Create your first board to get started.
              </p>
            </div>
          </div>
        ) : (
          sortedBoards.value.map((board) => (
            <Link
              key={board.id}
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
            </Link>
          ))
        )}
      </section>

      <AddBoardModal
        isOpen={isAddBoardModalOpen}
        action={createBoardAction}
        onBoardAdd={handleBoardAdd}
      />
    </main>
  );
});

export const head: DocumentHead = {
  title: "Kanban Boards",
  meta: [
    {
      name: "description",
      content: "Manage your Kanban boards and organize your tasks",
    },
  ],
};

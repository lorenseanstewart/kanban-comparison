import { Link } from "@tanstack/solid-router";
import type { BoardSummary } from "../lib/api";
import { AddBoardModal } from "./AddBoardModal";
import { createSignal } from "solid-js";

export function HomePageClient(props: { initialBoards: BoardSummary[] }) {
  const [boards, setBoards] = createSignal<BoardSummary[]>(props.initialBoards);

  // Handle board creation with server-generated ID
  const handleBoardAdd = (boardData: {
    id: string;
    title: string;
    description: string | null;
  }) => {
    setBoards((prev) => [...prev, boardData]);
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
        <AddBoardModal onBoardAdd={handleBoardAdd} />
      </div>

      <section class="grid gap-8 md:grid-cols-2">
        {boards().length === 0 ? (
          <div class="card bg-base-200 dark:bg-base-300 shadow-xl">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-secondary">No boards yet</h2>
              <p class="text-base-content/60">
                Create your first board to get started.
              </p>
            </div>
          </div>
        ) : (
          boards().map((board) => (
            <Link
              to="/board/$id"
              params={{ id: board.id }}
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
    </main>
  );
}

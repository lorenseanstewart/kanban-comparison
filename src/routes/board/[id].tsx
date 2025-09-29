import { createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import { For, Show, createSignal, createEffect } from "solid-js";
import { fetchBoard, listUsers, listTags } from "~/api";
import type { BoardDetails, UsersList } from "~/api/boards";
import { BoardOverview } from "~/components/BoardOverview";
import { CardList } from "~/components/CardList";
import { DragDropBoard } from "~/components/DragDropBoard";
import { useBoardDragDrop } from "~/lib/drag-drop/hooks";
import type { User, Tag } from "../../../drizzle/schema";

function CardListFallback() {
  return (
    <div class="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto">
      <div class="card-body items-center text-center">
        <h2 class="card-title text-secondary">No lists yet</h2>
        <p class="text-base-content/60">
          Add a list to begin organizing work on this board.
        </p>
      </div>
    </div>
  );
}

export const route = {
  preload({ params }) {
    fetchBoard({ id: params.id });
    listUsers();
    listTags();
  },
} satisfies RouteDefinition;

export default function BoardPage() {
  const params = useParams();
  const boardData = createAsync<BoardDetails | null>(() =>
    fetchBoard({ id: params.id })
  );
  const users = createAsync<UsersList>(() => listUsers());
  const allUsers = createAsync<User[]>(() => listUsers());
  const allTags = createAsync<Tag[]>(() => listTags());

  // Local mutable copy for optimistic updates
  const [board, setBoard] = createSignal<BoardDetails | null>(null);

  // Sync local state with server data
  createEffect(() => {
    const data = boardData();
    if (data) {
      setBoard(data);
    }
  });

  // Drag-and-drop handler using composable hook
  const { handleDragEnd } = useBoardDragDrop({ board, setBoard, boardData });

  // Handle optimistic card updates
  const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
    const currentBoard = board();
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      lists: currentBoard.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      })),
    };

    setBoard(updatedBoard);
  };

  return (
    <main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <Show
        when={board()}
        keyed
        fallback={
          <div class="flex justify-center py-16">
            <span
              class="loading loading-spinner loading-lg text-primary"
              aria-label="Loading board"
            />
          </div>
        }
      >
        {(data: BoardDetails) => (
          <DragDropBoard
            onDragEnd={handleDragEnd}
            board={board}
          >
            <div class="space-y-8">
              <BoardOverview data={data} />

              <section class="flex gap-7 overflow-x-auto pb-8">
                <For
                  each={data.lists}
                  fallback={<CardListFallback />}
                >
                  {(list) => (
                    <CardList
                      list={list}
                      users={users()}
                      allUsers={allUsers() || []}
                      allTags={allTags() || []}
                      onCardUpdate={handleCardUpdate}
                    />
                  )}
                </For>
              </section>
            </div>
          </DragDropBoard>
        )}
      </Show>
    </main>
  );
}

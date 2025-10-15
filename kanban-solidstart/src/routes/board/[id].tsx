import {
  createAsync,
  useParams,
  A,
  type RouteDefinition,
} from "@solidjs/router";
import { For, Show, createMemo, createEffect, Suspense } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { fetchBoard, listUsers, listTags } from "~/api";
import type {
  BoardCard,
  BoardDetails,
  UsersList,
  TagsList,
} from "~/api/boards";
import { BoardOverview } from "~/components/BoardOverview";
import { CardList } from "~/components/CardList";
import { DragDropBoard } from "~/components/DragDropBoard";
import { AddCardModal } from "~/components/modals/AddCardModal";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { useBoardDragDrop } from "~/lib/drag-drop/hooks";

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
  const allUsers = createAsync<UsersList>(() => listUsers());
  const allTags = createAsync<TagsList>(() => listTags());

  const effectiveUsers = createMemo(() => allUsers() || []);
  const effectiveTags = createMemo(() => allTags() || []);

  // Initialize board with boardData to avoid hydration mismatch
  const [board, setBoard] = createStore<BoardDetails | null>(boardData() ?? null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = createStore({ open: false });

  // Sync local state with server data
  createEffect(() => {
    const data = boardData();
    if (data && data !== board) {
      setBoard(data);
    }
  });

  // Drag-and-drop handler using composable hook
  const { handleDragEnd } = useBoardDragDrop({
    board: () => board,
    setBoard,
    boardData
  });

  // Handle optimistic card updates
  const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
    if (!board) return;

    setBoard(
      produce((draft) => {
        if (!draft) return;
        for (const list of draft.lists) {
          const card = list.cards.find((c) => c.id === cardId);
          if (card) {
            Object.assign(card, updates);
            break;
          }
        }
      })
    );
  };

  // Handle card creation with server ID
  const handleCardAdd = (cardData: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }) => {
    if (!board) return;

    setBoard(
      produce((draft) => {
        if (!draft) return;

        const todoList = draft.lists.find((list) => list.title === "Todo");
        if (!todoList) return;

        const tagLookup = new Set(cardData.tagIds);
        const resolvedTags = (allTags() || []).filter((tag) => tagLookup.has(tag.id));

        const newCard: BoardCard = {
          id: cardData.id,
          title: cardData.title,
          description: cardData.description,
          assigneeId: cardData.assigneeId,
          position: todoList.cards.length,
          completed: false,
          tags: resolvedTags,
          comments: [],
        };

        todoList.cards = [...todoList.cards, newCard];
      })
    );
  };

  // Handle card deletion
  const handleCardDelete = (cardId: string) => {
    if (!board) return;

    setBoard(
      produce((draft) => {
        if (!draft) return;
        for (const list of draft.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            break;
          }
        }
      })
    );
  };

  return (
    <main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div class="breadcrumbs text-sm">
        <ul>
          <li>
            <A
              href="/"
              class="link link-hover"
            >
              Boards
            </A>
          </li>
          <li>
            <Show
              when={board}
              fallback={<span>Loading...</span>}
            >
              {(data) => (
                <span class="text-base-content/60">{data().title}</span>
              )}
            </Show>
          </li>
        </ul>
      </div>

      <ErrorBoundary>
        <Suspense
          fallback={
            <div class="flex justify-center py-16">
              <span
                class="loading loading-spinner loading-lg text-primary"
                aria-label="Loading board"
              />
            </div>
          }
        >
          <Show when={boardData()}>
            {(data) => (
              <>
                <ErrorBoundary>
                  <DragDropBoard
                    onDragEnd={handleDragEnd}
                    board={() => board}
                  >
                    <div class="space-y-8">
                      <ErrorBoundary>
                        <Show when={board}>
                          {(boardState) => <BoardOverview data={boardState()} />}
                        </Show>
                      </ErrorBoundary>

                      <div class="flex justify-start mb-4">
                        <button
                          type="button"
                          class="btn btn-primary"
                          onClick={() => setIsAddCardModalOpen("open", true)}
                        >
                          Add Card
                        </button>
                      </div>

                      <section class="flex gap-7 overflow-x-auto pb-8">
                        <Show when={board}>
                          {(boardState) => (
                            <For
                              each={boardState().lists}
                              fallback={<CardListFallback />}
                            >
                              {(list) => (
                                <ErrorBoundary>
                                  <CardList
                                    list={list}
                                    users={effectiveUsers()}
                                    allUsers={effectiveUsers()}
                                    allTags={effectiveTags()}
                                    boardId={params.id}
                                    onCardUpdate={handleCardUpdate}
                                    onCardDelete={handleCardDelete}
                                  />
                                </ErrorBoundary>
                              )}
                            </For>
                          )}
                        </Show>
                      </section>
                    </div>
                  </DragDropBoard>
                </ErrorBoundary>
                <ErrorBoundary>
                  <Show when={board}>
                    {(boardState) => (
                      <AddCardModal
                        boardId={boardState().id}
                        users={effectiveUsers()}
                        tags={effectiveTags()}
                        isOpen={isAddCardModalOpen.open}
                        onClose={() => setIsAddCardModalOpen("open", false)}
                        onCardAdd={handleCardAdd}
                      />
                    )}
                  </Show>
                </ErrorBoundary>
              </>
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

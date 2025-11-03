import { A, createAsync, useParams, type RouteDefinition, useSubmissions } from "@solidjs/router";
import { batch, createEffect, createMemo, createSignal, For, Show, Suspense, untrack } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import { fetchBoard, listTags, listUsers } from "~/api";
import type { BoardCard, BoardDetails, TagsList, UsersList } from "~/api/boards";
import { BoardOverview } from "~/components/BoardOverview";
import { CardList } from "~/components/CardList";
import { DragDropBoard } from "~/components/DragDropBoard";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { AddCardModal } from "~/components/modals/AddCardModal";
import { useBoardDragDrop } from "~/lib/drag-drop/hooks";
import {
  updateCardListAction,
  updateCardPositionsAction
} from "~/api/drag-drop-actions";
import {
  updateCardAction,
  createCardAction,
  deleteCardAction,
  addCommentAction
} from "~/api/card-actions";

function CardListFallback() {
  return (
    <div class="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto">
      <div class="card-body items-center text-center">
        <h2 class="card-title text-secondary">No lists yet</h2>
        <p class="text-base-content/60">Add a list to begin organizing work on this board.</p>
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

type Mutation =
  | {
      type: "moveCard";
      cardId: string;
      targetListId: string;
      timestamp: number;
    }
  | {
      type: "reorderCards";
      cardIds: string[];
      timestamp: number;
    }
  | {
      type: "updateCard";
      cardId: string;
      updates: Partial<BoardCard>;
      timestamp: number;
    }
  | {
      type: "createCard";
      cardId: string;
      listId: string;
      timestamp: number;
    }
  | {
      type: "deleteCard";
      cardId: string;
      timestamp: number;
    };

function applyMutations(mutations: Mutation[], board: BoardDetails): BoardDetails {
  // Create a mutable copy
  const result: BoardDetails = {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: [...list.cards],
    })),
  };

  for (const mut of mutations.sort((a, b) => a.timestamp - b.timestamp)) {
    switch (mut.type) {
      case "moveCard": {
        // Find and remove card from source list
        let movedCard: BoardCard | null = null;
        for (const list of result.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === mut.cardId);
          if (cardIndex !== -1) {
            movedCard = list.cards[cardIndex];
            list.cards.splice(cardIndex, 1);
            break;
          }
        }

        // Add card to target list
        if (movedCard) {
          const targetList = result.lists.find((l) => l.id === mut.targetListId);
          if (targetList) {
            targetList.cards.push({ ...movedCard, listId: mut.targetListId });
          }
        }
        break;
      }

      case "reorderCards": {
        // Reorder cards based on the provided order
        for (const list of result.lists) {
          const cardMap = new Map(list.cards.map((c) => [c.id, c]));
          const reorderedCards: BoardCard[] = [];

          for (const cardId of mut.cardIds) {
            const card = cardMap.get(cardId);
            if (card && card.listId === list.id) {
              reorderedCards.push(card);
              cardMap.delete(cardId);
            }
          }

          // Add any remaining cards not in the reorder list
          cardMap.forEach((card) => {
            if (card.listId === list.id) {
              reorderedCards.push(card);
            }
          });

          if (reorderedCards.length > 0) {
            list.cards = reorderedCards;
          }
        }
        break;
      }

      case "deleteCard": {
        for (const list of result.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === mut.cardId);
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            break;
          }
        }
        break;
      }

      case "updateCard": {
        for (const list of result.lists) {
          const card = list.cards.find((c) => c.id === mut.cardId);
          if (card) {
            Object.assign(card, mut.updates);
            break;
          }
        }
        break;
      }
    }
  }

  return result;
}

export default function BoardPage() {
  const params = useParams();
  const boardData = createAsync<BoardDetails | null>(() => fetchBoard({ id: params.id }), {
    initialValue: { id: "", title: "", description: null, lists: [] },
  });
  const allUsers = createAsync<UsersList>(() => listUsers());
  const allTags = createAsync<TagsList>(() => listTags());

  const effectiveUsers = createMemo(() => allUsers() || []);
  const effectiveTags = createMemo(() => allTags() || []);

  // Store-based state for efficient diffing
  const [boardStore, setBoardStore] = createStore({
    board: boardData() || { id: "", title: "", description: null, lists: [] },
    timestamp: 0,
  });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = createSignal(false);

  // Track all pending submissions
  const moveCardSubmissions = useSubmissions(updateCardListAction);
  const reorderCardsSubmissions = useSubmissions(updateCardPositionsAction);
  const updateCardSubmissions = useSubmissions(updateCardAction);
  const createCardSubmissions = useSubmissions(createCardAction);
  const deleteCardSubmissions = useSubmissions(deleteCardAction);

  function getMutations(): Mutation[] {
    const mutations: Mutation[] = [];

    // Track move card mutations
    for (const submission of moveCardSubmissions.values()) {
      if (!submission.pending) continue;
      const [cardId, targetListId] = submission.input;
      mutations.push({
        type: "moveCard",
        cardId,
        targetListId,
        timestamp: Date.now(),
      });
    }

    // Track reorder mutations
    for (const submission of reorderCardsSubmissions.values()) {
      if (!submission.pending) continue;
      const [cardIds] = submission.input;
      mutations.push({
        type: "reorderCards",
        cardIds,
        timestamp: Date.now(),
      });
    }

    // Track card deletion mutations
    for (const submission of deleteCardSubmissions.values()) {
      if (!submission.pending) continue;
      const [cardId] = submission.input;
      mutations.push({
        type: "deleteCard",
        cardId,
        timestamp: Date.now(),
      });
    }

    return mutations;
  }

  // Effect to reconcile server data with pending mutations
  createEffect(() => {
    const mutations = untrack(() => getMutations());
    const data = boardData();

    if (!data || !data.id) return;

    // Apply mutations to server data
    const reconciledBoard = applyMutations(mutations, data);

    batch(() => {
      setBoardStore("board", reconcile(reconciledBoard));
      setBoardStore("timestamp", Date.now());
    });
  });

  // Effect for optimistic updates on new submissions
  createEffect(() => {
    const mutations = getMutations();
    const prevTimestamp = untrack(() => boardStore.timestamp);
    const latestMutations = mutations.filter((m) => m.timestamp > prevTimestamp);

    if (latestMutations.length === 0) return;

    setBoardStore(
      produce((store) => {
        store.board = applyMutations(latestMutations, store.board);
        store.timestamp = Date.now();
      })
    );
  });

  // Drag-and-drop handler using composable hook with optimistic updates
  const { handleDragEnd } = useBoardDragDrop({
    board: () => boardStore.board,
    setBoard: (updater) => {
      if (typeof updater === "function") {
        setBoardStore("board", updater(boardStore.board));
      } else {
        setBoardStore("board", updater);
      }
    },
    boardData,
  });

  const handleCardAdd = (cardData: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }) => {
    // Let server revalidation handle this
  };

  const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
    // Apply optimistic update to the board store
    setBoardStore(
      produce((store) => {
        for (const list of store.board.lists) {
          const card = list.cards.find((c) => c.id === cardId);
          if (card) {
            Object.assign(card, updates);
            break;
          }
        }
        store.timestamp = Date.now();
      })
    );
  };

  const handleCardDelete = (cardId: string) => {
    // Apply optimistic deletion to the board store
    setBoardStore(
      produce((store) => {
        for (const list of store.board.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            break;
          }
        }
        store.timestamp = Date.now();
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
              when={boardStore.board.id}
              fallback={<span>Loading...</span>}
            >
              <span class="text-base-content/60">{boardStore.board.title}</span>
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
          <Show when={boardStore.board.id}>
            <ErrorBoundary>
              <DragDropBoard
                onDragEnd={handleDragEnd}
                board={() => boardStore.board}
              >
                <div class="space-y-8">
                  <ErrorBoundary>
                    <BoardOverview data={boardStore.board} />
                  </ErrorBoundary>

                  <div class="flex justify-start mb-4">
                    <button
                      type="button"
                      class="btn btn-primary"
                      onClick={() => setIsAddCardModalOpen(true)}
                    >
                      Add Card
                    </button>
                  </div>

                  <section class="flex gap-7 overflow-x-auto pb-8">
                    <For
                      each={boardStore.board.lists}
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
                  </section>
                </div>
              </DragDropBoard>
            </ErrorBoundary>
            <ErrorBoundary>
              <AddCardModal
                boardId={boardStore.board.id}
                users={effectiveUsers()}
                tags={effectiveTags()}
                isOpen={isAddCardModalOpen()}
                onClose={() => setIsAddCardModalOpen(false)}
                onCardAdd={handleCardAdd}
              />
            </ErrorBoundary>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

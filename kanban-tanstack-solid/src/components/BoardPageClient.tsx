import { Link } from "@tanstack/solid-router";
import type { BoardDetails, BoardCard, UsersList, TagsList } from "../lib/api";
import { BoardOverview } from "./BoardOverview";
import { CardList } from "./CardList";
import { EmptyList } from "./EmptyList";
import { DragDropBoard } from "./DragDropBoard";
import { AddCardModal } from "./modals/AddCardModal";
import { useBoardDragDrop } from "../lib/drag-drop/hooks";
import { createSignal, For } from "solid-js";

export function BoardPageClient(props: {
  initialBoard: BoardDetails;
  allUsers: UsersList;
  allTags: TagsList;
}) {
  // Local mutable copy for optimistic updates
  const [board, setBoard] = createSignal<BoardDetails>(props.initialBoard);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = createSignal(false);

  const revertToServerState = () => {
    setBoard(props.initialBoard);
  };

  // Drag-and-drop handler using composable hook
  const { handleDragEnd } = useBoardDragDrop({
    board,
    setBoard,
    revertToServerState,
  });

  // Handle optimistic card updates
  const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
    const updatedBoard = {
      ...board(),
      lists: board().lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      })),
    };

    setBoard(updatedBoard);
  };

  // Handle card creation with server-generated ID
  const handleCardAdd = (cardData: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }) => {
    // Find the Todo list
    const todoList = board().lists.find((list) => list.title === "Todo");
    if (!todoList) return;

    // Create new card with server-generated ID
    const newCard: BoardCard = {
      id: cardData.id,
      title: cardData.title,
      description: cardData.description,
      assigneeId: cardData.assigneeId,
      position: todoList.cards.length,
      completed: false,
      tags: props.allTags.filter((tag) => cardData.tagIds.includes(tag.id)),
      comments: [],
    };

    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.title === "Todo"
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      ),
    }));
  };

  // Handle card deletion
  const handleCardDelete = (cardId: string) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    }));
  };

  return (
    <main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div class="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/" class="link link-hover">
              Boards
            </Link>
          </li>
          <li>
            <span class="text-base-content/60">{board().title}</span>
          </li>
        </ul>
      </div>

      <div class="space-y-8">
        <BoardOverview data={board()} />

        <div class="flex justify-start mb-4">
          <button
            type="button"
            class="btn btn-primary"
            onClick={() => setIsAddCardModalOpen(true)}
          >
            Add Card
          </button>
        </div>

        <DragDropBoard onDragEnd={handleDragEnd} board={board}>
          <div class="flex gap-7 overflow-x-auto pb-8">
            {board().lists.length === 0 ? (
              <EmptyList />
            ) : (
              <For each={board().lists}>
                {(list) => (
                  <CardList
                    list={list}
                    allUsers={props.allUsers}
                    allTags={props.allTags}
                    onCardUpdate={handleCardUpdate}
                    onCardDelete={handleCardDelete}
                  />
                )}
              </For>
            )}
          </div>
        </DragDropBoard>
      </div>

      <AddCardModal
        boardId={board().id}
        users={props.allUsers}
        tags={props.allTags}
        isOpen={isAddCardModalOpen()}
        onClose={() => setIsAddCardModalOpen(false)}
        onCardAdd={handleCardAdd}
      />
    </main>
  );
}

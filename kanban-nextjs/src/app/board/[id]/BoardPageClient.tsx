"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BoardDetails, BoardCard, UsersList, TagsList } from "@/lib/api";
import { BoardOverview } from "@/components/BoardOverview";
import { CardList } from "@/components/CardList";
import { EmptyList } from "@/components/EmptyList";
import { DragDropBoard } from "@/components/DragDropBoard";
import { AddCardModal } from "@/components/modals/AddCardModal";
import { useBoardDragDrop } from "@/lib/drag-drop/hooks";

export function BoardPageClient({
  initialBoard,
  allUsers,
  allTags,
}: {
  initialBoard: BoardDetails;
  allUsers: UsersList;
  allTags: TagsList;
}) {
  // Local mutable copy for optimistic updates
  const [board, setBoard] = useState<BoardDetails | null>(initialBoard);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // Sync local state with server data when initialBoard changes
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const revertToServerState = () => {
    setBoard(initialBoard);
  };

  // Drag-and-drop handler using composable hook
  const { handleDragEnd } = useBoardDragDrop({
    board,
    setBoard,
    revertToServerState,
  });

  // Handle optimistic card updates
  const handleCardUpdate = (cardId: string, updates: Partial<BoardCard>) => {
    if (!board) return;

    const updatedBoard = {
      ...board,
      lists: board.lists.map((list) => ({
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
    if (!board) return;

    // Find the Todo list
    const todoList = board.lists.find((list) => list.title === "Todo");
    if (!todoList) return;

    // Create new card with server-generated ID
    const newCard: BoardCard = {
      id: cardData.id,
      title: cardData.title,
      description: cardData.description,
      assigneeId: cardData.assigneeId,
      position: todoList.cards.length,
      completed: false,
      tags: allTags.filter((tag) => cardData.tagIds.includes(tag.id)),
      comments: [],
    };

    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lists: prev.lists.map((list) =>
          list.title === "Todo"
            ? { ...list, cards: [...list.cards, newCard] }
            : list
        ),
      };
    });
  };

  // Handle card deletion
  const handleCardDelete = (cardId: string) => {
    if (!board) return;

    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        })),
      };
    });
  };

  if (!board) {
    return (
      <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
        <div className="flex justify-center py-16">
          <span
            className="loading loading-spinner loading-lg text-primary"
            aria-label="Loading board"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link
              href="/"
              className="link link-hover"
            >
              Boards
            </Link>
          </li>
          <li>
            <span className="text-base-content/60">{board.title}</span>
          </li>
        </ul>
      </div>

      <div className="space-y-8">
        <BoardOverview data={board} />

        <div className="flex justify-start mb-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddCardModalOpen(true)}
          >
            Add Card
          </button>
        </div>

        <DragDropBoard
          onDragEnd={handleDragEnd}
          board={board}
        >
          <div className="flex gap-7 overflow-x-auto pb-8">
            {board.lists.length === 0 ? (
              <EmptyList />
            ) : (
              board.lists.map((list) => (
                <CardList
                  key={list.id}
                  list={list}
                  allUsers={allUsers}
                  allTags={allTags}
                  onCardUpdate={handleCardUpdate}
                  onCardDelete={handleCardDelete}
                />
              ))
            )}
          </div>
        </DragDropBoard>
      </div>

      <AddCardModal
        boardId={board.id}
        users={allUsers}
        tags={allTags}
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onCardAdd={handleCardAdd}
      />
    </main>
  );
}

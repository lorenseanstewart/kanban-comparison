"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { BoardList, UsersList, TagsList, BoardCard } from "@/lib/api";
import { Card } from "./Card";

export function CardList({
  list,
  users,
  allUsers,
  allTags,
  onCardUpdate,
}: {
  list: BoardList;
  users: UsersList | undefined;
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
}) {
  const { setNodeRef, isOver, over } = useDroppable({
    id: list.id,
  });

  const cardIds = list.cards.map((card) => card.id);

  // Check if we're over this list OR over any card in this list
  const isOverThisList = isOver || (over && cardIds.includes(over.id as string));

  return (
    <article className="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
      <div className="card-body gap-4">
        <header className="flex items-center justify-between">
          <h2 className="card-title text-base-content">{list.title}</h2>
          <div className="badge badge-primary badge-outline badge-lg shadow">
            {list.cards.length} cards
          </div>
        </header>

        <div
          ref={setNodeRef}
          className={`min-h-[200px] transition-all duration-200 ${
            isOverThisList
              ? "ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]"
              : ""
          }`}
        >
          {list.cards.length === 0 ? (
            <div className="alert alert-info text-sm">
              <span>No cards yet</span>
            </div>
          ) : (
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {list.cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    users={users}
                    allUsers={allUsers}
                    allTags={allTags}
                    onCardUpdate={onCardUpdate}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </article>
  );
}

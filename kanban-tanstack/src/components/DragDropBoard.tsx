

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { BoardDetails, BoardCard } from "../lib/api";

export function DragDropBoard({
  children,
  onDragEnd,
  board,
}: {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  board: BoardDetails | null;
}) {
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const currentBoard = board;

    if (currentBoard) {
      // Find the card in the board data
      for (const list of currentBoard.lists) {
        const card = list.cards.find((c) => c.id === cardId);
        if (card) {
          setActiveCard(card);
          break;
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    onDragEnd(event);
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <DndContext
      id="board-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: () => '',
          onDragOver: () => '',
          onDragEnd: () => '',
          onDragCancel: () => '',
        },
        screenReaderInstructions: {
          draggable: '',
        },
      }}
    >
      {children}
      <DragOverlay>
        {activeCard ? (
          <article className="card bg-base-100 dark:bg-neutral shadow-2xl rotate-3 scale-105">
            <div className="card-body gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="card-title text-lg text-base-content">
                  {activeCard.title}
                </h3>
                {activeCard.completed && (
                  <span className="badge badge-success badge-outline">Done</span>
                )}
              </div>

              {activeCard.description && (
                <p className="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
                  {activeCard.description}
                </p>
              )}

              {activeCard.tags.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {activeCard.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="badge border-0 shadow font-semibold text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

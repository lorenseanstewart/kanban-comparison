import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { BoardDetails, BoardCard } from "../lib/api";
import { findCardById } from "../lib/board-utils";
import { DraggingCardPreview } from "./DraggingCardPreview";

export function DragDropBoard({
  children,
  onDragEnd,
  board,
}: {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  board: BoardDetails;
}) {
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const card = findCardById(board, cardId);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    onDragEnd(event);
  };

  return (
    <DndContext
      id="board-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: () => "",
          onDragOver: () => "",
          onDragEnd: () => "",
          onDragCancel: () => "",
        },
        screenReaderInstructions: {
          draggable: "",
        },
      }}
    >
      {children}
      <DragOverlay>
        {activeCard ? <DraggingCardPreview card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}


"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import type { BoardDetails } from "@/lib/api";
import { updateCardList, updateCardPositions } from "@/lib/actions";
import {
  parseDragEvent,
  calculateReorder,
  createReorderUpdate,
  createCrossListUpdate,
} from "./logic";

export interface UseBoardDragDropOptions {
  board: BoardDetails;
  setBoard: (board: BoardDetails) => void;
  revertToServerState: () => void;
}

/**
 * React hook for board drag-and-drop functionality
 * Encapsulates all drag-drop state management and persistence logic
 */
export function useBoardDragDrop(options: UseBoardDragDropOptions) {
  const { board, setBoard, revertToServerState } = options;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    // Parse the drag event to extract all relevant information
    const result = parseDragEvent(
      active.id as string,
      over.id as string,
      board
    );

    if (!result) {
      return;
    }

    // Perform optimistic UI update
    if (result.isSameList) {
      // Same-list reorder
      const sourceList = board.lists.find((l) => l.id === result.sourceListId);
      if (!sourceList) return;

      const reorderResult = calculateReorder(
        sourceList.cards,
        result.cardId,
        result.droppableId
      );

      if (!reorderResult) return;

      setBoard(createReorderUpdate(board, result, reorderResult.reorderedCards));

      // Persist to database
      try {
        await updateCardPositions(reorderResult.reorderedIds);
      } catch {
        revertToServerState();
      }
    } else {
      // Cross-list move
      setBoard(createCrossListUpdate(board, result));

      // Persist to database
      try {
        await updateCardList(result.cardId, result.targetListId);
      } catch {
        revertToServerState();
      }
    }
  };

  return {
    handleDragEnd,
  };
}

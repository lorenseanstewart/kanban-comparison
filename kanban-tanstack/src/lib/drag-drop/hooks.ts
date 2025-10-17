import type { DragEndEvent } from "@dnd-kit/core";
import type { BoardDetails } from "../api";
import { updateCardList, updateCardPositions } from "../../utils/api";
import {
  parseDragEvent,
  calculateReorder,
  createReorderUpdate,
  createCrossListUpdate,
} from "./logic";

export interface UseBoardDragDropOptions {
  board: BoardDetails | null;
  setBoard: (board: BoardDetails | null) => void;
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

    const currentBoard = board;
    if (!currentBoard) return;

    // Parse the drag event to extract all relevant information
    const result = parseDragEvent(
      active.id as string,
      over.id as string,
      currentBoard
    );

    if (!result) {
      return;
    }

    // Perform optimistic UI update
    if (result.isSameList) {
      // Same-list reorder
      const sourceList = currentBoard.lists.find((l) => l.id === result.sourceListId);
      if (!sourceList) return;

      const reorderResult = calculateReorder(
        sourceList.cards,
        result.cardId,
        result.droppableId
      );

      if (!reorderResult) return;

      setBoard(createReorderUpdate(currentBoard, result, reorderResult.reorderedCards));

      // Persist to database
      try {
        await updateCardPositions({ data: { cardIds: reorderResult.reorderedIds } });
      } catch {
        revertToServerState();
      }
    } else {
      // Cross-list move
      setBoard(createCrossListUpdate(currentBoard, result));

      // Persist to database
      try {
        await updateCardList({ data: { cardId: result.cardId, newListId: result.targetListId } });
      } catch {
        revertToServerState();
      }
    }
  };

  return {
    handleDragEnd,
  };
}

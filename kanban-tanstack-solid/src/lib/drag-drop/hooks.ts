import type { BoardDetails } from "../api";
import { updateCardList, updateCardPositions } from "../../utils/api";
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
 * Hook for board drag-and-drop functionality
 * Encapsulates all drag-drop state management and persistence logic
 */
export function useBoardDragDrop(options: UseBoardDragDropOptions) {
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || !active) return;

    // Parse the drag event to extract all relevant information
    const result = parseDragEvent(
      active.id as string,
      over.id as string,
      options.board
    );

    if (!result) {
      return;
    }

    // Perform optimistic UI update
    if (result.isSameList) {
      // Same-list reorder
      const sourceList = options.board.lists.find(
        (l) => l.id === result.sourceListId
      );
      if (!sourceList) return;

      const reorderResult = calculateReorder(
        sourceList.cards,
        result.cardId,
        result.droppableId
      );

      if (!reorderResult) return;

      options.setBoard(
        createReorderUpdate(options.board, result, reorderResult.reorderedCards)
      );

      // Persist to database
      try {
        await updateCardPositions({
          data: { cardIds: reorderResult.reorderedIds },
        });
      } catch {
        options.revertToServerState();
      }
    } else {
      // Cross-list move
      options.setBoard(createCrossListUpdate(options.board, result));

      // Persist to database
      try {
        await updateCardList({
          data: { cardId: result.cardId, newListId: result.targetListId },
        });
      } catch {
        options.revertToServerState();
      }
    }
  };

  return {
    handleDragEnd,
  };
}

import type { BoardDetails } from "../api";
import type { Accessor } from "solid-js";
import { updateCardList, updateCardPositions } from "../../utils/api";
import {
  parseDragEvent,
  calculateReorder,
  createReorderUpdate,
  createCrossListUpdate,
} from "./logic";

export interface UseBoardDragDropOptions {
  board: Accessor<BoardDetails>;
  setBoard: (board: BoardDetails) => void;
  revertToServerState: () => void;
}

/**
 * Hook for board drag-and-drop functionality
 * Encapsulates all drag-drop state management and persistence logic
 */
export function useBoardDragDrop(options: UseBoardDragDropOptions) {
  const handleDragEnd = async (event: any) => {
    console.log("Full drag event:", event);
    const { draggable, droppable } = event;
    console.log("Drag end event:", {
      draggableId: draggable?.id,
      droppableId: droppable?.id,
      draggableObj: draggable,
      droppableObj: droppable,
    });

    if (!droppable || !draggable) {
      console.log("No draggable or droppable - returning");
      return;
    }

    // Get current board state
    const currentBoard = options.board();

    // Parse the drag event to extract all relevant information
    const result = parseDragEvent(
      draggable.id as string,
      droppable.id as string,
      currentBoard
    );

    console.log("Parsed drag result:", result);

    if (!result) {
      console.log("No valid drag result");
      return;
    }

    // Perform optimistic UI update
    if (result.isSameList) {
      // Same-list reorder
      const sourceList = currentBoard.lists.find(
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
        createReorderUpdate(currentBoard, result, reorderResult.reorderedCards)
      );

      // Persist to database
      try {
        console.log("Updating card positions:", reorderResult.reorderedIds);
        const response = await updateCardPositions({
          data: { cardIds: reorderResult.reorderedIds },
        });
        console.log("Position update response:", response);
      } catch (error) {
        console.error("Failed to update positions:", error);
        options.revertToServerState();
      }
    } else {
      // Cross-list move
      options.setBoard(createCrossListUpdate(currentBoard, result));

      // Persist to database
      try {
        console.log("Moving card to new list:", {
          cardId: result.cardId,
          newListId: result.targetListId,
        });
        const response = await updateCardList({
          data: { cardId: result.cardId, newListId: result.targetListId },
        });
        console.log("Move card response:", response);
      } catch (error) {
        console.error("Failed to move card:", error);
        options.revertToServerState();
      }
    }
  };

  return {
    handleDragEnd,
  };
}

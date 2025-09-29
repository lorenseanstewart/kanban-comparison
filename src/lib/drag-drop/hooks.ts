import { type Accessor, type Setter } from "solid-js";
import type { DragEventHandler } from "@thisbeyond/solid-dnd";
import type { BoardDetails } from "~/api/boards";
import { updateCardList, updateCardPositions } from "~/api/drag-drop-actions";
import {
  parseDragEvent,
  calculateReorder,
  createReorderUpdate,
  createCrossListUpdate,
} from "./logic";
import { withViewTransition } from "../utils/view-transitions";

export interface UseBoardDragDropOptions {
  board: Accessor<BoardDetails | null>;
  setBoard: Setter<BoardDetails | null>;
  boardData: Accessor<BoardDetails | null | undefined>;
}

/**
 * SolidJS composable hook for board drag-and-drop functionality
 * Encapsulates all drag-drop state management and persistence logic
 */
export function useBoardDragDrop(options: UseBoardDragDropOptions) {
  const { board, setBoard, boardData } = options;

  const handleDragEnd: DragEventHandler = async (event) => {
    const { draggable, droppable } = event;
    if (!draggable || !droppable) return;

    const currentBoard = board();
    if (!currentBoard) return;

    // Parse the drag event to extract all relevant information
    const result = parseDragEvent(
      draggable.id as string,
      droppable.id as string,
      currentBoard
    );

    if (!result) {
      console.warn("Failed to parse drag event", { draggable, droppable });
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

      withViewTransition(() => {
        setBoard((prev) =>
          prev ? createReorderUpdate(prev, result, reorderResult.reorderedCards) : prev
        );
      });

      // Persist to database
      try {
        await updateCardPositions(reorderResult.reorderedIds);
      } catch (error) {
        console.error("Failed to persist card reorder:", error);
        revertToServerState();
      }
    } else {
      // Cross-list move
      withViewTransition(() => {
        setBoard((prev) => (prev ? createCrossListUpdate(prev, result) : prev));
      });

      // Persist to database
      try {
        await updateCardList(result.cardId, result.targetListId);
      } catch (error) {
        console.error("Failed to persist card move:", error);
        revertToServerState();
      }
    }
  };

  const revertToServerState = () => {
    const data = boardData();
    if (data) {
      setBoard(data);
    }
  };

  return {
    handleDragEnd,
  };
}
import { type Accessor, type Setter } from "solid-js";
import type { DragEventHandler } from "@thisbeyond/solid-dnd";
import type { BoardDetails } from "~/api/boards";
import { updateCardListAction, updateCardPositionsAction } from "~/api/drag-drop-actions";
import {
  parseDragEvent,
  calculateReorder,
  createReorderUpdate,
  createCrossListUpdate,
} from "./logic";
import { withViewTransition } from "../utils/view-transitions";
import { useAction } from "@solidjs/router";

export interface UseBoardDragDropOptions {
  board: Accessor<BoardDetails | null>;
  setBoard: Setter<BoardDetails | null>;
  boardData: Accessor<BoardDetails | null | undefined>;
}

export function useBoardDragDrop(options: UseBoardDragDropOptions) {
  const { board, setBoard, boardData } = options;
  const moveCard = useAction(updateCardListAction);
  const reorderCards = useAction(updateCardPositionsAction);

  const handleDragEnd: DragEventHandler = async (event) => {
    const { draggable, droppable } = event;
    if (!draggable || !droppable) return;

    const currentBoard = board();
    if (!currentBoard) return;

    const result = parseDragEvent(
      draggable.id as string,
      droppable.id as string,
      currentBoard
    );

    if (!result) {
      return;
    }

    if (result.isSameList) {
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

      try {
        await reorderCards(reorderResult.reorderedIds);
      } catch (error) {
        revertToServerState();
      }
    } else {
      withViewTransition(() => {
        setBoard((prev) => (prev ? createCrossListUpdate(prev, result) : prev));
      });

      try {
        await moveCard(result.cardId, result.targetListId);
      } catch (error) {
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
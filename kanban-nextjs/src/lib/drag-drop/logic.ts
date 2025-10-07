import type { BoardDetails, BoardCard } from "@/lib/api";
import type { DragDropResult, ReorderResult } from "./types";

/**
 * Resolves the target list ID from a droppable ID.
 * Handles both direct list drops (e.g., "list-123") and card drops (e.g., "card-456").
 */
export function resolveTargetListId(
  droppableId: string,
  board: BoardDetails
): string | null {
  if (droppableId.startsWith("list-")) {
    return droppableId;
  }

  if (droppableId.startsWith("card-")) {
    const targetList = board.lists.find((list) =>
      list.cards.some((card) => card.id === droppableId)
    );
    return targetList?.id ?? null;
  }

  return null;
}

/**
 * Parses a drag-and-drop event and extracts all relevant information needed for state updates.
 */
export function parseDragEvent(
  cardId: string,
  droppableId: string,
  board: BoardDetails
): DragDropResult | null {
  const sourceList = board.lists.find((list) =>
    list.cards.some((card) => card.id === cardId)
  );

  if (!sourceList) return null;

  const targetListId = resolveTargetListId(droppableId, board);
  if (!targetListId) return null;

  const card = sourceList.cards.find((c) => c.id === cardId);
  if (!card) return null;

  return {
    cardId,
    droppableId,
    sourceListId: sourceList.id,
    targetListId,
    isSameList: sourceList.id === targetListId,
    card,
  };
}

/**
 * Calculates the new card order when reordering within the same list.
 */
export function calculateReorder(
  cards: BoardCard[],
  draggedCardId: string,
  droppedOnCardId: string
): ReorderResult | null {
  const cardIds = cards.map((c) => c.id);
  const oldIndex = cardIds.indexOf(draggedCardId);
  const newIndex = cardIds.indexOf(droppedOnCardId);

  if (oldIndex === -1 || newIndex === -1) {
    return null;
  }

  const reorderedIds = [...cardIds];
  reorderedIds.splice(oldIndex, 1);
  reorderedIds.splice(newIndex, 0, draggedCardId);

  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const reorderedCards = reorderedIds.map((id) => cardMap.get(id)!);

  return { reorderedIds, reorderedCards };
}

/**
 * Creates an optimistic UI state update for same-list card reordering.
 */
export function createReorderUpdate(
  board: BoardDetails,
  result: DragDropResult,
  reorderedCards: BoardCard[]
): BoardDetails {
  return {
    ...board,
    lists: board.lists.map((list) =>
      list.id === result.targetListId ? { ...list, cards: reorderedCards } : list
    ),
  };
}

/**
 * Creates an optimistic UI state update for moving a card to a different list.
 */
export function createCrossListUpdate(
  board: BoardDetails,
  result: DragDropResult
): BoardDetails {
  return {
    ...board,
    lists: board.lists.map((list) => {
      if (list.id === result.sourceListId) {
        return { ...list, cards: list.cards.filter((c) => c.id !== result.cardId) };
      } else if (list.id === result.targetListId) {
        return { ...list, cards: [...list.cards, result.card] };
      }
      return list;
    }),
  };
}

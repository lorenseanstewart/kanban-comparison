import type { BoardDetails, BoardCard } from "~/api/boards";
import type { DragDropResult, ReorderResult } from "./types";

/**
 * Resolves the target list ID from a droppable ID.
 * Handles both direct list drops (e.g., "list-123") and card drops (e.g., "card-456").
 *
 * @param droppableId - The ID of the droppable zone where the card was dropped
 * @param board - The complete board data structure containing all lists and cards
 * @returns The ID of the target list, or null if the drop target is invalid
 *
 * @example
 * // Dropping on a list directly
 * resolveTargetListId("list-123", board) // Returns "list-123"
 *
 * @example
 * // Dropping on a card (sortable) - finds the list containing that card
 * resolveTargetListId("card-456", board) // Returns the list ID containing card-456
 */
export function resolveTargetListId(
  droppableId: string,
  board: BoardDetails
): string | null {
  if (droppableId.startsWith("list-")) {
    return droppableId.replace("list-", "");
  }

  if (droppableId.startsWith("card-")) {
    const actualCardId = droppableId.replace("card-", "");
    const targetList = board.lists.find((list) =>
      list.cards.some((card) => card.id === actualCardId)
    );
    return targetList?.id ?? null;
  }

  return null;
}

/**
 * Parses a drag-and-drop event and extracts all relevant information needed for state updates.
 * This is the main entry point for processing drag events from @thisbeyond/solid-dnd.
 *
 * @param cardId - The ID of the card being dragged
 * @param droppableId - The ID of the drop zone where the card was released
 * @param board - The current board state with all lists and cards
 * @returns A structured result containing source/target list IDs and whether it's a same-list reorder, or null if invalid
 *
 * @example
 * const result = parseDragEvent("card-123", "list-456", board);
 * if (result?.isSameList) {
 *   // Handle reordering within the same list
 * } else {
 *   // Handle moving card to a different list
 * }
 */
export function parseDragEvent(
  cardId: string,
  droppableId: string,
  board: BoardDetails
): DragDropResult | null {
  // Strip the 'card-' prefix if present
  const actualCardId = cardId.startsWith('card-') ? cardId.replace('card-', '') : cardId;

  const sourceList = board.lists.find((list) =>
    list.cards.some((card) => card.id === actualCardId)
  );

  if (!sourceList) return null;

  const targetListId = resolveTargetListId(droppableId, board);
  if (!targetListId) return null;

  const card = sourceList.cards.find((c) => c.id === actualCardId);
  if (!card) return null;

  return {
    cardId: actualCardId,
    droppableId,
    sourceListId: sourceList.id,
    targetListId,
    isSameList: sourceList.id === targetListId,
    card,
  };
}

/**
 * Calculates the new card order when reordering within the same list.
 * Uses array splicing to move the dragged card to its new position.
 *
 * @param cards - The array of cards in the list (in current order)
 * @param draggedCardId - The ID of the card being moved
 * @param droppedOnCardId - The ID of the card that was dropped on (target position)
 * @returns An object containing both the new card ID order and the full reordered card objects, or null if invalid
 *
 * @example
 * const cards = [card1, card2, card3, card4];
 * const result = calculateReorder(cards, "card3", "card1");
 * // result.reorderedIds = ["card1", "card3", "card2", "card4"]
 * // result.reorderedCards contains the actual card objects in new order
 */
export function calculateReorder(
  cards: BoardCard[],
  draggedCardId: string,
  droppedOnCardId: string
): ReorderResult | null {
  // Strip the 'card-' prefix if present
  const actualDroppedOnCardId = droppedOnCardId.startsWith('card-')
    ? droppedOnCardId.replace('card-', '')
    : droppedOnCardId;

  const cardIds = cards.map((c) => c.id);
  const oldIndex = cardIds.indexOf(draggedCardId);
  const newIndex = cardIds.indexOf(actualDroppedOnCardId);

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
 * Returns a new board object with the target list's cards reordered, while keeping all other lists unchanged.
 *
 * @param board - The current board state
 * @param result - The parsed drag event result containing source/target information
 * @param reorderedCards - The new array of cards in their reordered sequence
 * @returns A new BoardDetails object with the optimistic update applied
 *
 * @example
 * const newBoard = createReorderUpdate(currentBoard, dragResult, newCardOrder);
 * setBoard(newBoard); // Optimistically update UI before server confirms
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
 * Removes the card from the source list and appends it to the end of the target list.
 *
 * @param board - The current board state
 * @param result - The parsed drag event result containing card, source list ID, and target list ID
 * @returns A new BoardDetails object with the card moved from source to target list
 *
 * @example
 * const newBoard = createCrossListUpdate(currentBoard, dragResult);
 * setBoard(newBoard); // Optimistically update UI before server confirms
 *
 * @remarks
 * The card is always appended to the end of the target list. Server-side position updates
 * will be handled separately to maintain proper ordering in the database.
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
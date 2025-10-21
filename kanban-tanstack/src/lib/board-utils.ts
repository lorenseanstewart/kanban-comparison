import type { BoardDetails, BoardCard } from "./api";

/**
 * Find a card by ID in the board structure
 */
export function findCardById(
  board: BoardDetails,
  cardId: string
): BoardCard | null {
  for (const list of board.lists) {
    const card = list.cards.find((c) => c.id === cardId);
    if (card) {
      return card;
    }
  }
  return null;
}

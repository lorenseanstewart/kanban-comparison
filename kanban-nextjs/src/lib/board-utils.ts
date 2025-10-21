"use client";

import { useSyncExternalStore } from "react";
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

/**
 * Hook to detect if code is running on the client
 * Uses useSyncExternalStore for proper SSR/hydration handling
 */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // subscribe (no-op since this never changes)
    () => true, // getSnapshot on client
    () => false // getServerSnapshot on server
  );
}

import type { DragEvent } from "@thisbeyond/solid-dnd";
import type { BoardDetails, BoardCard } from "~/api/boards";

export interface DragDropResult {
  cardId: string;
  droppableId: string;
  sourceListId: string;
  targetListId: string;
  isSameList: boolean;
  card: BoardCard;
}

export interface ReorderResult {
  reorderedIds: string[];
  reorderedCards: BoardCard[];
}

export type OptimisticUpdateFn = (prev: BoardDetails | null) => BoardDetails | null;
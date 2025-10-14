import type { BoardCard } from "../api";

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

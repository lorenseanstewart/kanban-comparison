import type { BoardDetails, UsersList } from "../lib/api";

interface Kanban {
  // Modal handlers
  handleAddBoardResponse: (event: any, form: HTMLFormElement) => void;
  handleAddCardSuccess: (event: any, form: HTMLFormElement) => void;
  handleEditCardSuccess: (event: any) => void;
  handleCommentResponse: (
    event: any,
    form: HTMLFormElement,
    cardId: string
  ) => void;
  openEditCardModal: (cardId: string) => void;

  // Drag and drop functions
  getDragDropValues: (event: any) => any;
  initializeDragAndDrop: () => void;
  handleAfterSwap: (event: any) => void;

  // Board data
  board?: BoardDetails;
  users?: UsersList;
}

declare global {
  interface Window {
    kanban: Kanban;
    htmx?: any;
  }
}

export {};

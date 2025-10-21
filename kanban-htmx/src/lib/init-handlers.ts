import {
  handleAddCardSuccess,
  handleEditCardSuccess,
  handleCommentResponse,
  openEditCardModal,
} from "./modal-handlers";

// Initialize namespace
declare global {
  interface Window {
    kanban: {
      handleAddCardSuccess: typeof handleAddCardSuccess;
      handleEditCardSuccess: typeof handleEditCardSuccess;
      handleCommentResponse: typeof handleCommentResponse;
      openEditCardModal: typeof openEditCardModal;
      board?: any;
    };
  }
}

window.kanban = window.kanban || ({} as any);

// Expose handlers to window namespace
window.kanban.handleAddCardSuccess = handleAddCardSuccess;
window.kanban.handleEditCardSuccess = handleEditCardSuccess;
window.kanban.handleCommentResponse = handleCommentResponse;
window.kanban.openEditCardModal = openEditCardModal;

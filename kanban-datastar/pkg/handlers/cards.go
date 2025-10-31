package handlers

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (h *WebHandler) AddCard(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	description := strings.TrimSpace(r.FormValue("description"))
	assigneeID := strings.TrimSpace(r.FormValue("assigneeId"))
	tagIDs := r.Form["tagIds"]

	cardID, err := h.cardService.CreateCard(r.Context(), boardID, title, description, assigneeID, tagIDs)
	if err != nil {
		h.l.Error("Failed to create card", "error", err)
		http.Error(w, "Failed to create card", http.StatusInternalServerError)
		return
	}

	h.l.Info("Card created successfully", "cardID", cardID, "title", title, "boardID", boardID)

	h.renderBoardCards(w, r, boardID)
}

func (h *WebHandler) UpdateCard(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	cardID := chi.URLParam(r, "cardID")

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	description := strings.TrimSpace(r.FormValue("description"))
	assigneeID := strings.TrimSpace(r.FormValue("assigneeId"))
	tagIDs := r.Form["tagIds"]

	err := h.cardService.UpdateCard(r.Context(), cardID, title, description, assigneeID, tagIDs)
	if err != nil {
		h.l.Error("Failed to update card", "error", err)
		http.Error(w, "Failed to update card", http.StatusInternalServerError)
		return
	}

	h.l.Info("Card updated successfully", "cardID", cardID, "title", title, "boardID", boardID)

	h.renderBoardCards(w, r, boardID)
}

func (h *WebHandler) DeleteCard(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	cardID := chi.URLParam(r, "cardID")

	err := h.cardService.DeleteCard(r.Context(), cardID)
	if err != nil {
		h.l.Error("Failed to delete card", "error", err)
		http.Error(w, "Failed to delete card", http.StatusInternalServerError)
		return
	}

	h.l.Info("Card deleted successfully", "cardID", cardID, "boardID", boardID)

	h.renderBoardCards(w, r, boardID)
}

func (h *WebHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	cardID := chi.URLParam(r, "cardID")

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	userID := strings.TrimSpace(r.FormValue("userId"))
	text := strings.TrimSpace(r.FormValue("text"))

	commentID, err := h.cardService.CreateComment(r.Context(), cardID, userID, text)
	if err != nil {
		h.l.Error("Failed to create comment", "error", err)
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	h.l.Info("Comment created successfully", "commentID", commentID, "cardID", cardID, "boardID", boardID)

	h.renderBoardCards(w, r, boardID)
}

func (h *WebHandler) UpdateCardList(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	cardID := chi.URLParam(r, "cardID")

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	newListID := strings.TrimSpace(r.FormValue("listId"))
	err := h.cardService.UpdateCardList(r.Context(), cardID, newListID)
	if err != nil {
		h.l.Error("Failed to update card list", "error", err)
		http.Error(w, "Failed to update card list", http.StatusInternalServerError)
		return
	}

	h.l.Info("Card list updated successfully", "cardID", cardID, "newListID", newListID, "boardID", boardID)

	h.renderBoardCards(w, r, boardID)
}

func (h *WebHandler) UpdateCardPositions(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	listID := chi.URLParam(r, "listID")

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	cardIDs := r.Form["cardIds"]

	err := h.cardService.UpdateCardPositions(r.Context(), cardIDs)
	if err != nil {
		h.l.Error("Failed to update card positions", "error", err)
		http.Error(w, "Failed to update card positions", http.StatusInternalServerError)
		return
	}

	h.l.Info("Card positions updated successfully", "listID", listID, "boardID", boardID, "count", len(cardIDs))

	h.renderBoardCards(w, r, boardID)
}

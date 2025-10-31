package handlers

import (
	"database/sql"
	"kanban-datastar/view"
	"kanban-datastar/view/board"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/starfederation/datastar-go/datastar"
)

func (h *WebHandler) Board(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")

	boardDetails, users, tags, err := h.boardService.GetBoardDetails(r.Context(), boardID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}
		h.l.Error("Failed to get board details", "error", err, "boardID", boardID)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := NewPageResponse(board.Board(boardDetails, users, tags), boardDetails.Title+" | Kanban Board")
	h.RenderPage(response, w, r)
}

func (h *WebHandler) AddBoard(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	description := strings.TrimSpace(r.FormValue("description"))

	boardID, err := h.boardService.CreateBoard(r.Context(), title, description)
	if err != nil {
		h.l.Error("Failed to create board", "error", err)
		http.Error(w, "Failed to create board", http.StatusInternalServerError)
		return
	}

	h.l.Info("Board created successfully", "boardID", boardID, "title", title)

	boards, err := h.boardService.GetAllBoards(r.Context())
	if err != nil {
		h.l.Error("Failed to get boards", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	sse := datastar.NewSSE(w, r)
	err = sse.PatchElementTempl(view.Index(boards))
	if err != nil {
		h.l.Error("Failed to patch element", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
}

// renderBoardCards is an internal function that rerenders cards when any card value changes
func (h *WebHandler) renderBoardCards(w http.ResponseWriter, r *http.Request, boardID string) {
	boardDetails, users, _, err := h.boardService.GetBoardDetails(r.Context(), boardID)
	if err != nil {
		h.l.Error("Failed to get board details", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	sse := datastar.NewSSE(w, r)
	err = sse.PatchElementTempl(board.BoardCardsSection(boardDetails, users))
	if err != nil {
		h.l.Error("Failed to patch element", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
}

package handlers

import (
	"kanban-datastar/pkg/database"
	"kanban-datastar/view"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type WebHandler struct {
	l  *slog.Logger
	db *database.DB
}

func NewWebHandler(logger *slog.Logger, db *database.DB) *WebHandler {
	return &WebHandler{
		l:  logger,
		db: db,
	}
}

func (h *WebHandler) SetupRoutes(r chi.Router) {
	r.Get("/", h.Index)
	r.Get("/board/{boardID}", h.Board)
	r.Post("/board", h.AddBoard)
	r.Post("/board/{boardID}/card", h.AddCard)
}

func (h *WebHandler) Index(w http.ResponseWriter, r *http.Request) {
	// Get all boards
	boards, err := h.db.Queries.GetBoards(r.Context())
	if err != nil {
		h.l.Error("Failed to get boards", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := NewPageResponse(view.Index(boards), "Kanban Board")
	h.RenderPage(response, w, r)
}

package handlers

import (
	"database/sql"
	"kanban-datastar/pkg/database"
	"kanban-datastar/pkg/database/sqlcgen"
	"kanban-datastar/view/board"
	"kanban-datastar/view"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// WebHandler holds dependencies needed by web handlers
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

func (h *WebHandler) Board(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	ctx := r.Context()

	// Fetch board
	boardData, err := h.db.Queries.GetBoard(ctx, boardID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Board not found", http.StatusNotFound)
			return
		}
		h.l.Error("Failed to get board", "error", err, "boardID", boardID)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Fetch lists
	lists, err := h.db.Queries.GetListsByBoardId(ctx, boardID)
	if err != nil {
		h.l.Error("Failed to get lists", "error", err, "boardID", boardID)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Fetch all users
	users, err := h.db.Queries.GetUsers(ctx)
	if err != nil {
		h.l.Error("Failed to get users", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Fetch all tags
	tags, err := h.db.Queries.GetTags(ctx)
	if err != nil {
		h.l.Error("Failed to get tags", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Get list IDs for fetching cards
	listIDs := make([]string, len(lists))
	for i, list := range lists {
		listIDs[i] = list.ID
	}

	// Fetch cards for all lists
	var cards []sqlcgen.GetCardsByListIdsRow
	if len(listIDs) > 0 {
		cards, err = h.db.Queries.GetCardsByListIds(ctx, listIDs)
		if err != nil {
			h.l.Error("Failed to get cards", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	// Get card IDs for fetching tags and comments
	cardIDs := make([]string, len(cards))
	for i, card := range cards {
		cardIDs[i] = card.ID
	}

	// Fetch card tags
	var cardTags []sqlcgen.GetTagsByCardIdsRow
	if len(cardIDs) > 0 {
		cardTags, err = h.db.Queries.GetTagsByCardIds(ctx, cardIDs)
		if err != nil {
			h.l.Error("Failed to get card tags", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	// Fetch comments
	var comments []sqlcgen.Comment
	if len(cardIDs) > 0 {
		comments, err = h.db.Queries.GetCommentsByCardIds(ctx, cardIDs)
		if err != nil {
			h.l.Error("Failed to get comments", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	// Build nested data structure
	boardDetails := board.BuildBoardDetails(boardData, lists, cards, cardTags, comments, users, tags)

	response := NewPageResponse(board.Board(boardDetails, users, tags), boardData.Title + " | Kanban Board")
	h.RenderPage(response, w, r)
}

package handlers

import (
	"database/sql"
	"kanban-datastar/pkg/database/sqlcgen"
	"kanban-datastar/view"
	"kanban-datastar/view/board"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/starfederation/datastar-go/datastar"
)

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

	response := NewPageResponse(board.Board(boardDetails, users, tags), boardData.Title+" | Kanban Board")
	h.RenderPage(response, w, r)
}

func (h *WebHandler) AddBoard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	description := strings.TrimSpace(r.FormValue("description"))

	if title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}
	if len(title) > 255 {
		http.Error(w, "Title must be less than 255 characters", http.StatusBadRequest)
		return
	}
	if len(description) > 500 {
		http.Error(w, "Description must be less than 500 characters", http.StatusBadRequest)
		return
	}

	boardID := uuid.New().String()
	now := time.Now()

	var descSQL sql.NullString
	if description != "" {
		descSQL = sql.NullString{String: description, Valid: true}
	}

	// Create board
	err := h.db.Queries.CreateBoard(ctx, sqlcgen.CreateBoardParams{
		ID:          boardID,
		Title:       title,
		Description: descSQL,
		CreatedAt:   now.Unix(),
	})
	if err != nil {
		h.l.Error("Failed to create board", "error", err)
		http.Error(w, "Failed to create board", http.StatusInternalServerError)
		return
	}

	listTitles := []string{"Todo", "In-Progress", "QA", "Done"}
	for i, listTitle := range listTitles {
		listID := uuid.New().String()
		err := h.db.Queries.CreateList(ctx, sqlcgen.CreateListParams{
			ID:        listID,
			BoardID:   boardID,
			Title:     listTitle,
			Position:  int64(i + 1),
			CreatedAt: now.Unix(),
		})
		if err != nil {
			h.l.Error("Failed to create list", "error", err, "boardID", boardID, "listTitle", listTitle)
			http.Error(w, "Failed to create default lists", http.StatusInternalServerError)
			return
		}
	}

	h.l.Info("Board created successfully", "boardID", boardID, "title", title)

	// Get all boards for re-rendering
	boards, err := h.db.Queries.GetBoards(ctx)
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

func (h *WebHandler) AddCard(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	ctx := r.Context()

	if err := r.ParseForm(); err != nil {
		h.l.Error("Failed to parse form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	description := strings.TrimSpace(r.FormValue("description"))
	assigneeID := strings.TrimSpace(r.FormValue("assigneeId"))
	tagIDs := r.Form["tagIds"]

	// Validate title
	if title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}
	if len(title) > 255 {
		http.Error(w, "Title must be less than 255 characters", http.StatusBadRequest)
		return
	}
	if len(description) > 2000 {
		http.Error(w, "Description must be less than 2000 characters", http.StatusBadRequest)
		return
	}

	// Find the Todo list for this board
	lists, err := h.db.Queries.GetListsByBoardId(ctx, boardID)
	if err != nil {
		h.l.Error("Failed to get lists", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	var todoListID string
	for _, list := range lists {
		if list.Title == "Todo" {
			todoListID = list.ID
			break
		}
	}

	if todoListID == "" {
		h.l.Error("Todo list not found for board", "boardID", boardID)
		http.Error(w, "Todo list not found", http.StatusBadRequest)
		return
	}

	// Get max position in the Todo list
	maxPos, err := h.db.Queries.GetMaxPositionInList(ctx, todoListID)
	if err != nil {
		h.l.Error("Failed to get max position", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	nextPosition := maxPos + 1
	cardID := uuid.New().String()
	now := time.Now()

	// Handle null fields
	var descSQL sql.NullString
	if description != "" {
		descSQL = sql.NullString{String: description, Valid: true}
	}

	var assigneeSQL sql.NullString
	if assigneeID != "" {
		assigneeSQL = sql.NullString{String: assigneeID, Valid: true}
	}

	// Create card
	err = h.db.Queries.CreateCard(ctx, sqlcgen.CreateCardParams{
		ID:          cardID,
		ListID:      todoListID,
		Title:       title,
		Description: descSQL,
		AssigneeID:  assigneeSQL,
		Position:    nextPosition,
		Completed:   sql.NullInt64{Int64: 0, Valid: true},
		CreatedAt:   now.Unix(),
	})
	if err != nil {
		h.l.Error("Failed to create card", "error", err)
		http.Error(w, "Failed to create card", http.StatusInternalServerError)
		return
	}

	// Create card tags
	for _, tagID := range tagIDs {
		err := h.db.Queries.CreateCardTag(ctx, sqlcgen.CreateCardTagParams{
			CardID: cardID,
			TagID:  tagID,
		})
		if err != nil {
			h.l.Error("Failed to create card tag", "error", err, "cardID", cardID, "tagID", tagID)
			// Continue anyway - don't fail the whole operation
		}
	}

	h.l.Info("Card created successfully", "cardID", cardID, "title", title, "boardID", boardID)

	// Fetch updated board data for re-rendering
	// Reuse the Board handler logic to fetch all data
	boardData, err := h.db.Queries.GetBoard(ctx, boardID)
	if err != nil {
		h.l.Error("Failed to get board", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	lists, err = h.db.Queries.GetListsByBoardId(ctx, boardID)
	if err != nil {
		h.l.Error("Failed to get lists", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	listIDs := make([]string, len(lists))
	for i, list := range lists {
		listIDs[i] = list.ID
	}

	var cards []sqlcgen.GetCardsByListIdsRow
	if len(listIDs) > 0 {
		cards, err = h.db.Queries.GetCardsByListIds(ctx, listIDs)
		if err != nil {
			h.l.Error("Failed to get cards", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	cardIDs := make([]string, len(cards))
	for i, card := range cards {
		cardIDs[i] = card.ID
	}

	var cardTags []sqlcgen.GetTagsByCardIdsRow
	if len(cardIDs) > 0 {
		cardTags, err = h.db.Queries.GetTagsByCardIds(ctx, cardIDs)
		if err != nil {
			h.l.Error("Failed to get card tags", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	var comments []sqlcgen.Comment
	if len(cardIDs) > 0 {
		comments, err = h.db.Queries.GetCommentsByCardIds(ctx, cardIDs)
		if err != nil {
			h.l.Error("Failed to get comments", "error", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	users, err := h.db.Queries.GetUsers(ctx)
	if err != nil {
		h.l.Error("Failed to get users", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	tags, err := h.db.Queries.GetTags(ctx)
	if err != nil {
		h.l.Error("Failed to get tags", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	boardDetails := board.BuildBoardDetails(boardData, lists, cards, cardTags, comments, users, tags)

	// Return just the cards section for Datastar to swap
	sse := datastar.NewSSE(w, r)
	err = sse.PatchElementTempl(board.BoardCardsSection(boardDetails))
	if err != nil {
		h.l.Error("Failed to patch element", "error", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
}

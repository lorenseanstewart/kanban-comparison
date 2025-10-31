package services

import (
	"context"
	"database/sql"
	"kanban-datastar/pkg/database"
	"kanban-datastar/pkg/database/sqlcgen"
	"kanban-datastar/view/board"
	"time"

	"github.com/google/uuid"
)

type BoardService struct {
	db *database.DB
}

func NewBoardService(db *database.DB) *BoardService {
	return &BoardService{db: db}
}

// CreateBoard creates a new board with default lists
func (s *BoardService) CreateBoard(ctx context.Context, title, description string) (string, error) {
	boardID := uuid.New().String()
	now := time.Now()

	var descSQL sql.NullString
	if description != "" {
		descSQL = sql.NullString{String: description, Valid: true}
	}

	err := s.db.Queries.CreateBoard(ctx, sqlcgen.CreateBoardParams{
		ID:          boardID,
		Title:       title,
		Description: descSQL,
		CreatedAt:   now.Unix(),
	})
	if err != nil {
		return "", err
	}

	listTitles := []string{"Todo", "In-Progress", "QA", "Done"}
	for i, listTitle := range listTitles {
		listID := uuid.New().String()
		err := s.db.Queries.CreateList(ctx, sqlcgen.CreateListParams{
			ID:        listID,
			BoardID:   boardID,
			Title:     listTitle,
			Position:  int64(i + 1),
			CreatedAt: now.Unix(),
		})
		if err != nil {
			return "", err
		}
	}

	return boardID, nil
}

// GetAllBoards returns all boards
func (s *BoardService) GetAllBoards(ctx context.Context) ([]sqlcgen.GetBoardsRow, error) {
	return s.db.Queries.GetBoards(ctx)
}

// GetBoardDetails returns full board details with nested data
func (s *BoardService) GetBoardDetails(ctx context.Context, boardID string) (board.BoardDetails, []sqlcgen.User, []sqlcgen.GetTagsRow, error) {
	boardData, err := s.db.Queries.GetBoard(ctx, boardID)
	if err != nil {
		return board.BoardDetails{}, nil, nil, err
	}

	lists, err := s.db.Queries.GetListsByBoardId(ctx, boardID)
	if err != nil {
		return board.BoardDetails{}, nil, nil, err
	}

	users, err := s.db.Queries.GetUsers(ctx)
	if err != nil {
		return board.BoardDetails{}, nil, nil, err
	}

	tags, err := s.db.Queries.GetTags(ctx)
	if err != nil {
		return board.BoardDetails{}, nil, nil, err
	}

	listIDs := make([]string, len(lists))
	for i, list := range lists {
		listIDs[i] = list.ID
	}

	var cards []sqlcgen.GetCardsByListIdsRow
	if len(listIDs) > 0 {
		cards, err = s.db.Queries.GetCardsByListIds(ctx, listIDs)
		if err != nil {
			return board.BoardDetails{}, nil, nil, err
		}
	}

	cardIDs := make([]string, len(cards))
	for i, card := range cards {
		cardIDs[i] = card.ID
	}

	var cardTags []sqlcgen.GetTagsByCardIdsRow
	if len(cardIDs) > 0 {
		cardTags, err = s.db.Queries.GetTagsByCardIds(ctx, cardIDs)
		if err != nil {
			return board.BoardDetails{}, nil, nil, err
		}
	}

	var comments []sqlcgen.Comment
	if len(cardIDs) > 0 {
		comments, err = s.db.Queries.GetCommentsByCardIds(ctx, cardIDs)
		if err != nil {
			return board.BoardDetails{}, nil, nil, err
		}
	}

	boardDetails := board.BuildBoardDetails(boardData, lists, cards, cardTags, comments, users, tags)

	return boardDetails, users, tags, nil
}

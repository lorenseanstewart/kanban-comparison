package services

import (
	"context"
	"database/sql"
	"kanban-datastar/pkg/database"
	"kanban-datastar/pkg/database/sqlcgen"
	"time"

	"github.com/google/uuid"
)

type CardService struct {
	db *database.DB
}

func NewCardService(db *database.DB) *CardService {
	return &CardService{db: db}
}

// CreateCard creates a new card in the Todo list
func (s *CardService) CreateCard(ctx context.Context, boardID, title, description, assigneeID string, tagIDs []string) (string, error) {
	lists, err := s.db.Queries.GetListsByBoardId(ctx, boardID)
	if err != nil {
		return "", err
	}

	var todoListID string
	for _, list := range lists {
		if list.Title == "Todo" {
			todoListID = list.ID
			break
		}
	}

	if todoListID == "" {
		return "", sql.ErrNoRows
	}

	maxPos, err := s.db.Queries.GetMaxPositionInList(ctx, todoListID)
	if err != nil {
		return "", err
	}

	nextPosition := maxPos + 1
	cardID := uuid.New().String()
	now := time.Now()

	var descSQL sql.NullString
	if description != "" {
		descSQL = sql.NullString{String: description, Valid: true}
	}

	var assigneeSQL sql.NullString
	if assigneeID != "" {
		assigneeSQL = sql.NullString{String: assigneeID, Valid: true}
	}

	err = s.db.Queries.CreateCard(ctx, sqlcgen.CreateCardParams{
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
		return "", err
	}

	for _, tagID := range tagIDs {
		_ = s.db.Queries.CreateCardTag(ctx, sqlcgen.CreateCardTagParams{
			CardID: cardID,
			TagID:  tagID,
		})
	}

	return cardID, nil
}

// UpdateCard updates an existing card
func (s *CardService) UpdateCard(ctx context.Context, cardID, title, description, assigneeID string, tagIDs []string) error {
	var descSQL sql.NullString
	if description != "" {
		descSQL = sql.NullString{String: description, Valid: true}
	}

	var assigneeSQL sql.NullString
	if assigneeID != "" {
		assigneeSQL = sql.NullString{String: assigneeID, Valid: true}
	}

	err := s.db.Queries.UpdateCard(ctx, sqlcgen.UpdateCardParams{
		Title:       title,
		Description: descSQL,
		AssigneeID:  assigneeSQL,
		ID:          cardID,
	})
	if err != nil {
		return err
	}

	err = s.db.Queries.DeleteCardTags(ctx, cardID)
	if err != nil {
		return err
	}

	for _, tagID := range tagIDs {
		_ = s.db.Queries.CreateCardTag(ctx, sqlcgen.CreateCardTagParams{
			CardID: cardID,
			TagID:  tagID,
		})
	}

	return nil
}

// DeleteCard deletes a card
func (s *CardService) DeleteCard(ctx context.Context, cardID string) error {
	return s.db.Queries.DeleteCard(ctx, cardID)
}

// CreateComment adds a comment to a card
func (s *CardService) CreateComment(ctx context.Context, cardID, userID, text string) (string, error) {
	commentID := uuid.New().String()
	now := time.Now()

	err := s.db.Queries.CreateComment(ctx, sqlcgen.CreateCommentParams{
		ID:        commentID,
		CardID:    cardID,
		UserID:    userID,
		Text:      text,
		CreatedAt: now.Unix(),
	})
	if err != nil {
		return "", err
	}

	return commentID, nil
}

// UpdateCardList moves a card to a different list
func (s *CardService) UpdateCardList(ctx context.Context, cardID, newListID string) error {
	list, err := s.db.Queries.GetListByListId(ctx, newListID)
	if err != nil {
		return err
	}
	if list.Title == "Done" {
		s.db.Queries.UpdateCardCompleted(ctx, sqlcgen.UpdateCardCompletedParams{
			Completed: sql.NullInt64{Valid: true, Int64: 1},
			ID:        cardID,
		})
	} else {
		s.db.Queries.UpdateCardCompleted(ctx, sqlcgen.UpdateCardCompletedParams{
			Completed: sql.NullInt64{Valid: true, Int64: 0},
			ID:        cardID,
		})
	}
	return s.db.Queries.UpdateCardList(ctx, sqlcgen.UpdateCardListParams{
		ListID: newListID,
		ID:     cardID,
	})
}

// UpdateCardPositions updates the position of multiple cards
func (s *CardService) UpdateCardPositions(ctx context.Context, cardIDs []string) error {
	for i, cardID := range cardIDs {
		err := s.db.Queries.UpdateCardPosition(ctx, sqlcgen.UpdateCardPositionParams{
			Position: int64(i),
			ID:       cardID,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

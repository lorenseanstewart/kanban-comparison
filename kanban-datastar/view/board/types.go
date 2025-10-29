package board

import "kanban-datastar/pkg/database/sqlcgen"

// BoardDetails represents the full board with nested lists and cards
type BoardDetails struct {
	ID          string
	Title       string
	Description string
	Lists       []ListWithCards
}

// ListWithCards represents a list with its cards
type ListWithCards struct {
	ID       string
	Title    string
	Position int64
	Cards    []CardWithDetails
}

// CardWithDetails represents a card with all its associated data
type CardWithDetails struct {
	ID           string
	Title        string
	Description  string
	AssigneeID   string
	AssigneeName string
	Position     int64
	Completed    bool
	Tags         []TagItem
	Comments     []CommentItem
}

// TagItem represents a tag
type TagItem struct {
	ID    string
	Name  string
	Color string
}

// CommentItem represents a comment with user info
type CommentItem struct {
	ID       string
	Text     string
	UserID   string
	UserName string
}

// BuildBoardDetails constructs the nested board data structure
func BuildBoardDetails(
	boardData sqlcgen.GetBoardRow,
	lists []sqlcgen.GetListsByBoardIdRow,
	cards []sqlcgen.GetCardsByListIdsRow,
	cardTags []sqlcgen.GetTagsByCardIdsRow,
	comments []sqlcgen.Comment,
	users []sqlcgen.User,
	tags []sqlcgen.GetTagsRow,
) BoardDetails {
	// Create user lookup map
	userMap := make(map[string]string)
	for _, user := range users {
		userMap[user.ID] = user.Name
	}

	// Create tag lookup map
	tagMap := make(map[string]sqlcgen.GetTagsRow)
	for _, tag := range tags {
		tagMap[tag.ID] = tag
	}

	// Group card tags by card ID
	cardTagsMap := make(map[string][]sqlcgen.GetTagsByCardIdsRow)
	for _, ct := range cardTags {
		cardTagsMap[ct.CardID] = append(cardTagsMap[ct.CardID], ct)
	}

	// Group comments by card ID
	commentsMap := make(map[string][]sqlcgen.Comment)
	for _, comment := range comments {
		commentsMap[comment.CardID] = append(commentsMap[comment.CardID], comment)
	}

	// Group cards by list ID
	cardsMap := make(map[string][]sqlcgen.GetCardsByListIdsRow)
	for _, card := range cards {
		cardsMap[card.ListID] = append(cardsMap[card.ListID], card)
	}

	// Build lists with cards
	listsWithCards := make([]ListWithCards, len(lists))
	for i, list := range lists {
		listCards := cardsMap[list.ID]
		cardsWithDetails := make([]CardWithDetails, len(listCards))

		for j, card := range listCards {
			// Build tags for this card
			cardTagsList := []TagItem{}
			for _, ct := range cardTagsMap[card.ID] {
				if tag, ok := tagMap[ct.TagID]; ok {
					cardTagsList = append(cardTagsList, TagItem{
						ID:    tag.ID,
						Name:  tag.Name,
						Color: tag.Color,
					})
				}
			}

			// Build comments for this card
			cardCommentsList := []CommentItem{}
			for _, comment := range commentsMap[card.ID] {
				cardCommentsList = append(cardCommentsList, CommentItem{
					ID:       comment.ID,
					Text:     comment.Text,
					UserID:   comment.UserID,
					UserName: userMap[comment.UserID],
				})
			}

			// Get assignee name
			assigneeName := ""
			if card.AssigneeID.Valid {
				assigneeName = userMap[card.AssigneeID.String]
			}

			cardsWithDetails[j] = CardWithDetails{
				ID:           card.ID,
				Title:        card.Title,
				Description:  card.Description.String,
				AssigneeID:   card.AssigneeID.String,
				AssigneeName: assigneeName,
				Position:     card.Position,
				Completed:    true,
				Tags:         cardTagsList,
				Comments:     cardCommentsList,
			}
		}

		listsWithCards[i] = ListWithCards{
			ID:       list.ID,
			Title:    list.Title,
			Position: list.Position,
			Cards:    cardsWithDetails,
		}
	}

	description := ""
	if boardData.Description.Valid {
		description = boardData.Description.String
	}

	return BoardDetails{
		ID:          boardData.ID,
		Title:       boardData.Title,
		Description: description,
		Lists:       listsWithCards,
	}
}

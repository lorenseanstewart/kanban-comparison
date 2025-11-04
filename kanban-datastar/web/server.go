package web

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"kanban/sql/zz"
	"log"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"kanban"

	"github.com/a-h/templ"
	"github.com/benbjohnson/hashfs"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/starfederation/datastar-go/datastar"
	"zombiezen.com/go/sqlite"
)

//go:embed static/*
var StaticFS embed.FS

var (
	StaticSys = hashfs.NewFS(StaticFS)
)

func StaticPath(format string, args ...any) string {
	return "/" + StaticSys.HashName(fmt.Sprintf("static/"+format, args...))
}

func setupRoutes(db *toolbelt.Database) chi.Router {
	r := chi.NewRouter()

	// Static and utility routes
	r.Handle("/static/*", hashfs.FileServer(StaticSys))
	r.Get("/hotreload", hotReload())
	r.Get("/", home(db))

	// Board routes
	r.Post("/board", createBoard(db))
	r.Get("/board/{boardID}", viewBoard(db))

	// Card routes
	r.Post("/board/{boardID}/card", createCard(db))
	r.Put("/board/{boardID}/card/{cardID}", updateCard(db))
	r.Delete("/board/{boardID}/card/{cardID}", deleteCard(db))
	r.Post("/board/{boardID}/card/{cardID}/comment", addComment(db))
	r.Put("/board/{boardID}/list/move", moveCard(db))

	return r
}

// Route Handlers

func hotReload() http.HandlerFunc {
	var hotReloadOnlyOnce sync.Once
	return func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		hotReloadOnlyOnce.Do(func() {
			sse.ExecuteScript("window.location.reload()")
		})
		<-r.Context().Done()
	}
}

func home(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		renderAllBoards(w, r, db)
	}
}

func createBoard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		title := strings.TrimSpace(r.FormValue("title"))
		description := strings.TrimSpace(r.FormValue("description"))
		boardID := uuid.NewString()
		now := time.Now().Unix()

		if err := db.WriteTX(r.Context(), func(tx *sqlite.Conn) error {
			if err := zz.OnceCreateBoard(tx, zz.CreateBoardParams{
				Id:          boardID,
				Title:       title,
				Description: description,
				CreatedAt:   now,
			}); err != nil {
				return fmt.Errorf("failed to create board: %w", err)
			}

			listTitles := []string{"Todo", "In-Progress", "QA", "Done"}
			listStmt := zz.CreateList(tx)
			for i, listTitle := range listTitles {
				listID := uuid.NewString()
				if err := listStmt.Run(zz.CreateListParams{
					Id:        listID,
					BoardId:   boardID,
					Title:     listTitle,
					Position:  int64(i + 1),
					CreatedAt: now,
				}); err != nil {
					return fmt.Errorf("failed to create default list %q: %w", listTitle, err)
				}
			}

			return nil
		}); err != nil {
			http.Error(w, "Failed to create board", http.StatusInternalServerError)
			return
		}

		renderAllBoards(w, r, db)
	}
}

func viewBoard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		boardID := chi.URLParam(r, "boardID")
		board, users, tags, err := boardDetails(r.Context(), db, boardID)
		if err != nil {
			http.Error(w, "Failed to load board", http.StatusInternalServerError)
			return
		}
		RenderPage(w, r, BoardPage(board, users, tags))
	}
}

func createCard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		assigneeID := strings.TrimSpace(r.FormValue("assigneeId"))
		var assigneeIDPtr *string
		if assigneeID != "" {
			assigneeIDPtr = &assigneeID
		}

		cardID := uuid.NewString()
		now := time.Now().Unix()

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			lists, err := zz.OnceListsByBoardId(tx, boardID)
			if err != nil {
				return fmt.Errorf("failed to load lists: %w", err)
			}
			listID := ""
			for _, l := range lists {
				if l.Title == "Todo" {
					listID = l.Id
					break
				}
			}
			if listID == "" {
				return fmt.Errorf("todo list is required")
			}

			maxPos, err := zz.OnceMaxPositionInList(tx, listID)
			if err != nil {
				return fmt.Errorf("failed to load max position: %w", err)
			}

			if err := zz.OnceCreateCard(tx, zz.CreateCardParams{
				Id:          cardID,
				ListId:      listID,
				Title:       strings.TrimSpace(r.FormValue("title")),
				Description: strings.TrimSpace(r.FormValue("description")),
				AssigneeId:  assigneeIDPtr,
				Position:    maxPos + 1,
				Completed:   false,
				CreatedAt:   now,
			}); err != nil {
				return fmt.Errorf("failed to create card: %w", err)
			}

			createCardTag := zz.CreateCardTag(tx)
			for _, tagID := range r.Form["tagIds"] {
				if err := createCardTag.Run(zz.CreateCardTagParams{
					CardId: cardID,
					TagId:  tagID,
				}); err != nil {
					return fmt.Errorf("failed to create card tag for tag %q: %w", tagID, err)
				}
			}

			return nil
		}); err != nil {
			slog.Error("failed to create card:", "Error", err)
			http.Error(w, "Failed to create card", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func updateCard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")
		cardID := chi.URLParam(r, "cardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			assigneeID := strings.TrimSpace(r.FormValue("assigneeId"))
			var assigneeIDPtr *string
			if assigneeID != "" {
				assigneeIDPtr = &assigneeID
			}

			if err := zz.OnceUpdateCard(tx, zz.UpdateCardParams{
				Id:          cardID,
				Title:       strings.TrimSpace(r.FormValue("title")),
				Description: strings.TrimSpace(r.FormValue("description")),
				AssigneeId:  assigneeIDPtr,
			}); err != nil {
				return fmt.Errorf("failed to update card: %w", err)
			}

			createCardTags := zz.CreateCardTag(tx)
			for _, tagID := range r.Form["tagIds"] {
				if err := createCardTags.Run(zz.CreateCardTagParams{
					CardId: cardID,
					TagId:  tagID,
				}); err != nil {
					return fmt.Errorf("failed to create card tag: %w", err)
				}
			}

			return nil
		}); err != nil {
			http.Error(w, "Failed to update card", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func deleteCard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")
		cardID := chi.URLParam(r, "cardID")

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			if err := zz.OnceDeleteCard(tx, cardID); err != nil {
				return fmt.Errorf("failed to delete card: %w", err)
			}
			return nil
		}); err != nil {
			http.Error(w, "Failed to delete card", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func addComment(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")
		cardID := chi.URLParam(r, "cardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		userID := strings.TrimSpace(r.FormValue("userId"))
		text := strings.TrimSpace(r.FormValue("text"))

		commentID := uuid.NewString()
		now := time.Now().Unix()

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			return zz.OnceCreateComment(tx, zz.CreateCommentParams{
				Id:        commentID,
				CardId:    cardID,
				UserId:    userID,
				Text:      text,
				CreatedAt: now,
			})
		}); err != nil {
			http.Error(w, "Failed to create comment", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func moveCard(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")

		var req struct {
			CardId         string `json:"cardId"`
			SourceListId   string `json:"sourceListId"`
			TargetListId   string `json:"targetListId"`
			InsertPosition int64  `json:"insertPosition"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Failed to parse JSON body", http.StatusBadRequest)
			return
		}

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			// for ListID card used to belong to, update all indexes accordingly
			myCard, err := zz.OnceCardByCardId(tx, req.CardId)
			sourceCardList, err := zz.OnceCardsByListId(tx, req.SourceListId)
			for _, card := range sourceCardList {
				if card.CardId == myCard.Id {
					continue
				}
				// move cards from previous list down 1 index
				if myCard.Position < card.Position {
					zz.OnceUpdateCardPosition(tx, zz.UpdateCardPositionParams{
						Position: card.Position - 1,
						Id:       card.CardId,
					})
				}
			}
			targetCardList, err := zz.OnceCardsByListId(tx, req.TargetListId)
			if err != nil {
				return fmt.Errorf("failed to load list: %w", err)
			}
			for _, card := range targetCardList {
				// move cards from new list up 1 index from calculated insertPosition
				// Insert Position + 1 because cards are [1] indexed in DB
				if req.InsertPosition+1 <= card.Position {
					if int(card.Position) <= len(targetCardList) {
						zz.OnceUpdateCardPosition(tx, zz.UpdateCardPositionParams{
							Position: card.Position + 1,
							Id:       card.CardId,
						})
					}
				}
			}

			list, err := zz.OnceListByListId(tx, req.TargetListId)

			var completed bool
			if list.Title == "Done" {
				completed = true
			}

			return zz.OnceUpdateListAndCardPosition(tx, zz.UpdateListAndCardPositionParams{
				Id:     req.CardId,
				ListId: req.TargetListId,
				// Insert Position + 1 because cards are 1 - indexed in DB
				Position:  req.InsertPosition + 1,
				Completed: completed,
			})
		}); err != nil {
			http.Error(w, "Failed to update card list", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func RenderPage(w http.ResponseWriter, r *http.Request, c templ.Component) error {
	return c.Render(r.Context(), w)
}

// renderAllBoards is the main utility function that provides details for morphing
// the index page "/"
func renderAllBoards(w http.ResponseWriter, r *http.Request, db *toolbelt.Database) error {
	var boards []Board
	if err := db.ReadTX(r.Context(), func(tx *sqlite.Conn) error {
		brds, err := zz.OnceBoards(tx)
		if err != nil {
			return fmt.Errorf("failed to load boards: %w", err)
		}
		boards = make([]Board, len(brds))
		for i, b := range brds {
			board := Board{
				ID:          b.Id,
				Title:       b.Title,
				Description: b.Description,
			}
			boards[i] = board
		}
		return nil
	}); err != nil {
		return fmt.Errorf("load boards: %w", err)
	}

	return RenderPage(w, r, IndexPage(boards...))
}

// boardDetails is the main utility function that provides details for morphing
// individual "/board" pages
func boardDetails(ctx context.Context, db *toolbelt.Database, boardID string) (Board, []User, []Tag, error) {
	board := Board{}
	users := []User{}
	tags := []Tag{}

	if err := db.ReadTX(ctx, func(tx *sqlite.Conn) error {
		uu, err := zz.OnceUsers(tx)
		if err != nil {
			return fmt.Errorf("failed to load users: %w", err)
		}
		for _, u := range uu {
			users = append(users, User{
				Id:   u.Id,
				Name: u.Name,
			})
		}

		tt, err := zz.OnceTags(tx)
		if err != nil {
			return fmt.Errorf("failed to load tags: %w", err)
		}
		for _, t := range tt {
			tags = append(tags, Tag{
				ID:    t.Id,
				Name:  t.Name,
				Color: t.Color,
			})
		}

		b, err := zz.OnceBoard(tx, boardID)
		if err != nil {
			return fmt.Errorf("failed to load board: %w", err)
		}
		board.ID = b.Id
		board.Title = b.Title
		board.Description = b.Description

		ll, err := zz.OnceListsByBoardId(tx, b.Id)
		if err != nil {
			return fmt.Errorf("failed to load lists: %w", err)
		}

		cardsByListId := zz.CardsByListId(tx)
		cardTags := zz.TagsByCardId(tx)
		commentsByCardId := zz.CommentsByCardId(tx)

		for _, l := range ll {
			list := ListWithCards{ID: l.Id, Position: l.Position}

			cards, err := cardsByListId.Run(list.ID)
			if err != nil {
				return fmt.Errorf("failed to load cards for list %q: %w", l.Id, err)
			}

			for _, cc := range cards {
				card := Card{
					ID:          cc.CardId,
					Title:       cc.Title,
					Description: cc.Description,
					Position:    cc.Position,
					Completed:   cc.Completed,
				}
				if cc.AssigneeId != nil {
					card.AssigneeID = *cc.AssigneeId
					card.AssigneeName = *cc.AssigneeName
				}

				tags, err := cardTags.Run(card.ID)
				if err != nil {
					return fmt.Errorf("failed to load tags for card %q: %w", card.ID, err)
				}
				for _, ct := range tags {
					card.Tags = append(card.Tags, Tag{
						ID:    ct.TagId,
						Name:  ct.TagName,
						Color: ct.TagColor,
					})
				}

				comments, err := commentsByCardId.Run(card.ID)
				if err != nil {
					return fmt.Errorf("failed to load comments for card %q: %w", card.ID, err)
				}
				for _, cm := range comments {
					commentItem := Comment{
						ID:       cm.CommentId,
						Text:     cm.CommentText,
						UserID:   cm.UserId,
						UserName: cm.UserName,
					}
					card.Comments = append(card.Comments, commentItem)
				}
				list.Cards = append(list.Cards, card)
			}
			board.Lists = append(board.Lists, list)
		}

		return nil
	}); err != nil {
		return Board{}, nil, nil, fmt.Errorf("failed to load board details: %w", err)
	}

	return board, users, tags, nil
}

func renderBoardDetails(w http.ResponseWriter, r *http.Request, db *toolbelt.Database, boardID string) error {
	bd, users, tags, err := boardDetails(r.Context(), db, boardID)
	if err != nil {
		return fmt.Errorf("load board details: %w", err)
	}
	c := BoardDetails(bd, users, tags)
	if err := datastar.NewSSE(w, r).PatchElementTempl(c); err != nil {
		slog.Error("Error patching BoardCardsSection")
	}
	return nil
}

// RunBlocking sets up routes, starts the server, handles cleanup
func RunBlocking(setupCtx context.Context, db *toolbelt.Database) error {
	router := setupRoutes(db)

	addr := fmt.Sprintf(":%d", kanban.Env.Port)
	srv := http.Server{
		Addr:    addr,
		Handler: router,
	}

	go func() {
		<-setupCtx.Done()
		if err := srv.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down server: %v", err)
		}
	}()

	log.Printf("Starting server on http://localhost%s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Printf("Error starting server: %v", err)
	}
	return nil
}

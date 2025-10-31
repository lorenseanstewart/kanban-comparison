package web

import (
	"context"
	"embed"
	"fmt"
	"kanban/sql/zz"
	"log"
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

func RunBlocking(setupCtx context.Context, db *toolbelt.Database) error {
	router := chi.NewRouter()

	router.Handle("/static/*", hashfs.FileServer(StaticSys))

	var hotReloadOnlyOnce sync.Once
	router.Get("/hotreload", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		hotReloadOnlyOnce.Do(func() {
			sse.ExecuteScript("window.location.reload()")
		})
		<-r.Context().Done()
	})

	router.Get("/", indexHandler(db))
	router.Route("/board", func(boardRouter chi.Router) {
		boardRouter.Post("/", createBoardHandler(db))
		boardRouter.Route("/{boardID}", func(boardIDRouter chi.Router) {
			boardIDRouter.Get("/", viewBoardHandler(db))
			boardIDRouter.Route("/card", func(cardRouter chi.Router) {
				cardRouter.Post("/", createCardHandler(db))
				cardRouter.Route("/{cardID}", func(cardIDRouter chi.Router) {
					cardIDRouter.Post("/", updateCardHandler(db))
					cardIDRouter.Delete("/", deleteCardHandler(db))
					cardIDRouter.Post("/comment", createCommentHandler(db))
					cardIDRouter.Put("/list", updateCardListHandler(db))
				})
			})
			boardIDRouter.Put("/list/{listID}/positions", updateCardPositionsHandler(db))
		})
	})

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

func RenderPage(w http.ResponseWriter, r *http.Request, c templ.Component) {
	c.Render(r.Context(), w)
}

func indexHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
			http.Error(w, "Failed to load boards", http.StatusInternalServerError)
			return
		}

		RenderPage(w, r, IndexPage(boards...))
	}
}

func createBoardHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		title := strings.TrimSpace(r.FormValue("title"))
		description := strings.TrimSpace(r.FormValue("description"))
		boardID := uuid.NewString()
		now := time.Now().UnixMilli()

		if err := db.WriteTX(r.Context(), func(tx *sqlite.Conn) error {
			if err := zz.OnceCreateBoard(tx, zz.CreateBoardParams{
				Id:          boardID,
				Title:       title,
				Description: description,
				CreatedAt:   now,
			}); err != nil {
				return fmt.Errorf("failed to create board: %w", err)
			}

			listTitles := []string{"To Do", "In Progress", "QA", "Done"}
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
	}
}

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
			list := ListWithCards{ID: l.Id}

			c, err := cardsByListId.Run(list.ID)
			if err != nil {
				return fmt.Errorf("failed to load cards for list %q: %w", l.Id, err)
			}

			card := Card{
				ID:          c.CardId,
				Title:       c.Title,
				Description: c.Description,
				Position:    c.Position,
				Completed:   c.Completed,
			}
			if c.AssigneeId != nil {
				card.AssigneeID = *c.AssigneeId
				card.AssigneeName = c.AssigneeName
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

		return nil
	}); err != nil {
		return Board{}, nil, nil, fmt.Errorf("failed to load board details: %w", err)
	}

	return board, users, tags, nil
}

func renderBoardDetails(w http.ResponseWriter, r *http.Request, db *toolbelt.Database, boardID string) error {
	bd, users, _, err := boardDetails(r.Context(), db, boardID)
	if err != nil {
		return fmt.Errorf("load board details: %w", err)
	}
	c := BoardCardsSection(bd, users)
	datastar.NewSSE(w, r).PatchElementTempl(c)
	return nil
}

func viewBoardHandler(db *toolbelt.Database) http.HandlerFunc {
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

func createCardHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		boardID := chi.URLParam(r, "boardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		assigneeID := strings.TrimSpace(r.FormValue("assignee_id"))
		var assigneeIDPtr *string
		if assigneeID != "" {
			assigneeIDPtr = &assigneeID
		}

		cardID := uuid.NewString()
		now := time.Now().UnixMilli()

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

			createCareTag := zz.CreateCardTag(tx)

			for _, tagID := range r.Form["tagIds"] {
				if err := createCareTag.Run(zz.CreateCardTagParams{
					CardId: cardID,
					TagId:  tagID,
				}); err != nil {
					return fmt.Errorf("failed to create card tag for tag %q: %w", tagID, err)
				}
			}

			return nil
		}); err != nil {
			http.Error(w, "Failed to create card", http.StatusInternalServerError)
			return
		}

		renderBoardDetails(w, r, db, boardID)
	}
}

func updateCardHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		cardID := chi.URLParam(r, "cardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			assigneeID := strings.TrimSpace(r.FormValue("assignee_id"))
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

		renderBoardDetails(w, r, db, chi.URLParam(r, "boardID"))
	}
}

func deleteCardHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
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

		renderBoardDetails(w, r, db, chi.URLParam(r, "boardID"))
	}
}

func createCommentHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		cardID := chi.URLParam(r, "cardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		userID := strings.TrimSpace(r.FormValue("userId"))
		text := strings.TrimSpace(r.FormValue("text"))

		commentID := uuid.NewString()
		now := time.Now().UnixMilli()

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

		boardID := chi.URLParam(r, "boardID")
		renderBoardDetails(w, r, db, boardID)
	}
}

func updateCardListHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		cardID := chi.URLParam(r, "cardID")

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		newListID := strings.TrimSpace(r.FormValue("listId"))

		if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
			list, err := zz.OnceListByListId(tx, newListID)
			if err != nil {
				return fmt.Errorf("failed to load list: %w", err)
			}

			var completed bool
			if list.Title == "Done" {
				completed = true
			}

			return zz.OnceUpdateCardCompleted(tx, zz.UpdateCardCompletedParams{
				Id:        cardID,
				Completed: completed,
			})
		}); err != nil {
			http.Error(w, "Failed to update card list", http.StatusInternalServerError)
			return
		}

		boardID := chi.URLParam(r, "boardID")
		renderBoardDetails(w, r, db, boardID)
	}
}

func updateCardPositionsHandler(db *toolbelt.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		cardIDs := r.Form["cardIds"]

		if err := db.WriteTX(r.Context(), func(tx *sqlite.Conn) error {
			updateCardPosition := zz.UpdateCardPosition(tx)
			for i, cardID := range cardIDs {
				if err := updateCardPosition.Run(zz.UpdateCardPositionParams{
					Id:       cardID,
					Position: int64(i),
				}); err != nil {
					return fmt.Errorf("failed to update card position for card %q: %w", cardID, err)
				}
			}
			return nil
		}); err != nil {
			http.Error(w, "Failed to update card positions", http.StatusInternalServerError)
			return
		}

		boardID := chi.URLParam(r, "boardID")
		renderBoardDetails(w, r, db, boardID)
	}
}

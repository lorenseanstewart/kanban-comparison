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

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		renderAllBoards(w, r, db)
	})

	router.Route("/board", func(boardRouter chi.Router) {
		boardRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
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
		})

		boardRouter.Route("/{boardID}", func(boardIDRouter chi.Router) {
			boardIDRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				boardID := chi.URLParam(r, "boardID")
				board, users, tags, err := boardDetails(r.Context(), db, boardID)
				if err != nil {
					http.Error(w, "Failed to load board", http.StatusInternalServerError)
					return
				}
				RenderPage(w, r, BoardPage(board, users, tags))
			})

			boardIDRouter.Route("/card", func(cardRouter chi.Router) {
				cardRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
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
				})

				cardRouter.Route("/{cardID}", func(cardIDRouter chi.Router) {
					cardIDRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
						ctx := r.Context()
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

						renderBoardDetails(w, r, db, chi.URLParam(r, "boardID"))
					})

					cardIDRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
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
					})

					cardIDRouter.Post("/comment", func(w http.ResponseWriter, r *http.Request) {
						ctx := r.Context()
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

						boardID := chi.URLParam(r, "boardID")
						renderBoardDetails(w, r, db, boardID)
					})

					cardIDRouter.Put("/list", func(w http.ResponseWriter, r *http.Request) {
						ctx := r.Context()
						cardID := chi.URLParam(r, "cardID")

						// Parse JSON body
						var requestData struct {
							TargetListID   string `json:"targetListId"`
							InsertPosition int64  `json:"insertPosition"`
						}

						if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
							http.Error(w, "Failed to parse JSON body", http.StatusBadRequest)
							return
						}

						if err := db.WriteTX(ctx, func(tx *sqlite.Conn) error {
							list, err := zz.OnceListByListId(tx, requestData.TargetListID)
							if err != nil {
								return fmt.Errorf("failed to load list: %w", err)
							}

							var completed bool
							if list.Title == "Done" {
								completed = true
							}

							// Use the parsed values
							return zz.OnceUpdateListAndCardPosition(tx, zz.UpdateListAndCardPositionParams{
								Id:        cardID,
								ListId:    requestData.TargetListID,
								Position:  requestData.InsertPosition,
								Completed: completed,
							})
						}); err != nil {
							http.Error(w, "Failed to update card list", http.StatusInternalServerError)
							return
						}

						boardID := chi.URLParam(r, "boardID")
						renderBoardDetails(w, r, db, boardID)
					})

				})
			})
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

func RenderPage(w http.ResponseWriter, r *http.Request, c templ.Component) error {
	return c.Render(r.Context(), w)
}

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

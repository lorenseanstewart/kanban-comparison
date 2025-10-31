package web

// type WebHandler struct {
// 	l            *slog.Logger
// 	db           *database.DB
// 	boardService *services.BoardService
// 	cardService  *services.CardService
// }

// func NewWebHandler(logger *slog.Logger, db *database.DB) *WebHandler {
// 	return &WebHandler{
// 		l:            logger,
// 		db:           db,
// 		boardService: services.NewBoardService(db),
// 		cardService:  services.NewCardService(db),
// 	}
// }

// func (h *WebHandler) SetupRoutes(r chi.Router) {
// 	r.Get("/", h.Index)
// 	r.Get("/board/{boardID}", h.Board)
// 	r.Post("/board", h.AddBoard)
// 	r.Post("/board/{boardID}/card", h.AddCard)
// 	r.Post("/board/{boardID}/card/{cardID}", h.UpdateCard)
// 	r.Delete("/board/{boardID}/card/{cardID}", h.DeleteCard)
// 	r.Post("/board/{boardID}/card/{cardID}/comment", h.AddComment)
// 	r.Put("/board/{boardID}/card/{cardID}/list", h.UpdateCardList)
// 	r.Put("/board/{boardID}/list/{listID}/positions", h.UpdateCardPositions)
// }

// func (h *WebHandler) Index(w http.ResponseWriter, r *http.Request) {
// 	boards, err := h.boardService.GetAllBoards(r.Context())
// 	if err != nil {
// 		h.l.Error("Failed to get boards", "error", err)
// 		http.Error(w, "Database error", http.StatusInternalServerError)
// 		return
// 	}

// 	response := NewPageResponse(view.Index(boards), "Kanban Board")
// 	h.RenderPage(response, w, r)
// }

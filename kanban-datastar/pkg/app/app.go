package app

import (
	"fmt"
	"kanban-datastar/pkg/config"
	"kanban-datastar/pkg/database"
	"kanban-datastar/pkg/handlers"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type App struct {
	Settings *config.Settings
	Logger   *slog.Logger
	Router   *chi.Mux
	DB       *database.DB
}

func New() *App {
	return &App{
		Settings: config.LoadSettings(),
	}
}

func (a *App) Initialize() error {
	a.Logger = config.NewColorLog(a.Settings.LogLevel)
	slog.SetDefault(a.Logger)

	// Initialize database with goose migrations
	db, err := database.New("./sqlite.db", a.Logger)
	if err != nil {
		return fmt.Errorf("initialize database: %w", err)
	}

	a.DB = db

	webHandler := handlers.NewWebHandler(a.Logger, a.DB)
	a.Router = chi.NewRouter()
	webHandler.SetupRoutes(a.Router)
	config.SetupFileServer(a.Logger, a.Router)

	return nil
}

func (a *App) Run() error {
	a.Logger.Info("Starting server", "port", a.Settings.Port)

	defer func() {
		a.Logger.Info("Shutting down gracefully...")

		// Close database
		if a.DB != nil {
			a.DB.Close()
			a.Logger.Info("Database closed")
		}
	}()

	port := fmt.Sprintf(":%d", a.Settings.Port)
	return http.ListenAndServe(port, a.Router)
}

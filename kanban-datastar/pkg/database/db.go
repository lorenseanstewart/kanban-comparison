package database

import (
	"database/sql"
	"embed"
	"fmt"
	"kanban-datastar/pkg/database/sqlcgen"
	"log/slog"

	"github.com/pressly/goose/v3"
	_ "modernc.org/sqlite"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

type DB struct {
	*sql.DB
	Queries *sqlcgen.Queries
	Logger  *slog.Logger
}

// New creates a new database connection and runs migrations
func New(dbPath string, logger *slog.Logger) (*DB, error) {
	sqlDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	db := &DB{
		DB:      sqlDB,
		Queries: sqlcgen.New(sqlDB),
		Logger:  logger,
	}

	// Run migrations with goose
	if err := db.runMigrations(); err != nil {
		return nil, fmt.Errorf("run migrations: %w", err)
	}

	logger.Info("Database connected", "path", dbPath)
	return db, nil
}

// runMigrations applies all pending migrations
func (db *DB) runMigrations() error {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return fmt.Errorf("set goose dialect: %w", err)
	}

	if err := goose.Up(db.DB, "migrations"); err != nil {
		return fmt.Errorf("goose up: %w", err)
	}

	db.Logger.Info("Migrations completed successfully")
	return nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}

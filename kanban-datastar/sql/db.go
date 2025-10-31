package sql

import (
	"context"
	"embed"
	"fmt"
	"log"
	"path/filepath"

	"github.com/delaneyj/toolbelt"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// NewDatabase returns a toolbelt database that has run all embedded migrations.
func NewDatabase(ctx context.Context, dbPath string) (*toolbelt.Database, error) {
	migrations, err := toolbelt.MigrationsFromFS(migrationsFS, "migrations")
	if err != nil {
		return nil, fmt.Errorf("load migrations: %w", err)
	}

	dbAbsPath, _ := filepath.Abs(dbPath)
	log.Printf("using database at %s\n", dbAbsPath)

	db, err := toolbelt.NewDatabase(ctx, dbPath, migrations)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	return db, nil
}

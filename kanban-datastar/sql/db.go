package sql

import (
	"context"
	"embed"
	"fmt"
	"path/filepath"

	"github.com/delaneyj/toolbelt"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// NewDatabase returns a toolbelt database that has run all embedded migrations.
func NewDatabase(ctx context.Context, root string) (*toolbelt.Database, error) {
	migrations, err := toolbelt.MigrationsFromFS(migrationsFS, "migrations")
	if err != nil {
		return nil, fmt.Errorf("load migrations: %w", err)
	}

	dbPath := filepath.Join(root, "data", "kanban.db")
	db, err := toolbelt.NewDatabase(ctx, dbPath, migrations)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	return db, nil
}

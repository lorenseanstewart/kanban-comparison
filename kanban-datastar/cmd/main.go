package main

import (
	"context"
	"fmt"
	"kanban"
	"kanban/sql"
	"kanban/web"
	"log"
)

func main() {
	ctx := context.Background()

	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	cfg := kanban.LoadSettings()

	db, err := sql.NewDatabase(ctx, cfg.DBPath)
	if err != nil {
		return fmt.Errorf("initialize database: %w", err)
	}
	defer db.Close()

	if err := web.RunBlocking(ctx, db); err != nil {
		return fmt.Errorf("run web server: %w", err)
	}
	return nil
}

package main

import (
	"context"
	"fmt"
	"kanban/sql"
	"kanban/web"
	"log"
	"os"
)

func main() {
	ctx := context.Background()

	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	wd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("get working directory: %w", err)
	}
	db, err := sql.NewDatabase(ctx, wd)
	if err != nil {
		return fmt.Errorf("initialize database: %w", err)
	}
	defer db.Close()

	if err := web.RunBlocking(ctx, db); err != nil {
		return fmt.Errorf("run web server: %w", err)
	}
	return nil
}

package config

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"
)

// ANSI color codes, bolded
const (
	ColorReset  = "\033[0m"
	ColorBlack  = "\033[1;30m"
	ColorRed    = "\033[1;31m"
	ColorYellow = "\033[1;33m"
	ColorGreen  = "\033[1;32m"
	ColorBlue   = "\033[34m" // WebSocket non bolded
	ColorGray   = "\033[1;90m"
)

// ColorLog is our app's logger
type ColorLog struct {
	level slog.Level
}

// NewColorLog creates a new slog.Logger, this is the app's logger
func NewColorLog(level slog.Level) *slog.Logger {
	return slog.New(&ColorLog{level: level})
}

// Enabled reports whether the handler handles records at the given level.
func (h *ColorLog) Enabled(_ context.Context, level slog.Level) bool {
	return level >= h.level
}

// Handle is a custom implementation of slog.Handle to handle and style the slog.Record
func (h *ColorLog) Handle(_ context.Context, r slog.Record) error {
	var color string
	var levelLabel string

	switch {
	case r.Level >= slog.LevelError:
		color = ColorRed
		levelLabel = "ERROR"
	case r.Level >= slog.LevelWarn:
		color = ColorYellow
		levelLabel = "WARN"
	case r.Level >= slog.LevelInfo:
		color = ColorGreen
		levelLabel = "INFO"
	case r.Level >= slog.LevelDebug:
		color = ColorBlue
		levelLabel = "DEBUG"
	default:
		color = ColorGray
		levelLabel = "OTHER"
	}

	timestamp := r.Time.Format(time.RFC3339)
	msg := r.Message

	// Only color the level label, rest is default terminal color
	fmt.Fprintf(os.Stdout, "[%s] %s%s%s %s",
		timestamp,
		color, levelLabel, ColorReset,
		msg)

	if r.NumAttrs() > 0 {
		r.Attrs(func(a slog.Attr) bool {
			// Attributes also in default color
			fmt.Fprintf(os.Stdout, " %s=%v", a.Key, a.Value)
			return true
		})
	}

	fmt.Fprintf(os.Stdout, "\n")
	return nil
}

// WithAttrs to satisfy slog's interface, even though it's doing nothing
func (h *ColorLog) WithAttrs(attrs []slog.Attr) slog.Handler {
	return h
}

// WithGroup to satisfy slog's interface, even though it's doing nothing
func (h *ColorLog) WithGroup(name string) slog.Handler {
	return h
}

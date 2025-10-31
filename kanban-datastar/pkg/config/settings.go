package config

import (
	"fmt"
	"log/slog"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Settings struct {
	Port     int
	LogLevel slog.Level
	Env      string
}

type envSettings struct {
	Port     int    `envconfig:"PORT" default:"3011"`
	Env      string `envconfig:"ENVIRONMENT" default:"development"`
	LogLevel string `envconfig:"LOG_LEVEL" default:"INFO"`
}

func LoadSettings() *Settings {
	if err := godotenv.Load(); err != nil {
		slog.Warn(".env file not found, using default environment variables instead")
	}

	var envCfg envSettings
	if err := envconfig.Process("", &envCfg); err != nil {
		slog.Error("Failed to load environment configuration", "error", err)
		os.Exit(1)
	}

	config := &Settings{
		LogLevel: parseLogLevel(envCfg.LogLevel),
		Port:     envCfg.Port,
		Env:      envCfg.Env,
	}

	if err := config.validate(); err != nil {
		slog.Error("Configuration validation failed", "error", err)
		os.Exit(1)
	}

	config.logConfig()
	return config
}

// Validate checks for essential .env variables
func (c *Settings) validate() error {
	if c.Port < 1 || c.Port > 65535 {
		return fmt.Errorf("invalid port: %d", c.Port)
	}
	return nil
}

func (c *Settings) logConfig() {
	fmt.Println("------------------------------------------------------------------")
	slog.Info("Configuration loaded")
	slog.Info("PORT", "port", c.Port)
	slog.Info("LOG_LEVEL", "level", c.LogLevel)
	slog.Info("ENVIRONMENT", "env", c.Env)
	fmt.Println("------------------------------------------------------------------")
}

func parseLogLevel(level string) slog.Level {
	switch strings.ToUpper(level) {
	case "DEBUG":
		return slog.LevelDebug
	case "INFO":
		return slog.LevelInfo
	case "WARN":
		return slog.LevelWarn
	case "ERROR":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

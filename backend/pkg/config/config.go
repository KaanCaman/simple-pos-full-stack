package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort     string
	DBPath      string
	Environment string
	JWTSecret   string
}

// LoadConfig loads configuration from environment variables
// Reads from .env file if present, otherwise uses defaults or OS envs
func LoadConfig() *Config {
	// Try loading .env file, ignore error if not found (e.g. in prod or if passed via env vars)
	_ = godotenv.Load()

	return &Config{
		AppPort:     getEnv("APP_PORT", "3000"),
		DBPath:      getEnv("DB_PATH", "tostcu.db"),
		Environment: getEnv("APP_ENV", "development"),
		JWTSecret:   getEnv("JWT_SECRET", "default-secret-do-not-use-in-prod"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

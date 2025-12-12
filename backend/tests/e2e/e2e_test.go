package e2e

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"testing"
	"time"

	"simple-pos/internal/server"
	"simple-pos/pkg/config"

	"github.com/joho/godotenv"
)

var baseURL = "http://localhost:8378"

// TestMain controls the main entry point for E2E tests
func TestMain(m *testing.M) {
	// 1. Load Environment (Override for Testing)
	// Try loading .env.test or similar if exists, otherwise load .env
	_ = godotenv.Load("../../.env") // Load root .env if available

	// Override specific config for testing
	os.Setenv("APP_PORT", "8378")
	os.Setenv("DB_PATH", "tostcu_test.db")
	os.Setenv("APP_ENV", "test")

	// 2. Load Config
	cfg := config.LoadConfig()

	// Update global baseURL dynamically if needed, though hardcoded matches port logic
	baseURL = "http://localhost:" + cfg.AppPort

	// 3. Initialize Server
	app := server.New(cfg)

	// 4. Start Server in Goroutine
	go func() {
		if err := app.Listen(":" + cfg.AppPort); err != nil {
			log.Printf("Test server error: %v", err)
		}
	}()

	// Wait for server to start
	// Simple wait, or retry connection
	time.Sleep(1 * time.Second)
	log.Printf("E2E Test Server started on %s", baseURL)

	// 5. Run Tests
	exitCode := m.Run()

	// 6. Cleanup (Optional: remove test db)
	cleanupDBFiles(cfg.DBPath)

	os.Exit(exitCode)
}

func TestHealth(t *testing.T) {
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func cleanupDBFiles(dbName string) {
	os.Remove(dbName)
	os.Remove(fmt.Sprint(dbName, "-wal"))
	os.Remove(fmt.Sprint(dbName, "-shm"))
}

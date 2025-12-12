package main

import (
	"log"

	"simple-pos/internal/server"
	"simple-pos/pkg/config"
	"simple-pos/pkg/utils"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// Initialize JWT Utilities
	utils.InitJWT(cfg.JWTSecret)

	// 2. Initialize Server
	app := server.New(cfg)

	// 3. Start Server
	log.Printf("Server starting on port %s...", cfg.AppPort)
	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}

package server

import (
	"log"

	"simple-pos/internal/middleware"
	"simple-pos/internal/platform/database"
	"simple-pos/internal/routes"
	"simple-pos/pkg/config"
	"simple-pos/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// New initializes the application server with the given configuration
// Verilen yapılandırma ile uygulama sunucusunu başlatır
func New(cfg *config.Config) *fiber.App {
	// 1. Initialize Logger
	logger.InitLogger(cfg)

	// 2. Connect Database
	database.Connect(cfg.DBPath)

	// 3. Migrate Database
	database.Migrate()

	// 4. Setup Fiber
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
	})

	// Middleware
	app.Use(middleware.RequestLoggerMiddleware()) // Log every request
	app.Use(middleware.RecoveryMiddleware())      // Recover from panics with Zap
	app.Use(cors.New())

	// 5. Register Routes (handles all dependency wiring)
	routes.RegisterRoutes(app, database.DB, cfg)

	log.Println("Server initialized in " + cfg.Environment + " mode")

	return app
}

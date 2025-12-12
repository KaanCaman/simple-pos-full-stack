package main

import (
	"log"

	"simple-pos/internal/handlers"
	"simple-pos/internal/middleware"
	"simple-pos/internal/platform/database"
	"simple-pos/internal/repositories/gorm_repo"
	"simple-pos/internal/services"
	"simple-pos/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// 1. Initialize Logger
	logger.InitLogger()

	// 2. Connect Database
	database.Connect()

	// 3. Migrate Database
	database.Migrate()

	// 4. Initialize Repositories
	orderRepo := gorm_repo.NewOrderRepository(database.DB)
	transactionRepo := gorm_repo.NewTransactionRepository(database.DB)
	workPeriodRepo := gorm_repo.NewWorkPeriodRepository(database.DB)

	// 5. Initialize Services
	orderService := services.NewOrderService(orderRepo, transactionRepo, workPeriodRepo)
	analyticsService := services.NewAnalyticsService(database.DB, transactionRepo)

	// 6. Initialize Handlers
	orderHandler := handlers.NewOrderHandler(orderService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// 7. Setup Fiber
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
	})

	// Middleware
	app.Use(cors.New())
	app.Use(middleware.RecoverMiddleware())

	// Routes
	api := app.Group("/api")
	v1 := api.Group("/v1")

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Order Routes
	orders := v1.Group("/orders")
	orders.Post("/", orderHandler.Create)
	orders.Post("/:id/close", orderHandler.Close)

	// Analytics Routes
	analytics := v1.Group("/analytics")
	analytics.Get("/daily", analyticsHandler.GetDailyReport)

	logger.Info("Server starting on port 3000...")
	log.Fatal(app.Listen(":3000"))
}

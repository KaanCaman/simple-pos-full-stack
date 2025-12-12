package routes

import (
	"simple-pos/internal/handlers"
	"simple-pos/internal/middleware"
	"simple-pos/internal/repositories/gorm_repo"
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterRoutes initializes all routes and dependencies
// Tüm rotaları ve bağımlılıkları başlatır
func RegisterRoutes(app *fiber.App, db *gorm.DB) {
	// 1. Repositories
	orderRepo := gorm_repo.NewOrderRepository(db)
	transactionRepo := gorm_repo.NewTransactionRepository(db)
	workPeriodRepo := gorm_repo.NewWorkPeriodRepository(db)

	// 2. Services
	orderService := services.NewOrderService(orderRepo, transactionRepo, workPeriodRepo)
	analyticsService := services.NewAnalyticsService(db, transactionRepo)
	managementService := services.NewManagementService(workPeriodRepo, orderRepo, db)

	// 3. Handlers
	orderHandler := handlers.NewOrderHandler(orderService)
	managementHandler := handlers.NewManagementHandler(managementService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// 4. Routes
	api := app.Group("/api")
	v1 := api.Group("/v1")

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Tostcu POS Backend is running!", nil)
	})

	// Management Routes (Rate Limit: 5/min)
	management := v1.Group("/management", middleware.RateLimiter(5, time.Minute))
	management.Post("/start-day", managementHandler.StartDay)
	management.Post("/end-day", managementHandler.EndDay)

	// Order Routes
	orders := v1.Group("/orders")
	orders.Post("/", orderHandler.Create)
	orders.Post("/:id/close", orderHandler.Close)

	// Analytics Routes
	analytics := v1.Group("/analytics")
	analytics.Get("/daily", analyticsHandler.GetDailyReport)
}

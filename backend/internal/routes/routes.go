package routes

import (
	"simple-pos/internal/handlers"
	"simple-pos/internal/middleware"
	"simple-pos/internal/repositories/gorm_repo"
	"simple-pos/internal/services"
	"simple-pos/pkg/config"
	"simple-pos/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// RegisterRoutes initializes all routes and dependencies
// Tüm rotaları ve bağımlılıkları başlatır
func RegisterRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// 1. Repositories
	userRepo := gorm_repo.NewUserRepository(db)
	orderRepo := gorm_repo.NewOrderRepository(db)
	transactionRepo := gorm_repo.NewTransactionRepository(db)
	workPeriodRepo := gorm_repo.NewWorkPeriodRepository(db)

	// 2. Services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	orderService := services.NewOrderService(orderRepo, transactionRepo, workPeriodRepo)
	analyticsService := services.NewAnalyticsService(db, transactionRepo)
	managementService := services.NewManagementService(workPeriodRepo, orderRepo, db)

	// 3. Handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	orderHandler := handlers.NewOrderHandler(orderService)
	managementHandler := handlers.NewManagementHandler(managementService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// 4. Routes

	// Public Routes
	auth := app.Group("/auth")
	auth.Post("/login", authHandler.Login)

	// Protected Routes
	api := app.Group("/api")
	v1 := api.Group("/v1", middleware.Protected())

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Tostcu POS Backend is running!", nil)
	})

	// User Management Routes (Protected + Admin Only)
	users := v1.Group("/users", middleware.RequireRole("admin"))
	users.Post("/", userHandler.Create)

	// Management Routes (Protected + Admin Only)
	management := v1.Group("/management", middleware.RateLimiter(5, time.Minute), middleware.RequireRole("admin"))
	management.Post("/start-day", managementHandler.StartDay)
	management.Post("/end-day", managementHandler.EndDay)

	// Order Routes (Protected)
	orders := v1.Group("/orders")
	orders.Post("/", orderHandler.Create)
	orders.Post("/:id/close", orderHandler.Close)

	// Analytics Routes (Protected)
	analytics := v1.Group("/analytics")
	analytics.Get("/daily", analyticsHandler.GetDailyReport)
}

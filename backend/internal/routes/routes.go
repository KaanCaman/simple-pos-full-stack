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
	// 4. Initialize Repositories
	userRepo := gorm_repo.NewUserRepository(db)
	categoryRepo := gorm_repo.NewCategoryRepository(db)
	productRepo := gorm_repo.NewProductRepository(db)
	transactionRepo := gorm_repo.NewTransactionRepository(db)
	orderRepo := gorm_repo.NewOrderRepository(db)
	workPeriodRepo := gorm_repo.NewWorkPeriodRepository(db)
	tableRepo := gorm_repo.NewTableRepository(db)

	// 5. Initialize Services
	authService := services.NewAuthService(userRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	productService := services.NewProductService(productRepo)
	transactionService := services.NewTransactionService(transactionRepo, workPeriodRepo)
	orderService := services.NewOrderService(orderRepo, transactionRepo, workPeriodRepo, productRepo, tableRepo)
	analyticsService := services.NewAnalyticsService(db, transactionRepo, workPeriodRepo)
	userService := services.NewUserService(userRepo)
	managementService := services.NewManagementService(workPeriodRepo, orderRepo, db)
	tableService := services.NewTableService(tableRepo)

	// 6. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService, workPeriodRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	productHandler := handlers.NewProductHandler(productService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	orderHandler := handlers.NewOrderHandler(orderService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	userHandler := handlers.NewUserHandler(userService)
	managementHandler := handlers.NewManagementHandler(managementService)
	tableHandler := handlers.NewTableHandler(tableService)

	// 7. Route Groups
	api := app.Group("/api/v1") // /api/v1

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Tostcu POS Backend is running!", nil)
	})

	// Public Routes
	app.Post("/auth/login", authHandler.Login)
	api.Get("/categories", categoryHandler.GetAll)
	api.Get("/products", productHandler.GetAll)

	// Protected Routes (Waiter + Admin)
	protected := api.Group("/", middleware.Protected())

	// Auth Persistence
	protected.Get("/auth/me", authHandler.Me)

	// Tables (Read-Only Public/Protected) - Waiters need to see tables.
	protected.Get("/tables", tableHandler.ListTables)

	// Orders
	protected.Post("/orders", orderHandler.Create)
	protected.Post("/orders/:id/close", orderHandler.Close)
	protected.Post("/orders/:id/items", orderHandler.AddItem)
	protected.Put("/orders/:id/items/:itemId", orderHandler.UpdateItem)
	protected.Delete("/orders/:id/items/:itemId", orderHandler.RemoveItem)
	protected.Delete("/orders/:id", orderHandler.Cancel)
	protected.Get("/orders/:id", orderHandler.GetOrder)
	protected.Get("/orders", orderHandler.GetOrders)
	protected.Get("/orders/table/:id", orderHandler.GetOrdersByTable)
	// Admin Routes
	admin := protected.Group("/", middleware.RequireRole("admin"))

	// Expense Management (Admin Only)
	admin.Post("/transactions/expense", transactionHandler.AddExpense)
	admin.Get("/transactions/expense", transactionHandler.ListExpenses)
	admin.Put("/transactions/expense/:id", transactionHandler.UpdateExpense)
	admin.Delete("/transactions/expense/:id", transactionHandler.DeleteExpense)

	// User Management
	admin.Post("/users", userHandler.Create)
	admin.Get("/users", userHandler.GetUsers)
	admin.Get("/users/:id", userHandler.GetUserByID)
	admin.Put("/users/:id", userHandler.UpdateUser)
	admin.Put("/users/:id/pin", userHandler.ChangePin)
	admin.Delete("/users/:id", userHandler.DeleteUser)

	// Menu Management (Admin)
	admin.Post("/categories", categoryHandler.Create)
	admin.Put("/categories/:id", categoryHandler.Update)
	admin.Delete("/categories/:id", categoryHandler.Delete)
	admin.Post("/products", productHandler.Create)
	admin.Put("/products/:id", productHandler.Update)
	admin.Delete("/products/:id", productHandler.Delete)

	// Table Management (Admin)
	admin.Post("/tables", tableHandler.CreateTable)
	admin.Put("/tables/:id", tableHandler.UpdateTable)
	admin.Delete("/tables/:id", tableHandler.DeleteTable)

	// Management Routes (Admin)
	management := admin.Group("/management", middleware.RateLimiter(5, time.Minute))
	management.Post("/start-day", managementHandler.StartDay)
	management.Post("/end-day", managementHandler.EndDay)
	management.Get("/status", managementHandler.GetSystemStatus)

	// Analytics Routes (Admin)
	admin.Get("/analytics/daily", analyticsHandler.GetDailyReport)
	admin.Get("/analytics/history", analyticsHandler.GetReportHistory)
}

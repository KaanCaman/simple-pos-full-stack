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
	categoryRepo := gorm_repo.NewCategoryRepository(db)
	productRepo := gorm_repo.NewProductRepository(db)
	orderRepo := gorm_repo.NewOrderRepository(db)
	transactionRepo := gorm_repo.NewTransactionRepository(db)
	workPeriodRepo := gorm_repo.NewWorkPeriodRepository(db)

	// 2. Services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	productService := services.NewProductService(productRepo)
	transactionService := services.NewTransactionService(transactionRepo)
	orderService := services.NewOrderService(orderRepo, transactionRepo, workPeriodRepo, productRepo)
	analyticsService := services.NewAnalyticsService(db, transactionRepo)
	managementService := services.NewManagementService(workPeriodRepo, orderRepo, db)

	// 3. Handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	productHandler := handlers.NewProductHandler(productService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
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

	// Public Menu Routes (Authenticated users can see menu)
	// Authenticated users (waiters) need to see categories/products
	// Actually requirements said: "GET /api/v1/products (Optional: filter by category_id)"
	// Let's keep them under v1 (Protected) so only logged in users (waiters/admins) can see them.
	// Or should they be public? POS usually requires login. Let's keep them in v1.
	v1.Get("/categories", categoryHandler.GetAll)
	v1.Get("/products", productHandler.GetAll)

	// Admin Only Routes
	admin := v1.Group("/", middleware.RequireRole("admin"))

	// User Management
	admin.Post("/users", userHandler.Create)

	// Menu Management (Admin)
	admin.Post("/categories", categoryHandler.Create)
	admin.Post("/products", productHandler.Create)
	admin.Put("/products/:id", productHandler.Update)

	// Expense Management (Admin)
	admin.Post("/transactions/expense", transactionHandler.AddExpense)
	admin.Get("/transactions/expense", transactionHandler.ListExpenses)
	admin.Put("/transactions/expense/:id", transactionHandler.UpdateExpense)
	admin.Delete("/transactions/expense/:id", transactionHandler.DeleteExpense)

	// Management Routes (Admin)
	management := admin.Group("/management", middleware.RateLimiter(5, time.Minute))
	management.Post("/start-day", managementHandler.StartDay)
	management.Post("/end-day", managementHandler.EndDay)

	// Order Routes (Protected for All Roles)
	orders := v1.Group("/orders")
	orders.Post("/", orderHandler.Create)
	orders.Post("/:id/close", orderHandler.Close)

	// Order Item Modification
	orders.Post("/:id/items", orderHandler.AddItem)
	orders.Put("/:id/items/:itemId", orderHandler.UpdateItem)
	orders.Delete("/:id/items/:itemId", orderHandler.RemoveItem)

	// Analytics Routes (Protected for All Roles? Usually Admin)
	// Let's secure analytics for Admin only as well, or keep it open if waiters need to see daily report.
	// Task didn't specify, but safer to keep analytics secure.
	// Existing code had it under v1 (Protected). Let's leave it there for now.
	analytics := v1.Group("/analytics")
	analytics.Get("/daily", analyticsHandler.GetDailyReport)
}

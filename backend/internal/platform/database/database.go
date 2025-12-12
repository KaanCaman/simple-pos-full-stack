package database

import (
	"log"

	"simple-pos/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes the database connection
// Veritabanı bağlantısını başlatır
func Connect(dbPath string) {
	var err error

	// Open SQLite connection
	// SQLite bağlantısını açar
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	// Error check
	// Hata kontrolü
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Enable WAL Mode
	// WAL modunu etkinleştir (Daha iyi eşzamanlılık performansı için)
	if err := DB.Exec("PRAGMA journal_mode=WAL;").Error; err != nil {
		log.Println("Failed to enable WAL mode:", err)
	}

	log.Println("Database connection established")
}

// Migrate runs auto-migration for models
// Modeller için migration çalıştırır
func Migrate() {
	log.Println("Running migrations...")
	// Auto-migration
	// Otomatik migration
	err := DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.Table{},
		&models.Order{},
		&models.OrderItem{},
		&models.Transaction{},
		&models.DailyReport{},
		&models.ProductSalesStat{},
		&models.WorkPeriod{},
	)
	// Error check
	// Hata kontrolü
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migration completed")
}

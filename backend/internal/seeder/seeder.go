package seeder

import (
	"log"
	"simple-pos/internal/models"
	"simple-pos/pkg/config"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Seed initializes the database with default data if it's empty
func Seed(db *gorm.DB, cfg *config.Config) {
	// 1. Check if Generic User exists
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	// 2. Check if Config is provided
	if cfg.SeedAdminName == "" || cfg.SeedAdminPin == "" {
		log.Println("SEED_ADMIN_NAME or SEED_ADMIN_PIN not set. Skipping admin seed.")
		return
	}

	// 3. Create Admin User
	log.Println("Seeding default admin user...")
	hashedPin, err := bcrypt.GenerateFromPassword([]byte(cfg.SeedAdminPin), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash pin: %v", err)
		return
	}

	admin := models.User{
		Name:     cfg.SeedAdminName,
		PinCode:  string(hashedPin),
		Role:     "admin",
		IsActive: true,
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Printf("Failed to create admin user: %v", err)
		return
	}

	log.Printf("Admin user '%s' created successfully.", admin.Name)

}

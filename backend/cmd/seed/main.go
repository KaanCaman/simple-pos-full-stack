package main

import (
	"log"
	"simple-pos/internal/models"
	"simple-pos/internal/platform/database"
	"simple-pos/pkg/config"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.LoadConfig()
	database.Connect(cfg.DBPath)
	database.Migrate()

	// 1. Check if Generic User exists
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		log.Println("Users already exist. Skipping seed.")
		return
	}

	// 2. Create Admin User
	pin := "1234"
	hashedPin, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	admin := models.User{
		Name:     "Admin User",
		PinCode:  string(hashedPin),
		Role:     "admin",
		IsActive: true,
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatal(err)
	}

	log.Printf("Admin user created! ID: %d, PIN: %s", admin.ID, pin)
}

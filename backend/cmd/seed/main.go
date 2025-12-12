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

	// 3. Seed Categories and Products
	toastCat := models.Category{Name: "Tostlar", SortOrder: 1, IsActive: true}
	drinkCat := models.Category{Name: "İçecekler", SortOrder: 2, IsActive: true}
	database.DB.Create(&toastCat)
	database.DB.Create(&drinkCat)

	database.DB.Create(&models.Product{Name: "Kaşarlı Tost", Price: 10000, CategoryID: toastCat.ID, IsAvailable: true}) // 100 TL
	database.DB.Create(&models.Product{Name: "Sucuklu Tost", Price: 12000, CategoryID: toastCat.ID, IsAvailable: true}) // 120 TL
	database.DB.Create(&models.Product{Name: "Ayran", Price: 2000, CategoryID: drinkCat.ID, IsAvailable: true})         // 20 TL
	database.DB.Create(&models.Product{Name: "Çay", Price: 1000, CategoryID: drinkCat.ID, IsAvailable: true})           // 10 TL

	log.Println("Menu seeded!")
}

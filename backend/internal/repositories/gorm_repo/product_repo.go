package gorm_repo

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"

	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new instance of ProductRepository
// Yeni bir ProductRepository örneği oluşturur
func NewProductRepository(db *gorm.DB) repositories.ProductRepository {
	return &productRepository{db: db}
}

// Create a new product
// Yeni bir ürün oluşturur
func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

// Find all products
// Tüm ürünlerini bulur
func (r *productRepository) FindAll() ([]models.Product, error) {
	var products []models.Product
	if err := r.db.Preload("Category").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

// Find a product by ID
// ID ile bir ürün bulur
func (r *productRepository) FindByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := r.db.Preload("Category").First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

// Update a product
// Ürünü günceller
func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

// Delete a product
// Ürünü siler
func (r *productRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

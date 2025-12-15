package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
)

type ProductService struct {
	repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

// CreateProduct adds a new product
// Yeni bir ürün ekler
func (s *ProductService) CreateProduct(name string, price int64, categoryID uint, description, imageURL string) (*models.Product, error) {
	if price < 0 {
		return nil, errors.New("price cannot be negative")
	}

	product := &models.Product{
		Name:        name,
		Price:       price,
		CategoryID:  categoryID,
		Description: description,
		ImageURL:    imageURL,
		IsAvailable: true,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}
	// Refetch to get Preloaded Category
	return s.repo.FindByID(product.ID)
}

// GetProducts returns all products or filtered by category
// Tüm ürünleri veya kategoriye göre filtrelenmiş şekilde döndürür
func (s *ProductService) GetProducts(categoryID *uint) ([]models.Product, error) {
	if categoryID != nil && *categoryID > 0 {
		return s.repo.FindByCategoryID(*categoryID)
	}
	return s.repo.FindAll()
}

// UpdateProduct updates product details
// Ürün detaylarını günceller
func (s *ProductService) UpdateProduct(id uint, name string, price int64, isAvailable bool, description, imageURL string, categoryID uint) (*models.Product, error) {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if price < 0 {
		return nil, errors.New("price cannot be negative")
	}

	product.Name = name
	product.Price = price
	product.IsAvailable = isAvailable
	product.Description = description
	product.ImageURL = imageURL
	if categoryID > 0 {
		product.CategoryID = categoryID
	}

	if err := s.repo.Update(product); err != nil {
		return nil, err
	}
	return product, nil
}

// DeleteProduct deletes a product
// Bir ürünü siler
func (s *ProductService) DeleteProduct(id uint) error {
	return s.repo.Delete(id)
}

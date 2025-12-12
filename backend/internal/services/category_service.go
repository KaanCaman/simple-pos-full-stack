package services

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
)

type CategoryService struct {
	repo repositories.CategoryRepository
}

func NewCategoryService(repo repositories.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

// CreateCategory creates a new category
// Yeni bir kategori oluşturur
func (s *CategoryService) CreateCategory(name, icon, color string, sortOrder int) (*models.Category, error) {
	category := &models.Category{
		Name:      name,
		Icon:      icon,
		Color:     color,
		SortOrder: sortOrder,
		IsActive:  true,
	}
	if err := s.repo.Create(category); err != nil {
		return nil, err
	}
	return category, nil
}

// GetCategories returns all categories
// Tüm kategorileri döndürür
func (s *CategoryService) GetCategories() ([]models.Category, error) {
	return s.repo.FindAll()
}

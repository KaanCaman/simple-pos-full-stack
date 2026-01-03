package gorm_repo

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"

	"gorm.io/gorm"
)

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) repositories.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Create(category *models.Category) error {
	var existingCategory models.Category
	// Check if category exists (including soft-deleted)
	// Kategori var mı kontrol et (silinmişler dahil)
	err := r.db.Unscoped().Where("name = ?", category.Name).First(&existingCategory).Error

	if err == nil {
		// Category found / Kategori bulundu
		if existingCategory.DeletedAt.Valid {
			// Soft-deleted -> Restore and Update
			// Silinmiş -> Geri yükle ve Güncelle
			existingCategory.DeletedAt = gorm.DeletedAt{} // Restore / Geri yükle
			existingCategory.Icon = category.Icon
			existingCategory.Color = category.Color
			existingCategory.IsActive = true

			if saveErr := r.db.Save(&existingCategory).Error; saveErr != nil {
				return saveErr
			}

			// Return the ID of the restored category
			// Geri yüklenen kategorinin ID'sini döndür
			category.ID = existingCategory.ID
			category.CreatedAt = existingCategory.CreatedAt
			category.UpdatedAt = existingCategory.UpdatedAt
			return nil
		}
		// Exists and active / Var ve aktif
		return errors.New("category with this name already exists")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Database error / Veritabanı hatası
		return err
	}

	// Not found -> Create new
	// Bulunamadı -> Yeni oluştur
	return r.db.Create(category).Error
}

func (r *categoryRepository) FindAll() ([]models.Category, error) {
	var categories []models.Category
	if err := r.db.Order("sort_order asc").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepository) FindByID(id uint) (*models.Category, error) {
	var category models.Category
	if err := r.db.First(&category, id).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.Category{}, id).Error
}

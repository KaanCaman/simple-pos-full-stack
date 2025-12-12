package gorm_repo

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"

	"gorm.io/gorm"
)

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) repositories.TableRepository {
	return &tableRepository{db: db}
}

func (r *tableRepository) Create(table *models.Table) error {
	return r.db.Create(table).Error
}

func (r *tableRepository) FindAll() ([]models.Table, error) {
	var tables []models.Table
	err := r.db.Find(&tables).Error
	return tables, err
}

func (r *tableRepository) FindByID(id uint) (*models.Table, error) {
	var table models.Table
	err := r.db.First(&table, id).Error
	if err != nil {
		return nil, err
	}
	return &table, nil
}

func (r *tableRepository) Update(table *models.Table) error {
	return r.db.Save(table).Error
}

func (r *tableRepository) Delete(id uint) error {
	return r.db.Delete(&models.Table{}, id).Error
}

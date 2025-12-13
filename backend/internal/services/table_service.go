package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
)

type TableService struct {
	repo repositories.TableRepository
}

func NewTableService(repo repositories.TableRepository) *TableService {
	return &TableService{repo: repo}
}

// CreateTable creates a new table unique by name
func (s *TableService) CreateTable(name string) (*models.Table, error) {
	table := &models.Table{
		Name:   name,
		Status: models.TableStatusAvailable,
	}
	if err := s.repo.Create(table); err != nil {
		return nil, err
	}
	return table, nil
}

// ListTables returns all tables
func (s *TableService) ListTables() ([]models.Table, error) {
	return s.repo.FindAll()
}

// UpdateTable updates a table name
func (s *TableService) UpdateTable(id uint, name string) (*models.Table, error) {
	table, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	table.Name = name
	if err := s.repo.Update(table); err != nil {
		return nil, err
	}
	return table, nil
}

// DeleteTable deletes a table if it is not occupied
func (s *TableService) DeleteTable(id uint) error {
	table, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if table.Status != models.TableStatusAvailable {
		// As per requirement: Cannot delete if not available/open order
		return errors.New("cannot delete table: open order or occupied")
	}

	return s.repo.Delete(id)
}

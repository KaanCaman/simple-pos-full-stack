package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"
)

type TransactionService struct {
	repo           repositories.TransactionRepository
	workPeriodRepo repositories.WorkPeriodRepository
}

func NewTransactionService(repo repositories.TransactionRepository, wpRepo repositories.WorkPeriodRepository) *TransactionService {
	return &TransactionService{
		repo:           repo,
		workPeriodRepo: wpRepo,
	}
}

// AddExpense records a manual expense
// Manuel gider kaydeder
func (s *TransactionService) AddExpense(amount int64, description, category, paymentMethod string) (*models.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	// 1. Find Active Work Period
	activePeriod, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return nil, err
	}
	var wpID uint
	if activePeriod != nil {
		wpID = activePeriod.ID
	}

	transaction := &models.Transaction{
		Type:            "EXPENSE",
		Category:        category,
		Amount:          amount,
		Description:     description,
		TransactionDate: time.Now(),
		WorkPeriodID:    wpID,
		PaymentMethod:   paymentMethod,
	}

	if err := s.repo.Create(transaction); err != nil {
		return nil, err
	}

	return transaction, nil
}

// ListExpenses returns expenses within a date range
func (s *TransactionService) ListExpenses(startDate, endDate time.Time) ([]models.Transaction, error) {
	return s.repo.FindAll(startDate, endDate, "EXPENSE")
}

// UpdateExpense updates an existing expense
func (s *TransactionService) UpdateExpense(id uint, amount int64, description string) (*models.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	tx, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if tx.Type != "EXPENSE" {
		return nil, errors.New("only expenses can be updated")
	}

	tx.Amount = amount
	tx.Description = description

	if err := s.repo.Update(tx); err != nil {
		return nil, err
	}

	return tx, nil
}

// DeleteExpense deletes a transaction if it is an expense
func (s *TransactionService) DeleteExpense(id uint) error {
	tx, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if tx.Type != "EXPENSE" {
		return errors.New("only expenses can be deleted")
	}

	return s.repo.Delete(id)
}

package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"
)

type TransactionService struct {
	repo repositories.TransactionRepository
}

func NewTransactionService(repo repositories.TransactionRepository) *TransactionService {
	return &TransactionService{repo: repo}
}

// AddExpense records a manual expense
// Manuel gider kaydeder
func (s *TransactionService) AddExpense(amount int64, description, category string) (*models.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	transaction := &models.Transaction{
		Type:            "EXPENSE",
		Category:        category,
		Amount:          amount,
		Description:     description,
		TransactionDate: time.Now(),
	}

	if err := s.repo.Create(transaction); err != nil {
		return nil, err
	}

	return transaction, nil
}

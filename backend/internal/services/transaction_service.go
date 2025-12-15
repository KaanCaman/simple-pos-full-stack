package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"strconv"
	"strings"
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

// ListExpenses returns expenses for the ACTIVE work period or specific historical period
func (s *TransactionService) ListExpenses(startDate, endDate time.Time, scope string) ([]models.Transaction, error) {
	// 1. Handle "period_ID" scope (Historical Report View)
	if strings.HasPrefix(scope, "period_") {
		idStr := strings.TrimPrefix(scope, "period_")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return nil, errors.New("invalid period id")
		}
		return s.repo.FindAllByWorkPeriodID(uint(id), "EXPENSE")
	}

	// 2. Default: Active Work Period (Expense Management)
	activePeriod, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return nil, err
	}

	if activePeriod == nil {
		// No active period = No visible expenses
		return []models.Transaction{}, nil
	}

	return s.repo.FindAllByWorkPeriodID(activePeriod.ID, "EXPENSE")
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

	// Active Work Period Check
	// Aktif çalışma dönemi kontrolü
	activePeriod, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return nil, err
	}
	if activePeriod == nil || tx.WorkPeriodID != activePeriod.ID {
		return nil, errors.New("can only modify expenses in active work period")
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

	// Active Work Period Check
	// Aktif çalışma dönemi kontrolü
	activePeriod, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return err
	}
	if activePeriod == nil || tx.WorkPeriodID != activePeriod.ID {
		return errors.New("can only modify expenses in active work period")
	}

	return s.repo.Delete(id)
}

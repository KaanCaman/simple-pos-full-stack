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

// ListExpenses returns expenses within a date range or active scope
func (s *TransactionService) ListExpenses(startDate, endDate time.Time, scope string) ([]models.Transaction, error) {
	if scope == "active" {
		activePeriod, err := s.workPeriodRepo.FindActivePeriod()
		if err != nil {
			return nil, err
		}
		if activePeriod != nil {
			return s.repo.FindAllByWorkPeriodID(activePeriod.ID, "EXPENSE")
		}
		return []models.Transaction{}, nil
	}

	// Specific Work Period Scope
	if strings.HasPrefix(scope, "period_") {
		periodIDStr := strings.TrimPrefix(scope, "period_")
		periodID, err := strconv.ParseUint(periodIDStr, 10, 32)
		if err == nil {
			return s.repo.FindAllByWorkPeriodID(uint(periodID), "EXPENSE")
		}
	}

	// Strict WorkPeriod Logic for History (Date-based)
	periods, err := s.workPeriodRepo.GetPeriodsByDate(startDate)
	if err != nil {
		return nil, err
	}

	if len(periods) == 0 {
		return []models.Transaction{}, nil
	}

	var ids []uint
	for _, p := range periods {
		ids = append(ids, p.ID)
	}

	return s.repo.FindAllByWorkPeriodIDs(ids, "EXPENSE")
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

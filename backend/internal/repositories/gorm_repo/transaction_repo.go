package gorm_repo

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"

	"gorm.io/gorm"
)

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) repositories.TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

func (r *transactionRepository) CreateWithTx(tx *gorm.DB, transaction *models.Transaction) error {
	return tx.Create(transaction).Error
}

func (r *transactionRepository) FindDailyTotal(date time.Time, txType string) (int64, error) {
	var total int64

	// Start of day
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	// End of day
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := r.db.Model(&models.Transaction{}).
		Where("type = ? AND created_at >= ? AND created_at < ?", txType, startOfDay, endOfDay).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error

	return total, err
}

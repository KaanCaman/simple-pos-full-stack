package repositories

import (
	"simple-pos/internal/models"
	"time"

	"gorm.io/gorm"
)

// ProductRepository defines the interface for product data access
// Ürün veri erişimi için arayüzü tanımlar
type ProductRepository interface {
	Create(product *models.Product) error
	FindAll() ([]models.Product, error)
	FindByID(id uint) (*models.Product, error)
	Update(product *models.Product) error
	Delete(id uint) error
}

// OrderRepository defines the interface for order data access
// Sipariş veri erişimi için arayüzü tanımlar
type OrderRepository interface {
	Create(order *models.Order) error
	FindByID(id uint) (*models.Order, error)
	Update(order *models.Order) error
	// WithTransaction runs a function within a database transaction
	// Bir veritabanı işlemi içinde bir fonksiyon çalıştırır
	WithTransaction(fn func(tx *gorm.DB) error) error
}

// TransactionRepository defines the interface for transaction data access
// İşlem veri erişimi için arayüzü tanımlar
type TransactionRepository interface {
	Create(transaction *models.Transaction) error
	// CreateWithTx creates a transaction within an existing DB transaction
	// Mevcut bir veritabanı işlemi içinde bir işlem oluşturur
	CreateWithTx(tx *gorm.DB, transaction *models.Transaction) error
	FindDailyTotal(date time.Time, txType string) (int64, error)
}

// WorkPeriodRepository defines the interface for work period data access
// Çalışma dönemi veri erişimi için arayüzü tanımlar
type WorkPeriodRepository interface {
	Create(period *models.WorkPeriod) error
	FindActivePeriod() (*models.WorkPeriod, error)
	Update(period *models.WorkPeriod) error
	FindByID(id uint) (*models.WorkPeriod, error)
}

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
	FindByCategoryID(categoryID uint) ([]models.Product, error)
	Update(product *models.Product) error
	Delete(id uint) error
}

// CategoryRepository defines the interface for category data access
// Kategori veri erişimi için arayüzü tanımlar
type CategoryRepository interface {
	Create(category *models.Category) error
	FindAll() ([]models.Category, error)
	FindByID(id uint) (*models.Category, error)
	Update(category *models.Category) error
	Delete(id uint) error
}

// UserRepository defines the interface for user data access
// Kullanıcı veri erişimi için arayüzü tanımlar
type UserRepository interface {
	Create(user *models.User) error
	FindByID(id uint) (*models.User, error)
	FindByUsername(username string) (*models.User, error)
	FindAll() ([]models.User, error)
	Update(user *models.User) error
	Delete(id uint) error
}

// OrderRepository defines the interface for order data access
// Sipariş veri erişimi için arayüzü tanımlar
type OrderRepository interface {
	Create(order *models.Order) error
	FindByID(id uint) (*models.Order, error)
	FindByTableID(tableID uint, status string) ([]models.Order, error)
	Update(order *models.Order) error
	Delete(id uint) error

	// Item Management
	AddItem(item *models.OrderItem) error
	UpdateItem(item *models.OrderItem) error
	DeleteItem(item *models.OrderItem) error
	FindItem(itemID uint) (*models.OrderItem, error)

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
	FindAll(startDate, endDate time.Time, txType string) ([]models.Transaction, error)
	Update(transaction *models.Transaction) error
	Delete(id uint) error
	FindByID(id uint) (*models.Transaction, error)
}

// WorkPeriodRepository defines the interface for work period data access
// Çalışma dönemi veri erişimi için arayüzü tanımlar
type WorkPeriodRepository interface {
	Create(period *models.WorkPeriod) error
	FindActivePeriod() (*models.WorkPeriod, error)
	Update(period *models.WorkPeriod) error
	FindByID(id uint) (*models.WorkPeriod, error)
}

// TableRepository defines the interface for table data access
// Masa veri erişimi için arayüzü tanımlar
type TableRepository interface {
	Create(table *models.Table) error
	FindAll() ([]models.Table, error)
	FindByID(id uint) (*models.Table, error)
	Update(table *models.Table) error
	Delete(id uint) error
}

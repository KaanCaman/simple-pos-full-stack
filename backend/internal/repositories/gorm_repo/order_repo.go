package gorm_repo

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"

	"gorm.io/gorm"
)

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) repositories.OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *orderRepository) FindAll(startDate, endDate time.Time) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items").Preload("Waiter").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Order("created_at desc").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) FindByID(id uint) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("Items").Preload("Waiter").First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) FindByTableID(tableID uint, status string) ([]models.Order, error) {
	var orders []models.Order
	query := r.db.Preload("Items").Preload("Waiter").Where("table_id = ?", tableID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) FindByWorkPeriod(periodID uint) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items").Preload("Waiter").
		Where("work_period_id = ?", periodID).
		Order("created_at desc").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) FindByWorkPeriodIDs(periodIDs []uint) ([]models.Order, error) {
	var orders []models.Order
	if len(periodIDs) == 0 {
		return []models.Order{}, nil
	}
	if err := r.db.Preload("Items").Preload("Waiter").
		Where("work_period_id IN ?", periodIDs).
		Order("created_at desc").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

// Update an order
// Siparişi günceller
func (r *orderRepository) Update(order *models.Order) error {
	return r.db.Save(order).Error
}

// Delete an order
// Siparişi siler
func (r *orderRepository) Delete(id uint) error {
	return r.db.Delete(&models.Order{}, id).Error
}

// AddItem adds an item to order
// Siparişe ürün ekler
func (r *orderRepository) AddItem(item *models.OrderItem) error {
	return r.db.Create(item).Error
}

// UpdateItem updates an order item
// Sipariş kalemini günceller
func (r *orderRepository) UpdateItem(item *models.OrderItem) error {
	return r.db.Save(item).Error
}

// DeleteItem removes an order item
// Sipariş kalemini siler
func (r *orderRepository) DeleteItem(item *models.OrderItem) error {
	// Unscoped to allow hard delete if preferred, or soft delete.
	// Models have DeletedAt, so this will be soft delete.
	// Hooks (AfterDelete) will run.
	return r.db.Delete(item).Error
}

// FindItem finds an order item
// Sipariş kalemini bulur
func (r *orderRepository) FindItem(itemID uint) (*models.OrderItem, error) {
	var item models.OrderItem
	if err := r.db.First(&item, itemID).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

// WithTransaction runs a function within a database transaction
func (r *orderRepository) WithTransaction(fn func(tx *gorm.DB) error) error {
	return r.db.Transaction(fn)
}

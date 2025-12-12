package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"simple-pos/pkg/logger"
	"time"

	"gorm.io/gorm"
)

type OrderService struct {
	orderRepo       repositories.OrderRepository
	transactionRepo repositories.TransactionRepository
	workPeriodRepo  repositories.WorkPeriodRepository
}

func NewOrderService(orderRepo repositories.OrderRepository, txRepo repositories.TransactionRepository, wpRepo repositories.WorkPeriodRepository) *OrderService {
	return &OrderService{
		orderRepo:       orderRepo,
		transactionRepo: txRepo,
		workPeriodRepo:  wpRepo,
	}
}

// CreateOrder initiates a new order
// Yeni bir sipariş başlatır
func (s *OrderService) CreateOrder(tableID *uint, waiterID uint, orderNumber string) (*models.Order, error) {
	// Check for active work period
	// Aktif çalışma dönemini kontrol et
	period, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return nil, err
	}
	if period == nil {
		return nil, errors.New("shop is closed (no active work period)")
	}

	order := &models.Order{
		TableID:      tableID,
		WaiterID:     &waiterID,
		OrderNumber:  orderNumber,
		Status:       "OPEN",
		WorkPeriodID: period.ID,
	}

	if err := s.orderRepo.Create(order); err != nil {
		logger.Error("Failed to create order", logger.Err(err))
		return nil, err
	}

	return order, nil
}

// CloseOrder completes payment and records revenue logic (ACID)
// Siparişi tamamlar, ödemeyi alır ve geliri kaydeder (ACID)
func (s *OrderService) CloseOrder(orderID uint, paymentMethod string) error {
	// Execute within a transaction
	// İşlem içinde çalıştır
	return s.orderRepo.WithTransaction(func(tx *gorm.DB) error {
		// 1. Fetch Order (Need to fetch using TX ideally, but Repo abstract FindByID usually uses base DB)
		// NOTE: In strict repo patterns, we'd pass TX to FindByID.
		// For now, we will use the TX-aware helpers or rely on optimistic locking if needed.
		// BETTER APPROACH: Since we have *gorm.DB here, we can query directly if allowed, OR
		// we just fetch purely.
		// Actually, to update effectively in TX, we should fetch inside TX or just Save inside TX.
		// Let's Fetch using the main repo (read) then Save using TX.

		var order models.Order
		if err := tx.First(&order, orderID).Error; err != nil {
			return errors.New("order not found")
		}

		// 2. Validate Status
		if order.Status == "COMPLETED" {
			return errors.New("order is already completed")
		}

		// 3. Update Order
		now := time.Now()
		order.Status = "COMPLETED"
		order.PaymentMethod = paymentMethod
		order.CompletedAt = &now

		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// 4. Create Transaction Record
		transaction := &models.Transaction{
			Type:            "INCOME",
			Category:        "Sales",
			PaymentMethod:   paymentMethod,
			Amount:          order.TotalAmount,
			Description:     "Order #" + order.OrderNumber,
			OrderID:         &order.ID,
			WorkPeriodID:    order.WorkPeriodID, // Link transaction to the same period as order
			TransactionDate: now,
		}

		if err := s.transactionRepo.CreateWithTx(tx, transaction); err != nil {
			return err
		}

		logger.Info("Order closed and transaction recorded",
			logger.Int("order_id", int(order.ID)),
			logger.Int("amount", int(order.TotalAmount)),
		)

		return nil
	})
}

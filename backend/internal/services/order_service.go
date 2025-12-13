package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"simple-pos/pkg/logger"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type OrderService struct {
	orderRepo       repositories.OrderRepository
	transactionRepo repositories.TransactionRepository
	workPeriodRepo  repositories.WorkPeriodRepository
	productRepo     repositories.ProductRepository
	tableRepo       repositories.TableRepository
}

func NewOrderService(orderRepo repositories.OrderRepository, txRepo repositories.TransactionRepository, wpRepo repositories.WorkPeriodRepository, prodRepo repositories.ProductRepository, tableRepo repositories.TableRepository) *OrderService {
	return &OrderService{
		orderRepo:       orderRepo,
		transactionRepo: txRepo,
		workPeriodRepo:  wpRepo,
		productRepo:     prodRepo,
		tableRepo:       tableRepo,
	}
}

// AddOrderItem adds an item to an existing OPEN order
// Mevcut AÇIK bir siparişe ürün ekler
func (s *OrderService) AddOrderItem(orderID uint, productID uint, quantity int, note string) (*models.OrderItem, error) {
	// 1. Validate Order
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, err
	}
	if order.Status != "OPEN" && order.Status != "COMPLETED" {
		return nil, errors.New("cannot modify cancelled order")
	}

	// 2. Fetch Product (for Price snapshot)
	product, err := s.productRepo.FindByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}

	// 3. Create Item
	item := &models.OrderItem{
		OrderID:     orderID,
		ProductID:   productID,
		ProductName: product.Name,
		Quantity:    quantity,
		UnitPrice:   product.Price,
		// Subtotal and TotalAmount will be handled by BeforeCreate/AfterSave hooks
	}

	// 4. Save Item
	// This triggers Hooks: BeforeCreate (Snapshots/Subtotal) -> Insert -> AfterSave (Recalculate Order Total)
	if err := s.orderRepo.AddItem(item); err != nil {
		return nil, err
	}

	if order.Status == "COMPLETED" {
		if err := s.syncTransactionAmount(orderID); err != nil {
			logger.Error("Failed to sync transaction amount", logger.Err(err))
		}
	}

	return item, nil
}

// UpdateItemQuantity updates quantity of an item in OPEN order
// AÇIK siparişteki bir ürünün adedini günceller
func (s *OrderService) UpdateItemQuantity(orderID, itemID uint, quantity int) error {
	// 1. Validate Order
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}
	if order.Status != "OPEN" && order.Status != "COMPLETED" {
		return errors.New("cannot modify cancelled order")
	}

	// 2. Fetch Item
	item, err := s.orderRepo.FindItem(itemID)
	if err != nil {
		return err
	}
	if item.OrderID != orderID {
		return errors.New("item does not belong to this order")
	}

	// 3. Update Logic
	item.Quantity = quantity
	item.Subtotal = int64(quantity) * item.UnitPrice // Manual update needed or rely on hooks if we used repository Update efficiently.
	// Hooks usually run on Save. But specific column update might skip. Best to set explicitly.
	// Also need to trigger AfterSave for Order Total Recalc.

	if err := s.orderRepo.UpdateItem(item); err != nil {
		return err
	}

	if order.Status == "COMPLETED" {
		if err := s.syncTransactionAmount(orderID); err != nil {
			logger.Error("Failed to sync transaction amount", logger.Err(err))
		}
	}

	return nil
}

// RemoveOrderItem removes an item from OPEN order
// AÇIK siparişten bir ürünü kaldırır
func (s *OrderService) RemoveOrderItem(orderID, itemID uint) error {
	// 1. Validate Order
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}
	if order.Status != "OPEN" && order.Status != "COMPLETED" {
		return errors.New("cannot modify cancelled order")
	}

	// 2. Validate Item Ownership
	item, err := s.orderRepo.FindItem(itemID)
	if err != nil {
		return err
	}
	if item.OrderID != orderID {
		return errors.New("item does not belong to this order")
	}

	// 3. Delete
	// This triggers AfterDelete hook (we added it) -> Recalculate Order Total
	// We pass the full item so the Hook knows the OrderID
	if err := s.orderRepo.DeleteItem(item); err != nil {
		return err
	}

	if order.Status == "COMPLETED" {
		if err := s.syncTransactionAmount(orderID); err != nil {
			logger.Error("Failed to sync transaction amount", logger.Err(err))
		}
	}

	return nil
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

	// Update Table Status if tableID is present
	if tableID != nil {
		table, err := s.tableRepo.FindByID(*tableID)
		if err == nil {
			table.Status = "occupied"
			table.CurrentOrderID = &order.ID
			_ = s.tableRepo.Update(table) // Log error if needed, but don't fail order creation?
		} else {
			logger.Error("Failed to find table to update status", logger.Err(err))
		}
	}

	return order, nil
}

// GetOrder fetches order with items
// Siparişi ve kalemlerini getirir
func (s *OrderService) GetOrder(id uint) (*models.Order, error) {
	return s.orderRepo.FindByID(id)
}

// GetOrdersByTable fetches all open orders for a table
// Masadaki açık siparişleri getirir
func (s *OrderService) GetOrdersByTable(tableID uint) ([]models.Order, error) {
	return s.orderRepo.FindByTableID(tableID, "OPEN")
}

// GetOrders fetches orders within a date range or active scope
// Belirli bir tarih aralığındaki veya aktif kapsamdaki siparişleri getirir
func (s *OrderService) GetOrders(startDate, endDate time.Time, scope string) ([]models.Order, error) {
	if scope == "active" {
		activePeriod, err := s.workPeriodRepo.FindActivePeriod()
		if err != nil {
			return nil, err
		}
		if activePeriod != nil {
			return s.orderRepo.FindByWorkPeriod(activePeriod.ID)
		}
		// If requesting active scope but no active period, return empty
		return []models.Order{}, nil
	}

	// Specific Work Period Scope
	// Belirli Çalışma Dönemi Kapsamı
	if strings.HasPrefix(scope, "period_") {
		periodIDStr := strings.TrimPrefix(scope, "period_")
		periodID, err := strconv.ParseUint(periodIDStr, 10, 32)
		if err == nil {
			return s.orderRepo.FindByWorkPeriod(uint(periodID))
		}
	}

	// Strict WorkPeriod Logic for History (Date-based) - legacy fallback if strict date needed
	// ...
	// Tarih bazlı geçmiş için sıkı çalışma dönemi mantığı
	// Find WorkPeriods that started on the 'startDate' (assuming single day query)
	periods, err := s.workPeriodRepo.GetPeriodsByDate(startDate)
	if err != nil {
		return nil, err
	}

	if len(periods) == 0 {
		return []models.Order{}, nil
	}

	var ids []uint
	for _, p := range periods {
		ids = append(ids, p.ID)
	}

	return s.orderRepo.FindByWorkPeriodIDs(ids)
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

		// Update Table Status when order is closed (Need to check if any other open orders exist)
		// Sipariş kapatıldığında masa durumunu güncelle (Başka açık sipariş olup olmadığını kontrol et)
		if order.TableID != nil {
			// Find OPEN orders for this table, using the TX to be safe (though Repo uses separate DB instance usually,
			// using repository method directly is cleaner if transaction context is not strictly required for read).
			// Ideally we use tx to count.
			// WORKAROUND: We assume strict consistency isn't violated by a slight race here for table status in MVP.
			// Correct way: Check count of OPEN orders where ID != closedOrderID.
			// Since we just marked this one COMPLETED in TX, FindByTableID("OPEN") should return remaining.

			// Note: order_repo.FindByTableID uses s.orderRepo.db which is outside this TX.
			// So it might still see the old status if isolation level is low, OR if we haven't committed.
			// But we updated `order` using `tx.Save`.
			// So `tx` knows it is COMPLETED.
			// But `FindByTableID` uses `r.db`.
			// We should probably just assume if this was the last one, clear table.

			// Better: Execute query using TX.
			var count int64
			tx.Model(&models.Order{}).Where("table_id = ? AND status = ?", *order.TableID, "OPEN").Count(&count)

			if count == 0 {
				var table models.Table
				if err := tx.First(&table, *order.TableID).Error; err == nil {
					table.Status = "available"
					table.CurrentOrderID = nil
					tx.Save(&table)
				}
			}
		}

		logger.Info("Order closed and transaction recorded",
			logger.Int("order_id", int(order.ID)),
			logger.Int("amount", int(order.TotalAmount)),
		)

		return nil
	})
}

// CancelOrder cancels (deletes) an OPEN order
// AÇIK siparişi iptal eder (siler)
func (s *OrderService) CancelOrder(orderID uint) error {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status != "OPEN" {
		return errors.New("cannot cancel closed order")
	}

	// Delete
	if err := s.orderRepo.Delete(orderID); err != nil {
		return err
	}

	// Check if Table needs to be freed
	if order.TableID != nil {
		// Check remaining open orders
		orders, err := s.orderRepo.FindByTableID(*order.TableID, "OPEN")
		if err == nil && len(orders) == 0 {
			table, err := s.tableRepo.FindByID(*order.TableID)
			if err == nil {
				table.Status = "available"
				table.CurrentOrderID = nil
				s.tableRepo.Update(table)
			}
		} else if err == nil && len(orders) > 0 {
			// If we deleted the "CurrentOrderID" one, switch to another
			table, err := s.tableRepo.FindByID(*order.TableID)
			if err == nil && table.CurrentOrderID != nil && *table.CurrentOrderID == orderID {
				table.CurrentOrderID = &orders[0].ID
				s.tableRepo.Update(table)
			}
		}
	}

	return nil
}

// syncTransactionAmount updates the linked transaction amount when a closed order is modified
func (s *OrderService) syncTransactionAmount(orderID uint) error {
	// Re-fetch order to get updated total
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	// Find transaction
	tx, err := s.transactionRepo.FindByOrderID(orderID)
	if err != nil {
		// Possibly no transaction if 0 amount or issue. Log but don't hard fail?
		return err
	}

	if tx.Amount != order.TotalAmount {
		tx.Amount = order.TotalAmount
		return s.transactionRepo.Update(tx)
	}

	return nil
}

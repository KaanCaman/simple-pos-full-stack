package models

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// User represents a system user (Admin/Waiter)
// Sistem kullanıcısı (Yönetici/Garson)
type User struct {
	BaseModel
	Name     string `gorm:"size:100;not null" json:"name" validate:"required,min=2"`
	PinCode  string `gorm:"size:255;not null" json:"-"` // Stores Bcrypt Hash
	Role     string `gorm:"size:20;not null;default:'waiter'" json:"role" validate:"oneof=admin waiter"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

// JWTClaims represents the payload of the JWT
// JWT içeriğini temsil eder
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Category represents a product category
// Ürün kategorisi
type Category struct {
	BaseModel
	Name      string    `gorm:"size:100;uniqueIndex;not null" json:"name" validate:"required"`
	Icon      string    `gorm:"size:50" json:"icon"`
	Color     string    `gorm:"size:20" json:"color"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	Products  []Product `json:"products,omitempty"`
}

// Product represents a sellable item
// Satılabilir ürün
type Product struct {
	BaseModel
	CategoryID  uint     `json:"category_id" validate:"required"`
	Category    Category `json:"category,omitempty"`
	Name        string   `gorm:"size:100;not null" json:"name" validate:"required"`
	Price       int64    `gorm:"not null;check:price >= 0" json:"price" validate:"min=0"` // Stored in Kuruş (Price * 100)
	ImageURL    string   `json:"image_url"`
	Description string   `json:"description"`
	IsAvailable bool     `gorm:"default:true" json:"is_available"`
	SortOrder   int      `gorm:"default:0" json:"sort_order"`
}

// Table Status Enum
const (
	TableStatusAvailable = "available"
	TableStatusOccupied  = "occupied"
	TableStatusReserved  = "reserved"
)

// Table represents a dining table
// Masa
type Table struct {
	BaseModel
	Name           string `gorm:"size:50;uniqueIndex;not null" json:"name" validate:"required"`
	Status         string `gorm:"size:20;default:'available'" json:"status" validate:"oneof=available occupied reserved"`
	CurrentOrderID *uint  `json:"current_order_id,omitempty"`
}

// Order Status Enum
const (
	OrderStatusOpen      = "open"
	OrderStatusCompleted = "completed"
	OrderStatusCancelled = "cancelled"
)

// Payment Method Enum
const (
	PaymentMethodCash       = "CASH"
	PaymentMethodCreditCard = "CREDIT_CARD"
)

// Order represents a customer order
// Müşteri siparişi
type Order struct {
	BaseModel
	OrderNumber   string      `gorm:"size:50;uniqueIndex;not null" json:"order_number"` // UUID or Generated
	WorkPeriodID  uint        `gorm:"index" json:"work_period_id"`                      // Link to WorkPeriod
	TableID       *uint       `json:"table_id"`
	WaiterID      *uint       `json:"waiter_id"`
	Status        string      `gorm:"size:20;default:'open'" json:"status" validate:"oneof=open completed cancelled"`
	Subtotal      int64       `gorm:"default:0" json:"subtotal"` // Sum of items subtotal
	TaxAmount     int64       `gorm:"default:0" json:"tax_amount"`
	TotalAmount   int64       `gorm:"default:0" json:"total_amount"` // Subtotal + Tax
	PaymentMethod string      `gorm:"size:50" json:"payment_method"`
	CompletedAt   *time.Time  `json:"completed_at"`
	Items         []OrderItem `json:"items,omitempty"`
}

// OrderItem represents an item in an order
// Sipariş kalemi
type OrderItem struct {
	BaseModel
	OrderID     uint   `json:"order_id"`
	ProductID   uint   `json:"product_id"`
	ProductName string `gorm:"size:100" json:"product_name"` // Snapshot
	Quantity    int    `gorm:"not null;check:quantity > 0" json:"quantity" validate:"min=1"`
	UnitPrice   int64  `gorm:"not null" json:"unit_price"` // Snapshot
	Subtotal    int64  `gorm:"not null" json:"subtotal"`
}

// Transaction represents financial movement
// Finansal işlem
type Transaction struct {
	BaseModel
	Type            string    `gorm:"size:20;not null" json:"type" validate:"oneof=income expense"` // income / expense
	Category        string    `gorm:"size:50" json:"category"`
	PaymentMethod   string    `gorm:"size:50" json:"payment_method"`
	Amount          int64     `gorm:"not null" json:"amount"`
	Description     string    `json:"description"`
	OrderID         *uint     `json:"order_id"`
	WorkPeriodID    uint      `gorm:"index" json:"work_period_id"` // Link to WorkPeriod
	CreatedBy       uint      `json:"created_by"`
	TransactionDate time.Time `json:"transaction_date"`
}

// DailyReport represents aggregated daily stats
// Günlük rapor
type DailyReport struct {
	ReportDate    string    `gorm:"primaryKey;size:10" json:"report_date"` // YYYY-MM-DD
	TotalOrders   int       `gorm:"default:0" json:"total_orders"`
	TotalSales    int64     `gorm:"default:0" json:"total_sales"`
	CashSales     int64     `gorm:"default:0" json:"cash_sales"`
	PosSales      int64     `gorm:"default:0" json:"pos_sales"`
	TotalExpenses int64     `gorm:"default:0" json:"total_expenses"`
	NetProfit     int64     `gorm:"default:0" json:"net_profit"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ProductSalesStat represents product performance
// Ürün satış istatistikleri
type ProductSalesStat struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	ReportDate   string `gorm:"index;size:10" json:"report_date"`
	ProductID    uint   `gorm:"index" json:"product_id"`
	ProductName  string `json:"product_name"`
	QuantitySold int    `gorm:"default:0" json:"quantity_sold"`
	TotalRevenue int64  `gorm:"default:0" json:"total_revenue"`
}

// WorkPeriod represents a business day/shift
// Çalışma dönemi (gün/vardiya)
type WorkPeriod struct {
	BaseModel
	StartTime time.Time  `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	ClosedBy  uint       `json:"closed_by"` // UserID
}

// HOOKS

// BeforeCreate for OrderItem: Snapshot product details and calculate subtotal
// Sipariş kalemi için BeforeCreate: Ürün detaylarını快照 al ve toplam tutar hesapla
func (item *OrderItem) BeforeCreate(tx *gorm.DB) (err error) {
	// If Product details are not manually set (testing/overrides), fetch them
	// Eğer ürün detayları manuel olarak ayarlanmamışsa (test/üzerindeki ayarlamalar), onları al
	if item.UnitPrice == 0 || item.ProductName == "" {
		var product Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			return errors.New("product not found for item snapshot")
		}
		item.ProductName = product.Name
		if item.UnitPrice == 0 {
			item.UnitPrice = product.Price
		}
	}

	// Calculate Item Subtotal logic
	// Sipariş kalemi toplam tutar hesaplaması
	item.Subtotal = int64(item.Quantity) * item.UnitPrice
	return nil
}

// AfterSave for OrderItem: Recalculate Order Totals
// Sipariş kalemi için AfterSave: Sipariş toplam tutarını yeniden hesapla
func (item *OrderItem) AfterSave(tx *gorm.DB) (err error) {
	// Re-calculate the Order Total
	// Sipariş toplam tutarını yeniden hesapla
	var order Order
	if err := tx.First(&order, item.OrderID).Error; err != nil {
		return err
	}

	// Aggregate all items for this order
	// We can use SQL sum for efficiency
	// Tüm ürünleri toplam tutar için toplama hesapla
	// Veritabanı için performans için SQL toplama kullanabiliriz
	result := struct{ Total int64 }{}

	// Sum all subtotals of items belonging to this order
	// Bu siparişin ait tüm ürünleri toplam tutar için toplama hesapla
	if err := tx.Model(&OrderItem{}).
		Where("order_id = ?", item.OrderID).
		Where("deleted_at IS NULL").
		Select("sum(subtotal) as total").
		Scan(&result).Error; err != nil {
		return err
	}

	order.Subtotal = result.Total
	order.TotalAmount = order.Subtotal + order.TaxAmount
	// Note: Tax calculation logic might be complex (per item or global),
	// for now we assume TaxAmount is set elsewhere or derived.
	// If we want simply Tax = 0 or specific rule, we can add it.
	// Let's keep it simple: Total = Subtotal (assuming inclusive tax or 0 tax for now unless logic added)

	// Not: Vergi hesaplama mantığı ürün başına veya genel olabilir,
	// şimdi TaxAmount başka yerde ayarlanmış veya hesaplanmış olarak kabul ediyoruz.
	// Eğer basit Tax = 0 veya belirli bir kural istiyorsak, onu ekleyebiliriz.
	// Basit tutar = toplam tutar (şimdiye kadar dahil edilmiş vergi veya 0 vergi için basit tutar)

	return tx.Save(&order).Error
}

// AfterDelete for OrderItem: Recalculate Order Totals
// Sipariş kalemi için AfterDelete: Sipariş toplam tutarını yeniden hesapla
func (item *OrderItem) AfterDelete(tx *gorm.DB) (err error) {
	// Re-calculate the Order Total logic is same as AfterSave
	// Just call AfterSave or duplicate logic. Let's duplicate for clarity and safety.
	return item.AfterSave(tx)
}

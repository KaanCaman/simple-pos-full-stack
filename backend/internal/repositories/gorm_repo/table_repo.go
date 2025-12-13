package gorm_repo

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"

	"gorm.io/gorm"
)

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) repositories.TableRepository {
	return &tableRepository{db: db}
}

func (r *tableRepository) Create(table *models.Table) error {
	return r.db.Create(table).Error
}

func (r *tableRepository) FindAll() ([]models.Table, error) {
	var tables []models.Table
	// Fetch tables with active order count
	// Status = 'open' (case sensitive check, usually uppercase in DB if enum, but mapped to lowercase in struct default? Let's check consts)
	// Model defines default 'available'. Order defines default 'open'.
	// Using hardcoded string 'OPEN' based on previous context, but model says 'open'.
	// Checking `Order` struct: `default:'open'`.
	// However, in previous steps, `CancelOrder` checked for "OPEN" (uppercase).
	// Let's check `CancelOrder` implementation again to be sure about Case.
	// Step 2060 showed: `if order.Status != "OPEN"`
	// So it seems we are using Uppercase OPEN in logic but model has lowercase default?
	// Let's assume UpperCase "OPEN" is the standard effectively used or check DB.
	// Actually, let's look at `OrderService` `createOrder` to be sure.

	// Better safe: use lower case 'open' if that matches default, OR check both/ignore case if possible.
	// But standard SQL is easiest.
	// Let's try to match what is used.

	err := r.db.Model(&models.Table{}).Select("tables.*, (SELECT count(*) FROM orders WHERE orders.table_id = tables.id AND orders.status IN ('OPEN', 'open') AND orders.deleted_at IS NULL) as order_count").Scan(&tables).Error
	return tables, err
}

func (r *tableRepository) FindByID(id uint) (*models.Table, error) {
	var table models.Table
	err := r.db.First(&table, id).Error
	if err != nil {
		return nil, err
	}
	return &table, nil
}

func (r *tableRepository) Update(table *models.Table) error {
	return r.db.Save(table).Error
}

func (r *tableRepository) Delete(id uint) error {
	return r.db.Delete(&models.Table{}, id).Error
}

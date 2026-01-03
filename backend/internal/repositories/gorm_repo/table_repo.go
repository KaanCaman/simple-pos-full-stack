package gorm_repo

import (
	"errors"
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
	var existingTable models.Table
	// Check if table exists (including soft-deleted)
	// Masa var mı kontrol et (silinmişler dahil)
	err := r.db.Unscoped().Where("name = ?", table.Name).First(&existingTable).Error

	if err == nil {
		// Table found / Masa bulundu
		if existingTable.DeletedAt.Valid {
			// Soft-deleted -> Restore and Update
			// Silinmiş -> Geri yükle ve Güncelle
			existingTable.DeletedAt = gorm.DeletedAt{} // Restore / Geri yükle
			existingTable.Section = table.Section      // Update section / Bölümü güncelle
			existingTable.Status = "available"         // Reset status / Durumu sıfırla

			if saveErr := r.db.Save(&existingTable).Error; saveErr != nil {
				return saveErr
			}

			// Return the ID of the restored table
			// Geri yüklenen masanın ID'sini döndür
			table.ID = existingTable.ID
			table.CreatedAt = existingTable.CreatedAt
			table.UpdatedAt = existingTable.UpdatedAt
			return nil
		}
		// Exists and active / Var ve aktif
		return errors.New("table with this name already exists")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Database error / Veritabanı hatası
		return err
	}

	// Not found -> Create new
	// Bulunamadı -> Yeni oluştur
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

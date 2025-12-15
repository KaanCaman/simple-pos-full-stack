package gorm_repo

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"

	"gorm.io/gorm"
)

// WorkPeriodRepository interface implementation
// Work period repository interface'sini implement eder
type workPeriodRepository struct {
	db *gorm.DB
}

// NewWorkPeriodRepository creates a new work period repository
//
//	Yeni bir work period repository oluşturur
func NewWorkPeriodRepository(db *gorm.DB) repositories.WorkPeriodRepository {
	return &workPeriodRepository{db: db}
}

// Create creates a new work period
//
//	Yeni bir work period oluşturur
func (r *workPeriodRepository) Create(period *models.WorkPeriod) error {
	return r.db.Create(period).Error
}

// FindActivePeriod finds the active work period
//
//	Aktif work period'ı bulur
func (r *workPeriodRepository) FindActivePeriod() (*models.WorkPeriod, error) {
	var period models.WorkPeriod
	err := r.db.Where("is_active = ?", true).First(&period).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // No active period found
		}
		return nil, err
	}
	return &period, nil
}

// Update updates a work period
//
//	Bir work period günceller
func (r *workPeriodRepository) Update(period *models.WorkPeriod) error {
	return r.db.Save(period).Error
}

func (r *workPeriodRepository) GetPeriodsByDate(date time.Time) ([]models.WorkPeriod, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var periods []models.WorkPeriod
	// Find periods that STARTED on this day
	if err := r.db.Where("start_time >= ? AND start_time < ?", startOfDay, endOfDay).Find(&periods).Error; err != nil {
		return nil, err
	}
	return periods, nil
}

// GetPeriodsBetweenDates finds work periods that started within the given date range
// Belirtilen tarih aralığında başlayan çalışma dönemlerini bulur
func (r *workPeriodRepository) GetPeriodsBetweenDates(start, end time.Time) ([]models.WorkPeriod, error) {
	var periods []models.WorkPeriod
	if err := r.db.Where("start_time >= ? AND start_time <= ?", start, end).Find(&periods).Error; err != nil {
		return nil, err
	}
	return periods, nil
}

// FindByID finds a work period by ID
//
//	Bir work period ID'siyle bulur
func (r *workPeriodRepository) FindByID(id uint) (*models.WorkPeriod, error) {
	var period models.WorkPeriod
	if err := r.db.First(&period, id).Error; err != nil {
		return nil, err
	}
	return &period, nil
}

package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"simple-pos/pkg/logger"
	"time"

	"gorm.io/gorm"
)

type ManagementService struct {
	workPeriodRepo repositories.WorkPeriodRepository
	orderRepo      repositories.OrderRepository
	db             *gorm.DB
}

func NewManagementService(wpRepo repositories.WorkPeriodRepository, orderRepo repositories.OrderRepository, db *gorm.DB) *ManagementService {
	return &ManagementService{
		workPeriodRepo: wpRepo,
		orderRepo:      orderRepo,
		db:             db,
	}
}

// StartDay starts a new work period
func (s *ManagementService) StartDay(userID uint) error {
	existing, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("a work period is already active")
	}

	period := &models.WorkPeriod{
		StartTime: time.Now(),
		IsActive:  true,
	}

	if err := s.workPeriodRepo.Create(period); err != nil {
		logger.Error("Failed to start day", logger.Err(err))
		return err
	}

	logger.Info("Work period started", logger.Int("user_id", int(userID)))
	return nil
}

// EndDay closes the current work period and generates a report
func (s *ManagementService) EndDay(userID uint) (*models.DailyReport, error) {
	period, err := s.workPeriodRepo.FindActivePeriod()
	if err != nil {
		return nil, err
	}
	if period == nil {
		return nil, errors.New("no active work period found")
	}

	// 1. Calculate Stats for this Work Period (Strictly by ID)
	now := time.Now()

	var totalOrders int64
	s.db.Model(&models.Order{}).
		Where("work_period_id = ?", period.ID).
		Count(&totalOrders)

	var totalSales float64
	s.db.Model(&models.Order{}).
		Where("work_period_id = ?", period.ID).
		Select("COALESCE(sum(total_amount), 0)").
		Scan(&totalSales)

	var cashSales float64
	s.db.Model(&models.Order{}).
		Where("work_period_id = ? AND payment_method = ?", period.ID, "CASH").
		Select("COALESCE(sum(total_amount), 0)").
		Scan(&cashSales)

	var posSales float64
	s.db.Model(&models.Order{}).
		Where("work_period_id = ? AND payment_method = ?", period.ID, "CREDIT_CARD").
		Select("COALESCE(sum(total_amount), 0)").
		Scan(&posSales)

	var totalExpenses float64
	s.db.Model(&models.Transaction{}).
		Where("work_period_id = ? AND type = ?", period.ID, "EXPENSE").
		Select("COALESCE(sum(amount), 0)").
		Scan(&totalExpenses)

	// 2. Close Work Period with Stats
	period.IsActive = false
	period.EndTime = &now
	period.ClosedBy = userID
	period.TotalOrders = int(totalOrders)
	period.TotalSales = int64(totalSales)
	period.TotalExpenses = int64(totalExpenses)
	period.NetProfit = int64(totalSales - totalExpenses)

	if err := s.workPeriodRepo.Update(period); err != nil {
		logger.Error("Failed to close work period", logger.Err(err))
		return nil, err
	}

	// 3. Update/Aggregate Daily Report (Optional but good for fallback)
	reportDate := period.StartTime.Format("2006-01-02")
	var report models.DailyReport
	if err := s.db.Where("report_date = ?", reportDate).First(&report).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			report.ReportDate = reportDate
		} else {
			logger.Error("Failed to find daily report", logger.Err(err))
			return nil, err
		}
	}

	// RE-CALCULATION FOR DAILY REPORT (Aggregation)
	// We want the DailyReport to represent the WHOLE DAY.
	// So we should query everything for that Day OR Sum all periods.
	// Summing periods is better if we trust period stats.
	// Let's just query everything for the day (00:00-23:59) for the DailyReport record.

	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	dayEnd := dayStart.Add(24 * time.Hour)

	var drTotalOrders int64
	s.db.Model(&models.Order{}).Where("created_at >= ? AND created_at < ?", dayStart, dayEnd).Count(&drTotalOrders)

	var drTotalSales float64
	s.db.Model(&models.Order{}).Where("created_at >= ? AND created_at < ?", dayStart, dayEnd).Select("COALESCE(sum(total_amount), 0)").Scan(&drTotalSales)

	var drTotalExpenses float64
	s.db.Model(&models.Transaction{}).Where("type = ? AND created_at >= ? AND created_at < ?", "EXPENSE", dayStart, dayEnd).Select("COALESCE(sum(amount), 0)").Scan(&drTotalExpenses)

	report.TotalOrders = int(drTotalOrders)
	report.TotalSales = int64(drTotalSales)
	report.TotalExpenses = int64(drTotalExpenses)
	report.NetProfit = int64(drTotalSales - drTotalExpenses)
	report.CashSales = 0 // Keeping simplified
	report.PosSales = 0

	report.UpdatedAt = now
	if err := s.db.Save(&report).Error; err != nil {
		logger.Error("Failed to save daily report", logger.Err(err))
		return nil, err
	}

	logger.Info("Work period ended", logger.Int("period_id", int(period.ID)))
	return &report, nil
}

// GetActivePeriod returns the current active work period or nil if none
func (s *ManagementService) GetActivePeriod() (*models.WorkPeriod, error) {
	return s.workPeriodRepo.FindActivePeriod()
}

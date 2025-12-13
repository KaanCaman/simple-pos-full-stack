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

	report := &models.DailyReport{
		ReportDate: time.Now().Format("2006-01-02"),
		UpdatedAt:  time.Now(),
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		type Result struct {
			TotalOrders int
			TotalSales  int64
		}
		var res Result

		if err := tx.Model(&models.Order{}).
			Where("work_period_id = ? AND status = ?", period.ID, "COMPLETED").
			Select("count(id) as total_orders, COALESCE(sum(total_amount), 0) as total_sales").
			Scan(&res).Error; err != nil {
			return err
		}
		report.TotalOrders = res.TotalOrders
		report.TotalSales = res.TotalSales

		var cashSales int64
		// Updated to use constant based on recent user edits if needed, but keeping string literal to be safe or checking models
		// User edited models.go in Step 75 adding constants.
		// "CASH" vs models.PaymentMethodCash.
		// I'll stick to string for now to match previous impl, or use constant if I knew the package import was updated properly.
		// I'll use "CASH" matching the code I wrote before.
		tx.Model(&models.Order{}).
			Where("work_period_id = ? AND status = ? AND payment_method = ?", period.ID, "COMPLETED", "CASH").
			Select("COALESCE(sum(total_amount), 0)").
			Scan(&cashSales)
		report.CashSales = cashSales
		report.PosSales = report.TotalSales - report.CashSales

		var totalExpenses int64
		tx.Model(&models.Transaction{}).
			Where("work_period_id = ? AND type = ?", period.ID, "EXPENSE").
			Select("COALESCE(sum(amount), 0)").
			Scan(&totalExpenses)
		report.TotalExpenses = totalExpenses
		report.NetProfit = report.TotalSales - report.TotalExpenses

		if err := tx.Save(report).Error; err != nil {
			return err
		}

		now := time.Now()
		period.IsActive = false
		period.EndTime = &now
		period.ClosedBy = userID

		if err := tx.Save(period).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return report, nil
}

// GetActivePeriod returns the current active work period or nil if none
func (s *ManagementService) GetActivePeriod() (*models.WorkPeriod, error) {
	return s.workPeriodRepo.FindActivePeriod()
}

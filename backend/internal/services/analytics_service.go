package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type AnalyticsService struct {
	db              *gorm.DB
	transactionRepo repositories.TransactionRepository
	workPeriodRepo  repositories.WorkPeriodRepository
}

func NewAnalyticsService(db *gorm.DB, txRepo repositories.TransactionRepository, wpRepo repositories.WorkPeriodRepository) *AnalyticsService {
	return &AnalyticsService{
		db:              db,
		transactionRepo: txRepo,
		workPeriodRepo:  wpRepo,
	}
}

// GetReportHistory fetches past work periods (history)
// Geçmiş çalışma dönemlerini getirir
func (s *AnalyticsService) GetReportHistory() ([]models.WorkPeriod, error) {
	var periods []models.WorkPeriod
	// Fetch closed periods, newest first
	if err := s.db.Where("is_active = ?", false).Order("end_time desc").Limit(50).Find(&periods).Error; err != nil {
		return nil, err
	}
	return periods, nil
}

// GetDailyReport generates a report for the given date
// Belirtilen tarih için rapor oluşturur
// GetDailyReport generates or retrieves stats for a specific day
// Belirli bir gün için istatistikleri oluşturur veya getirir
func (s *AnalyticsService) GetDailyReport(dateStr string, scope string) (*models.DailyReport, error) {
	// Handle specific period request
	if strings.HasPrefix(dateStr, "period_") {
		idStr := strings.TrimPrefix(dateStr, "period_")
		id, _ := strconv.Atoi(idStr)
		period, err := s.workPeriodRepo.FindByID(uint(id))
		if err != nil {
			return nil, err
		}

		// Calculate payment stats (not stored on WorkPeriod)
		var cashSales float64
		s.db.Model(&models.Order{}).Where("work_period_id = ? AND payment_method = ?", period.ID, "CASH").Select("COALESCE(sum(total_amount), 0)").Scan(&cashSales)

		var posSales float64
		s.db.Model(&models.Order{}).Where("work_period_id = ? AND payment_method = ?", period.ID, "CREDIT_CARD").Select("COALESCE(sum(total_amount), 0)").Scan(&posSales)

		// Return report derived strictly from WorkPeriod stats (plus calculated payment split)
		return &models.DailyReport{
			ReportDate:    period.StartTime.Format("2006-01-02 15:04"), // Precise time for display
			TotalOrders:   period.TotalOrders,
			TotalSales:    period.TotalSales,
			TotalExpenses: period.TotalExpenses,
			NetProfit:     period.NetProfit,
			CashSales:     int64(cashSales),
			PosSales:      int64(posSales),
			UpdatedAt:     time.Now(),
		}, nil
	}

	// Handle Active Period request
	if scope == "active" {
		period, err := s.workPeriodRepo.FindActivePeriod()
		if err != nil {
			return nil, err
		}
		if period == nil {
			return &models.DailyReport{
				ReportDate: time.Now().Format("2006-01-02"),
				UpdatedAt:  time.Now(),
			}, nil
		}

		// Calculate live stats for Active Period
		var totalOrders int64
		s.db.Model(&models.Order{}).Where("work_period_id = ?", period.ID).Count(&totalOrders)

		var totalSales float64
		s.db.Model(&models.Order{}).Where("work_period_id = ?", period.ID).Select("COALESCE(sum(total_amount), 0)").Scan(&totalSales)

		var cashSales float64
		s.db.Model(&models.Order{}).Where("work_period_id = ? AND payment_method = ?", period.ID, "CASH").Select("COALESCE(sum(total_amount), 0)").Scan(&cashSales)

		var posSales float64
		s.db.Model(&models.Order{}).Where("work_period_id = ? AND payment_method = ?", period.ID, "CREDIT_CARD").Select("COALESCE(sum(total_amount), 0)").Scan(&posSales)

		var totalExpenses float64
		s.db.Model(&models.Transaction{}).Where("work_period_id = ? AND type = ?", period.ID, "EXPENSE").Select("COALESCE(sum(amount), 0)").Scan(&totalExpenses)

		return &models.DailyReport{
			ReportDate:    period.StartTime.Format("2006-01-02 15:04"),
			TotalOrders:   int(totalOrders),
			TotalSales:    int64(totalSales),
			TotalExpenses: int64(totalExpenses),
			NetProfit:     int64(totalSales - totalExpenses),
			CashSales:     int64(cashSales),
			PosSales:      int64(posSales),
			UpdatedAt:     time.Now(),
		}, nil
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	// Define Start/End of Day
	// Günün Başlangıç/Bitişini tanımla
	startOfDay := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 0, 0, 0, 0, parsedDate.Location())

	var report models.DailyReport
	report.ReportDate = dateStr
	now := time.Now()
	report.UpdatedAt = now

	// Determine WorkPeriods to aggregate
	// Toplanacak Çalışma Dönemlerini belirle
	var periodIDs []uint
	var workPeriods []models.WorkPeriod
	todayStr := time.Now().Format("2006-01-02") // Used for "active" scope check

	// IF Scope is ACTIVE (Live Report), use Active Period
	if scope == "active" && dateStr == todayStr {
		activePeriod, _ := s.workPeriodRepo.FindActivePeriod()
		if activePeriod != nil {
			periodIDs = append(periodIDs, activePeriod.ID)
			// startTime = activePeriod.StartTime // startTime is not used in the new queries
		}
	} else {
		// Fetch Periods for the Date
		workPeriods, _ = s.workPeriodRepo.GetPeriodsByDate(startOfDay)
		for _, p := range workPeriods {
			periodIDs = append(periodIDs, p.ID)
		}
	}

	// If no periods found, return empty report (0s)
	// Eğer dönem bulunamazsa boş rapor dön
	if len(periodIDs) == 0 {
		return &report, nil
	}

	// 1. Total Completed Orders Count
	// Toplam Tamamlanan Sipariş Sayısı
	var totalOrders int64
	s.db.Model(&models.Order{}).
		Where("status = ? AND work_period_id IN ?", "COMPLETED", periodIDs).
		Count(&totalOrders)
	report.TotalOrders = int(totalOrders)

	// 2. Total Sales & Breakdown (Cash/POS)
	// Toplam Satış ve Dağılım
	type PaymentStat struct {
		Method string
		Total  int64
	}
	var paymentStats []PaymentStat

	s.db.Model(&models.Order{}).
		Select("payment_method as method, sum(total_amount) as total").
		Where("status = ? AND work_period_id IN ?", "COMPLETED", periodIDs).
		Group("payment_method").
		Scan(&paymentStats)

	for _, stat := range paymentStats {
		report.TotalSales += stat.Total
		switch stat.Method {
		case "CASH":
			report.CashSales += stat.Total
		case "CREDIT_CARD":
			report.PosSales += stat.Total
		}
	}

	// 3. Total Expenses
	// Toplam Giderler
	var totalExpenses int64
	s.db.Model(&models.Transaction{}).
		Where("type = ? AND work_period_id IN ?", "EXPENSE", periodIDs).
		Select("COALESCE(sum(amount), 0)").
		Scan(&totalExpenses)
	report.TotalExpenses = totalExpenses

	// 4. Net Profit
	// Net Kar
	report.NetProfit = report.TotalSales - report.TotalExpenses

	return &report, nil
}

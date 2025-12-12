package services

import (
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"
	"time"

	"gorm.io/gorm"
)

type AnalyticsService struct {
	db              *gorm.DB
	transactionRepo repositories.TransactionRepository
}

func NewAnalyticsService(db *gorm.DB, txRepo repositories.TransactionRepository) *AnalyticsService {
	return &AnalyticsService{
		db:              db,
		transactionRepo: txRepo,
	}
}

// GetDailyReport generates a report for the given date
// Belirtilen tarih için rapor oluşturur
func (s *AnalyticsService) GetDailyReport(date time.Time) (*models.DailyReport, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var report models.DailyReport
	report.ReportDate = startOfDay.Format("2006-01-02")
	now := time.Now()
	report.UpdatedAt = now

	// 1. Total Completed Orders Count
	// Toplam Tamamlanan Sipariş Sayısı
	var totalOrders int64
	s.db.Model(&models.Order{}).
		Where("status = ? AND completed_at >= ? AND completed_at < ?", "COMPLETED", startOfDay, endOfDay).
		Count(&totalOrders)
	report.TotalOrders = int(totalOrders)

	// 2. Sales Totals (Cash vs POS)
	// Satış Toplamları (Nakit vs POS)
	type SalesResult struct {
		Method string
		Total  int64
	}
	var sales []SalesResult
	s.db.Model(&models.Order{}).
		Select("payment_method as method, sum(total_amount) as total").
		Where("status = ? AND completed_at >= ? AND completed_at < ?", "COMPLETED", startOfDay, endOfDay).
		Group("payment_method").
		Scan(&sales)

	for _, sale := range sales {
		report.TotalSales += sale.Total
		switch sale.Method {
		case models.PaymentMethodCash:
			report.CashSales += sale.Total
		case models.PaymentMethodCreditCard:
			report.PosSales += sale.Total
		}
	}

	// 3. Total Expenses
	// Toplam Giderler
	expenses, err := s.transactionRepo.FindDailyTotal(date, "EXPENSE")
	if err != nil {
		return nil, err
	}
	report.TotalExpenses = expenses

	// 4. Net Profit
	// Net Kar
	report.NetProfit = report.TotalSales - report.TotalExpenses

	return &report, nil
}

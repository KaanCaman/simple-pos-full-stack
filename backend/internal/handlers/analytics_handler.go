package handlers

import (
	"fmt"
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	service *services.AnalyticsService
}

func NewAnalyticsHandler(s *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: s}
}

// GetDailyReport returns stats for a day
// Günlük raporu getirir
func (h *AnalyticsHandler) GetDailyReport(c *fiber.Ctx) error {
	dateStr := c.Query("date")
	scope := c.Query("scope")

	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	} else if !strings.HasPrefix(dateStr, "period_") {
		// Validate date format if provided AND not a period ID
		if _, err := time.Parse("2006-01-02", dateStr); err != nil {
			return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid date format (use YYYY-MM-DD)")
		}
	}

	report, err := h.service.GetDailyReport(dateStr, scope)
	if err != nil {
		fmt.Printf("GetDailyReport error: %v\n", err)
		return utils.InternalError(c, utils.CodeInternalError, err.Error())
	}
	fmt.Printf("GetDailyReport success: %+v\n", report)

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Daily report retrieved", report)
}

// GetReportHistory handles GET /analytics/history
// Geçmiş raporları getirir
func (h *AnalyticsHandler) GetReportHistory(c *fiber.Ctx) error {
	reports, err := h.service.GetReportHistory()
	if err != nil {
		return utils.InternalError(c, utils.CodeInternalError, "Failed to retrieve report history")
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Report history retrieved", reports)
}

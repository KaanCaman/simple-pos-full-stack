package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	service *services.AnalyticsService
}

func NewAnalyticsHandler(s *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: s}
}

// GetDailyReport handles GET /analytics/daily
// Günlük raporu getirir
func (h *AnalyticsHandler) GetDailyReport(c *fiber.Ctx) error {
	dateStr := c.Query("date")

	targetDate := time.Now()
	if dateStr != "" {
		parsedDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Invalid date format (use YYYY-MM-DD)")
		}
		targetDate = parsedDate
	}

	report, err := h.service.GetDailyReport(targetDate)
	if err != nil {
		return err
	}

	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Daily report retrieved", report)
}

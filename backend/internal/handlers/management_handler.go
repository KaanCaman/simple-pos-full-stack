package handlers

import (
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type ManagementHandler struct {
	service *services.ManagementService
}

func NewManagementHandler(service *services.ManagementService) *ManagementHandler {
	return &ManagementHandler{service: service}
}

type WorkPeriodRequest struct {
	UserID uint `json:"user_id"`
}

// StartDay handles the start day request
// Gün başlangıcı isteğini işler
func (h *ManagementHandler) StartDay(c *fiber.Ctx) error {
	var req WorkPeriodRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid request body")
	}

	if err := h.service.StartDay(req.UserID); err != nil {
		return utils.BadRequestError(c, utils.CodeTransactionFailed, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Work period started successfully", nil)
}

// GetSystemStatus returns the current status of the system (active work period, etc.)
func (h *ManagementHandler) GetSystemStatus(c *fiber.Ctx) error {
	period, err := h.service.GetActivePeriod()
	if err != nil {
		return utils.InternalError(c, utils.CodeInternalError, "Failed to check system status")
	}

	isDayOpen := period != nil
	var workPeriodID uint
	if isDayOpen {
		workPeriodID = period.ID
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "System status retrieved", fiber.Map{
		"is_day_open":    isDayOpen,
		"work_period_id": workPeriodID,
	})
}

// EndDay handles the end day request
// Gün sonu isteğini işler
func (h *ManagementHandler) EndDay(c *fiber.Ctx) error {
	var req WorkPeriodRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid request body")
	}

	report, err := h.service.EndDay(req.UserID)
	if err != nil {
		return utils.BadRequestError(c, utils.CodeTransactionFailed, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Work period ended successfully", fiber.Map{
		"report": report,
	})
}

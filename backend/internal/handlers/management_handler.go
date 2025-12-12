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

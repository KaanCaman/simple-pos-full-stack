package handlers

import (
	"simple-pos/internal/services"
	"simple-pos/pkg/logger"

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
		logger.Error("Invalid request body", logger.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.service.StartDay(req.UserID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Work period started successfully"})
}

// EndDay handles the end day request
// Gün sonu isteğini işler
func (h *ManagementHandler) EndDay(c *fiber.Ctx) error {
	var req WorkPeriodRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Error("Invalid request body", logger.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	report, err := h.service.EndDay(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Work period ended successfully",
		"report":  report,
	})
}

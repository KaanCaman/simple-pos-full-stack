package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/repositories"
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service        *services.AuthService
	workPeriodRepo repositories.WorkPeriodRepository
}

func NewAuthHandler(service *services.AuthService, wpRepo repositories.WorkPeriodRepository) *AuthHandler {
	return &AuthHandler{
		service:        service,
		workPeriodRepo: wpRepo,
	}
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token  string `json:"token"`
	Role   string `json:"role"`
	UserID int    `json:"userID"`
}

// Login handles user authentication
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	user, token, err := h.service.Login(req.Username, req.Password)
	if err != nil {
		return utils.BadRequestError(c, utils.CodeUnauthorized, "Invalid credentials")
	}

	// Check if day is open
	activePeriod, err := h.workPeriodRepo.FindActivePeriod()
	isDayOpen := activePeriod != nil
	var workPeriodID uint
	if isDayOpen {
		workPeriodID = activePeriod.ID
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Login successful", fiber.Map{
		"token":          token,
		"role":           user.Role,
		"userID":         user.ID,
		"is_day_open":    isDayOpen,
		"work_period_id": workPeriodID,
	})
}

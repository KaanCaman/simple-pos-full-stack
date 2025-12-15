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
	activePeriod, _ := h.workPeriodRepo.FindActivePeriod()
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

// Me returns the current authenticated user
// Mevcut kimliği doğrulanmış kullanıcıyı döndürür
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	// Get UserID from middleware context (set by Protected middleware)
	userID := c.Locals("userID").(uint)

	user, err := h.service.GetUser(uint(userID))
	if err != nil {
		return utils.BadRequestError(c, utils.CodeNotFound, "User not found")
	}

	// Check day status
	activePeriod, _ := h.workPeriodRepo.FindActivePeriod()
	isDayOpen := activePeriod != nil

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "User details", fiber.Map{
		"userID":      user.ID,
		"name":        user.Name,
		"role":        user.Role,
		"is_day_open": isDayOpen,
	})
}

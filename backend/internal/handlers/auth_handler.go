package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

type LoginRequest struct {
	UserID uint   `json:"user_id" validate:"required"`
	Pin    string `json:"pin" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

// Login handles user authentication
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	token, err := h.service.Login(req.UserID, req.Pin)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Login successful", LoginResponse{Token: token})
}

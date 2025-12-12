package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"

	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

type CreateUserRequest struct {
	Name string `json:"name" validate:"required,min=2"`
	Pin  string `json:"pin" validate:"required,numeric,len=4"`
	Role string `json:"role" validate:"required,oneof=admin waiter"`
}

type CreateUserResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

// Create handles the creation of a new user
// Yeni bir kullanıcı oluşturur
func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	user, err := h.service.CreateUser(req.Name, req.Pin, req.Role)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not create user")
	}

	return middleware.SuccessResponse(c, constants.CODE_CREATED, "User created successfully", CreateUserResponse{
		ID:   user.ID,
		Name: user.Name,
		Role: user.Role,
	})
}

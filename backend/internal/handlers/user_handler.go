package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"
	"simple-pos/pkg/utils"

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

	return utils.Success(c, fiber.StatusCreated, string(constants.CODE_CREATED), "User created successfully", CreateUserResponse{
		ID:   user.ID,
		Name: user.Name,
		Role: user.Role,
	})
}

// GetUsers returns all users
// Tüm kullanıcıları döndürür
func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	users, err := h.service.GetUsers()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not fetch users")
	}
	// TODO: Map to DTO to hide PIN hash if needed.
	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Users retrieved", users)
}

// GetUserByID returns a user by ID
// ID ile kullanıcı döndürür
func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
	}
	user, err := h.service.GetUserByID(uint(id))
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}
	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "User retrieved", user)
}

type UpdateUserRequest struct {
	Name     string `json:"name" validate:"required,min=2"`
	Role     string `json:"role" validate:"required,oneof=admin waiter"`
	IsActive bool   `json:"is_active"`
}

// UpdateUser updates user details
// Kullanıcı detaylarını günceller
func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
	}

	var req UpdateUserRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	user, err := h.service.UpdateUser(uint(id), req.Name, req.Role, req.IsActive)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not update user")
	}

	return middleware.SuccessResponse(c, constants.CODE_UPDATED, "User updated", user)
}

// DeleteUser deletes a user
// Kullanıcıyı siler
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.service.DeleteUser(uint(id)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not delete user")
	}
	return middleware.SuccessResponse(c, constants.CODE_DELETED, "User deleted", nil)
}

type ChangePinRequest struct {
	Pin string `json:"pin" validate:"required,numeric,len=4"`
}

// ChangePin handles PIN update
// PIN güncelleme işlemi
func (h *UserHandler) ChangePin(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
	}

	var req ChangePinRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	if err := h.service.ChangePin(uint(id), req.Pin); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not update PIN")
	}

	return middleware.SuccessResponse(c, constants.CODE_UPDATED, "PIN updated successfully", nil)
}

package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"

	"github.com/gofiber/fiber/v2"
)

type CategoryHandler struct {
	service *services.CategoryService
}

func NewCategoryHandler(service *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

type CreateCategoryRequest struct {
	Name      string `json:"name" validate:"required"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	SortOrder int    `json:"sort_order"`
}

// Create handles new category creation
// Yeni kategori oluşturmayı yönetir
func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	category, err := h.service.CreateCategory(req.Name, req.Icon, req.Color, req.SortOrder)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not create category")
	}

	return middleware.SuccessResponse(c, constants.CODE_CREATED, "Category created successfully", category)
}

// GetAll returns all categories
// Tüm kategorileri döndürür
func (h *CategoryHandler) GetAll(c *fiber.Ctx) error {
	categories, err := h.service.GetCategories()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not fetch categories")
	}

	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Categories retrieved", categories)
}

package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"
	"simple-pos/pkg/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	service *services.ProductService
}

func NewProductHandler(service *services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

type CreateProductRequest struct {
	Name        string `json:"name" validate:"required"`
	Price       int64  `json:"price" validate:"required,min=0"`
	CategoryID  uint   `json:"category_id" validate:"required"`
	Description string `json:"description"`
}

type UpdateProductRequest struct {
	Name        string `json:"name" validate:"required"`
	Price       int64  `json:"price" validate:"required,min=0"`
	IsAvailable bool   `json:"is_available"`
}

// Create handles new product creation
// Yeni ürün oluşturmayı yönetir
func (h *ProductHandler) Create(c *fiber.Ctx) error {
	var req CreateProductRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	product, err := h.service.CreateProduct(req.Name, req.Price, req.CategoryID, req.Description)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not create product")
	}

	return utils.Success(c, fiber.StatusCreated, string(constants.CODE_CREATED), "Product created successfully", product)
}

// GetAll returns products (optionally filtered by category)
// Ürünleri döndürür (opsiyonel olarak kategoriye göre filtrelenmiş)
func (h *ProductHandler) GetAll(c *fiber.Ctx) error {
	var categoryID *uint

	if catIDStr := c.Query("category_id"); catIDStr != "" {
		id, err := strconv.ParseUint(catIDStr, 10, 32)
		if err == nil {
			uid := uint(id)
			categoryID = &uid
		}
	}

	products, err := h.service.GetProducts(categoryID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not fetch products")
	}

	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Products retrieved", products)
}

// Update updates an existing product
// Mevcut bir ürünü günceller
func (h *ProductHandler) Update(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid product ID")
	}

	var req UpdateProductRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	product, err := h.service.UpdateProduct(uint(id), req.Name, req.Price, req.IsAvailable)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not update product")
	}

	return middleware.SuccessResponse(c, constants.CODE_UPDATED, "Product updated successfully", product)
}

// Delete handles product deletion
// Ürün silmeyi yönetir
func (h *ProductHandler) Delete(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID")
	}

	if err := h.service.DeleteProduct(uint(id)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not delete product")
	}

	return middleware.SuccessResponse(c, constants.CODE_DELETED, "Product deleted", nil)
}

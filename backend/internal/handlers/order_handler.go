package handlers

import (
	"fmt"
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	service *services.OrderService
}

func NewOrderHandler(s *services.OrderService) *OrderHandler {
	return &OrderHandler{service: s}
}

type CreateOrderRequest struct {
	TableID  *uint `json:"table_id"`
	WaiterID uint  `json:"waiter_id" validate:"required"`
}

// Create handles POST /orders
// Sipariş oluşturur
func (h *OrderHandler) Create(c *fiber.Ctx) error {
	var req CreateOrderRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	// Generate simple order number
	// Basit sipariş numarası oluştur
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().Unix())

	order, err := h.service.CreateOrder(req.TableID, req.WaiterID, orderNumber)
	if err != nil {
		// Could differentiate errors here if service returned typed errors
		return utils.BadRequestError(c, utils.CodeOK, err.Error())
	}

	return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Order created", order)
}

type CloseOrderRequest struct {
	PaymentMethod string `json:"payment_method" validate:"required,oneof=CASH CREDIT_CARD"`
}

// Close handles POST /orders/:id/close
// Siparişi kapatır
func (h *OrderHandler) Close(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Order ID")
	}

	var req CloseOrderRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	if err := h.service.CloseOrder(uint(id), req.PaymentMethod); err != nil {
		return utils.BadRequestError(c, utils.CodeTransactionFailed, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Order closed successfully", nil)
}

type AddItemRequest struct {
	ProductID uint   `json:"product_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1"`
	Note      string `json:"note"`
}

type UpdateItemRequest struct {
	Quantity int `json:"quantity" validate:"required,min=1"`
}

// AddItem adds an item to an order
// Siparişe ürün ekler
func (h *OrderHandler) AddItem(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Order ID")
	}

	var req AddItemRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	item, err := h.service.AddOrderItem(uint(id), req.ProductID, req.Quantity, req.Note)
	if err != nil {
		// Differentiating strict errors would be better, but generic 400/500 is ok for now.
		// Since validation happens in service (Closed order etc), 400 is often appropriate for business rule failure.
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Item added successfully", item)
}

// UpdateItem updates item quantity
// Ürün adedini günceller
func (h *OrderHandler) UpdateItem(c *fiber.Ctx) error {
	orderID, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Order ID")
	}
	itemID, err := c.ParamsInt("itemId")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Item ID")
	}

	var req UpdateItemRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	if err := h.service.UpdateItemQuantity(uint(orderID), uint(itemID), req.Quantity); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Item updated successfully", nil)
}

// RemoveItem removes an item from order
// Siparişten ürün siler
func (h *OrderHandler) RemoveItem(c *fiber.Ctx) error {
	orderID, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Order ID")
	}
	itemID, err := c.ParamsInt("itemId")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid Item ID")
	}

	if err := h.service.RemoveOrderItem(uint(orderID), uint(itemID)); err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Item removed successfully", nil)
}

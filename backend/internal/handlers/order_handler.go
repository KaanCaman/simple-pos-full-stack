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

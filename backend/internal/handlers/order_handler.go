package handlers

import (
	"fmt"
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"
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
		return err
	}

	// Generate simple order number
	// Basit sipariş numarası oluştur
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().Unix())

	order, err := h.service.CreateOrder(req.TableID, req.WaiterID, orderNumber)
	if err != nil {
		return err
	}

	return middleware.SuccessResponse(c, constants.CODE_CREATED, "Order created", order)
}

type CloseOrderRequest struct {
	PaymentMethod string `json:"payment_method" validate:"required,oneof=CASH CREDIT_CARD"`
}

// Close handles POST /orders/:id/close
// Siparişi kapatır
func (h *OrderHandler) Close(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid Order ID")
	}

	var req CloseOrderRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	if err := h.service.CloseOrder(uint(id), req.PaymentMethod); err != nil {
		return err
	}

	return middleware.SuccessResponse(c, constants.CODE_SUCCESS, "Order closed successfully", nil)
}

package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"

	"github.com/gofiber/fiber/v2"
)

type TransactionHandler struct {
	service *services.TransactionService
}

func NewTransactionHandler(service *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{service: service}
}

type AddExpenseRequest struct {
	Amount      int64  `json:"amount" validate:"required,min=1"`
	Description string `json:"description" validate:"required"`
	Category    string `json:"category" validate:"required"`
}

// AddExpense handles creation of a manual expense
// Manuel gider oluşturmayı yönetir
func (h *TransactionHandler) AddExpense(c *fiber.Ctx) error {
	var req AddExpenseRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	transaction, err := h.service.AddExpense(req.Amount, req.Description, req.Category)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not record expense")
	}

	return middleware.SuccessResponse(c, constants.CODE_CREATED, "Expense recorded successfully", transaction)
}

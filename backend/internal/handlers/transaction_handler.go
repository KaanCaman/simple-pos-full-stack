package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/constants"
	"simple-pos/pkg/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

type TransactionHandler struct {
	service *services.TransactionService
}

func NewTransactionHandler(service *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{service: service}
}

type AddExpenseRequest struct {
	Amount        int64  `json:"amount" validate:"required,min=1"`
	Description   string `json:"description" validate:"required"`
	Category      string `json:"category" validate:"required"`
	PaymentMethod string `json:"payment_method"`
}

// AddExpense handles creation of a manual expense
// Manuel gider oluşturmayı yönetir
func (h *TransactionHandler) AddExpense(c *fiber.Ctx) error {
	var req AddExpenseRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	transaction, err := h.service.AddExpense(req.Amount, req.Description, req.Category, req.PaymentMethod)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not record expense")
	}

	return utils.Success(c, fiber.StatusCreated, string(constants.CODE_CREATED), "Expense recorded successfully", transaction)
}

// ListExpenses returns expenses for a date range
func (h *TransactionHandler) ListExpenses(c *fiber.Ctx) error {
	// Default to last 30 days if not specified
	end := time.Now()
	start := end.AddDate(0, 0, -30)

	if startStr := c.Query("start_date"); startStr != "" {
		if parsed, err := time.Parse("2006-01-02", startStr); err == nil {
			start = parsed
		}
	}
	if endStr := c.Query("end_date"); endStr != "" {
		if parsed, err := time.Parse("2006-01-02", endStr); err == nil {
			end = parsed
		}
	}
	scope := c.Query("scope")

	expenses, err := h.service.ListExpenses(start, end, scope)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not fetch expenses")
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Expenses retrieved", expenses)
}

// UpdateExpenseRequest structure
type UpdateExpenseRequest struct {
	Amount      int64  `json:"amount" validate:"required,min=1"`
	Description string `json:"description" validate:"required"`
}

// UpdateExpense handles updating an expense
func (h *TransactionHandler) UpdateExpense(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid ID")
	}

	var req UpdateExpenseRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	updated, err := h.service.UpdateExpense(uint(id), req.Amount, req.Description)
	if err != nil {
		return utils.BadRequestError(c, utils.CodeTransactionFailed, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Expense updated", updated)
}

// DeleteExpense handles deleting an expense
func (h *TransactionHandler) DeleteExpense(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid ID")
	}

	if err := h.service.DeleteExpense(uint(id)); err != nil {
		return utils.BadRequestError(c, utils.CodeTransactionFailed, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Expense deleted", nil)
}

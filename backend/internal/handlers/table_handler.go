package handlers

import (
	"simple-pos/internal/middleware"
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type TableHandler struct {
	service *services.TableService
}

func NewTableHandler(service *services.TableService) *TableHandler {
	return &TableHandler{service: service}
}

type CreateTableRequest struct {
	Name string `json:"name" validate:"required"`
}

// CreateTable handles table creation
func (h *TableHandler) CreateTable(c *fiber.Ctx) error {
	var req CreateTableRequest
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	table, err := h.service.CreateTable(req.Name)
	if err != nil {
		// Assuming uniqueness constraint might fail
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Could not create table (Name might be duplicate)")
	}

	return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Table created", table)
}

// ListTables handles listing tables
func (h *TableHandler) ListTables(c *fiber.Ctx) error {
	tables, err := h.service.ListTables()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Could not fetch tables")
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Tables retrieved", tables)
}

// UpdateTable handles renaming
func (h *TableHandler) UpdateTable(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid ID")
	}

	var req CreateTableRequest // Reusing same struct as we only need Name
	if err := middleware.ValidateBody(c, &req); err != nil {
		return err
	}

	table, err := h.service.UpdateTable(uint(id), req.Name)
	if err != nil {
		return utils.BadRequestError(c, utils.CodeResourceNotFound, "Could not update table")
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Table updated", table)
}

// DeleteTable handles deleting a table
func (h *TableHandler) DeleteTable(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.BadRequestError(c, utils.CodeInvalidInput, "Invalid ID")
	}

	if err := h.service.DeleteTable(uint(id)); err != nil {
		// Could be occupied or not found
		return utils.BadRequestError(c, utils.CodeInvalidInput, err.Error())
	}

	return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Table deleted", nil)
}

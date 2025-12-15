package handlers

import (
	"simple-pos/internal/services"
	"simple-pos/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type UploadHandler struct {
	uploadService services.UploadService
}

func NewUploadHandler(uploadService services.UploadService) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
	}
}

// UploadProductImage handles product image upload
// Ürün resmi yüklemeyi yönetir
func (h *UploadHandler) UploadProductImage(c *fiber.Ctx) error {
	// Parse file
	file, err := c.FormFile("image")
	if err != nil {
		return utils.Error(c, fiber.StatusBadRequest, utils.CodeInvalidInput, "Image file is required")
	}

	// Save file via service
	fileURL, err := h.uploadService.SaveProductImage(file)
	if err != nil {
		return utils.Error(c, fiber.StatusBadRequest, utils.CodeInvalidInput, err.Error())
	}

	// Return success response
	return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Image uploaded successfully", fiber.Map{
		"url": fileURL,
	})
}

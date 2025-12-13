package utils

import "github.com/gofiber/fiber/v2"

// APIResponse is the standard envelope for all responses
// APIResponse tüm cevaplar için standart zarf yapısıdır
type APIResponse struct {
	// Success indicates whether the request was processed successfully
	// Success isteğin başarılı olup olmadığını belirtir
	Success bool `json:"success"`

	// Code is a machine-readable code from utils/codes.go
	// Code, utils/codes.go içindeki makine tarafından okunabilir koddur
	Code string `json:"code"`

	// Message is a human-readable description (can be localized on frontend)
	// Message, kullanıcıya gösterilecek açıklamadır (frontend tarafında lokalize edilebilir)
	Message string `json:"message"`

	// Data carries optional payload for successful responses
	// Data başarılı cevaplar için opsiyonel payload verisini taşır
	Data interface{} `json:"data,omitempty"`
}

// Success creates a successful JSON response
// Success başarılı bir JSON cevabı oluşturur
func Success(c *fiber.Ctx, status int, code, message string, data interface{}) error {
	return c.Status(status).JSON(APIResponse{
		Success: true,
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// Error creates an error JSON response
// Error bir hata JSON cevabı oluşturur
func Error(c *fiber.Ctx, status int, code, message string) error {
	return c.Status(status).JSON(APIResponse{
		Success: false,
		Code:    code,
		Message: message,
		Data:    nil,
	})

}

// ─────────────────────────────
// Legacy helper'lar (şimdilik)
// ─────────────────────────────

// JSONError returns a consistent error response (generic code)
// JSONError generic kodlu bir hata cevabı döndürür
func JSONError(c *fiber.Ctx, code string, status int, msg string) error {
	return Error(c, status, code, msg)
}

// BadRequestError shortcut for 400 errors
// BadRequestError 400 hataları için kısayol
func BadRequestError(c *fiber.Ctx, code, msg string) error {
	return Error(c, fiber.StatusBadRequest, code, msg)
}

// UnauthorizedError shortcut for 401
// UnauthorizedError 401 hataları için kısayol
func UnauthorizedError(c *fiber.Ctx, code, msg string) error {
	return Error(c, fiber.StatusUnauthorized, code, msg)
}

// NotFoundError shortcut for 404
// NotFoundError 404 hataları için kısayol
func NotFoundError(c *fiber.Ctx, code, msg string) error {
	return Error(c, fiber.StatusNotFound, code, msg)
}

// InternalError shortcut for 500
// InternalError 500 hataları için kısayol
func InternalError(c *fiber.Ctx, code, msg string) error {
	return Error(c, fiber.StatusInternalServerError, code, msg)
}

// TooManyRequestsError shortcut for 429
// TooManyRequestsError 429 hataları için kısayol
func TooManyRequestsError(c *fiber.Ctx, code, msg string) error {
	return Error(c, fiber.StatusTooManyRequests, code, msg)
}

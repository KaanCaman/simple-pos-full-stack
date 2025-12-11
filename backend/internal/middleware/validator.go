package middleware

import (
	"simple-pos/pkg/constants"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

// ErrorResponse represents a standardized error structure
// Standard hata yapılandırmasını temsil eder
type ErrorResponse struct {
	Success bool              `json:"success"`
	Code    constants.AppCode `json:"code"`
	Message string            `json:"message"`
	Errors  []ValidationError `json:"errors,omitempty"`
}

// ValidationError details for invalid fields
// Geçersiz alan detayları
type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Value   string `json:"value"`
	Message string `json:"message"`
}

// ValidateBody parses and validates the request body into the target struct
// İstek gövdesini ayrıştırır ve doğrular
func ValidateBody(c *fiber.Ctx, payload interface{}) error {
	// Parse body
	// Gövdeyi ayrıştır
	if err := c.BodyParser(payload); err != nil {
		return err
	}

	// Validate struct
	// Yapılandırmayı doğrula
	if err := validate.Struct(payload); err != nil {
		return err
	}

	return nil
}

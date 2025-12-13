package middleware

import (
	"errors"
	"fmt"

	"simple-pos/pkg/constants"
	"simple-pos/pkg/logger"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// ResponseWrapper standardizes success responses
// Başarı yanıtlarını standardize eder
type ResponseWrapper struct {
	Success bool              `json:"success"`
	Code    constants.AppCode `json:"code"`
	Message string            `json:"message"`
	Data    interface{}       `json:"data,omitempty"`
}

// SuccessResponse sends a standardized success response
// Standart başarı yanıtı gönderir
func SuccessResponse(c *fiber.Ctx, code constants.AppCode, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(ResponseWrapper{
		Success: true,
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// ErrorHandler is a global error handler for Fiber
// Fiber için global hata işleyici
func ErrorHandler(c *fiber.Ctx, err error) error {
	// Default error
	// Varsayılan hata
	code := fiber.StatusInternalServerError
	appCode := constants.CODE_INTERNAL_ERROR
	message := "Internal Server Error"

	// Parse Fiber Errors
	// Fiber hatalarını ayrıştır
	var e *fiber.Error
	if errors.As(err, &e) {
		code = e.Code
		message = e.Message
		switch code {
		case fiber.StatusNotFound:
			appCode = constants.CODE_NOT_FOUND
		case fiber.StatusForbidden:
			appCode = constants.CODE_FORBIDDEN
		case fiber.StatusUnauthorized:
			appCode = constants.CODE_UNAUTHORIZED
		}
	}

	// Handle Validation Errors
	// Doğrulama hatalarını işler
	var validationErrors []ValidationError
	if errs, ok := err.(validator.ValidationErrors); ok {
		code = fiber.StatusBadRequest
		appCode = constants.CODE_INVALID_INPUT
		message = "Input validation failed"
		for _, e := range errs {
			validationErrors = append(validationErrors, ValidationError{
				Field:   e.Field(),
				Tag:     e.Tag(),
				Value:   e.Param(),
				Message: fmt.Sprintf("Field '%s' failed validation '%s'", e.Field(), e.Tag()),
			})
		}

		return c.Status(code).JSON(ErrorResponse{
			Success: false,
			Code:    appCode,
			Message: message,
			Errors:  validationErrors,
		})
	}

	// Log the error
	// Hata logları
	logger.Error("Request failed",
		logger.String("method", c.Method()),
		logger.String("path", c.Path()),
		logger.Int("status", code),
		logger.Err(err),
	)

	return c.Status(code).JSON(ErrorResponse{
		Success: false,
		Code:    appCode,
		Message: message,
	})
}

// RecoverMiddleware recovers from panics and logs them
// Paniklerden kurtarır ve loglar
func RecoverMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				err, ok := r.(error)
				if !ok {
					err = fmt.Errorf("%v", r)
				}

				// Log the panic
				// Panik logları
				logger.Fatal("Panic recovered",
					logger.String("method", c.Method()),
					logger.String("path", c.Path()),
					logger.Err(err),
					logger.String("stack", "stack trace unavailable in abstraction yet"), // simplified for now
				)

				// Send error response
				// Hata yanıtı gönder
				c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
					Success: false,
					Code:    constants.CODE_INTERNAL_ERROR,
					Message: "Internal Server Error (Panic)",
				})
			}
		}()
		return c.Next()
	}
}

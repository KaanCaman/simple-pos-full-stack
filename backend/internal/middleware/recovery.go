package middleware

import (
	"runtime/debug"
	"simple-pos/pkg/constants"
	"simple-pos/pkg/logger"

	"github.com/gofiber/fiber/v2"
)

// RecoveryMiddleware handles panics and logs them with stack trace
// Panikleri yakalar ve stack trace ile loglar
func RecoveryMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				// Stack trace
				stack := string(debug.Stack())

				logger.Fatal("PANIC RECOVERED",
					logger.String("error", "panic"),
					logger.String("reason", "panic recovered"), // Simplified for field type match
					// logger.Any("reason", r) // Note: Interface fields not yet supported in abstract logger, using String helper for simplicity or we'd need Any
					logger.String("stack", stack),
				)

				// Return standardized error response
				c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
					Success: false,
					Code:    constants.CODE_INTERNAL_ERROR,
					Message: "Internal Server Error",
				})
			}
		}()
		return c.Next()
	}
}

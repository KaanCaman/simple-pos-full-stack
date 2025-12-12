package middleware

import (
	"simple-pos/pkg/constants"
	"simple-pos/pkg/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Protected verifies the JWT token
// JWT tokenını doğrular
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return ErrorResponseJSON(c, fiber.StatusUnauthorized, constants.CODE_UNAUTHORIZED, "Missing authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return ErrorResponseJSON(c, fiber.StatusUnauthorized, constants.CODE_UNAUTHORIZED, "Invalid authorization format")
		}

		tokenString := parts[1]

		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			return ErrorResponseJSON(c, fiber.StatusUnauthorized, constants.CODE_UNAUTHORIZED, "Invalid or expired token")
		}

		// Store in Locals for subsequent handlers
		c.Locals("userID", claims.UserID)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

// RequireRole enforces role-based access
// Rol tabanlı erişimi zorlar
func RequireRole(role string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("role")
		if userRole != role {
			return ErrorResponseJSON(c, fiber.StatusForbidden, constants.CODE_FORBIDDEN, "Insufficient permissions")
		}
		return c.Next()
	}
}

// Helper for standardized error response used within middleware
func ErrorResponseJSON(c *fiber.Ctx, status int, appCode constants.AppCode, message string) error {
	return c.Status(status).JSON(ErrorResponse{
		Success: false,
		Code:    appCode,
		Message: message,
	})
}

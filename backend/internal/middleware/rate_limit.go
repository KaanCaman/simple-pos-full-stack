package middleware

import (
	"time"

	"simple-pos/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimiter wraps fiber's limiter middleware
// Fiber'ın limiter middleware'ini sarmalar
func RateLimiter(max int, window time.Duration) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: window,
		LimitReached: func(c *fiber.Ctx) error {
			return utils.TooManyRequestsError(c, utils.CodeRateLimitExceeded, "Too many requests, please try again later")
		},
	})
}

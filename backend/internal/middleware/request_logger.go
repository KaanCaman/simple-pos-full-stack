package middleware

import (
	"simple-pos/pkg/logger"
	"time"

	"github.com/gofiber/fiber/v2"
)

// RequestLoggerMiddleware logs the details of each request
// Her isteğin detaylarını loglar
func RequestLoggerMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		latency := time.Since(start)
		status := c.Response().StatusCode()

		fields := []logger.Field{
			logger.String("method", c.Method()),
			logger.String("path", c.Path()),
			logger.Int("status", status),
			logger.String("latency", latency.String()),
			logger.String("ip", c.IP()),
		}

		if err != nil {
			fields = append(fields, logger.Err(err))
		}

		msg := "Incoming Request"

		if status >= 500 {
			logger.Error(msg, fields...)
		} else if status >= 400 {
			logger.Warn(msg, fields...)
		} else {
			logger.Info(msg, fields...)
		}

		return err
	}
}

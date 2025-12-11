package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// zapLogger implements Logger interface using Zap
// Zap kullanarak Logger arayüzünü uygulayan zapLogger
type zapLogger struct {
	logger *zap.Logger
}

// newZapLogger creates a new Zap logger instance
// Yeni bir Zap logger örneği oluşturur
func newZapLogger() Logger {
	config := zap.NewProductionEncoderConfig()
	config.EncodeTime = zapcore.ISO8601TimeEncoder
	config.EncodeLevel = zapcore.CapitalLevelEncoder

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		zapcore.Lock(os.Stdout),
		zapcore.InfoLevel,
	)

	l := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(2)) // Skip 2 levels (wrapper + global func)

	return &zapLogger{logger: l}
}

// toZapFields converts custom fields to Zap fields
// Özel alanları Zap alanlarına dönüştürür
func (l *zapLogger) toZapFields(fields []Field) []zap.Field {
	zapFields := make([]zap.Field, len(fields))
	for i, f := range fields {
		switch f.Type {
		case StringType:
			zapFields[i] = zap.String(f.Key, f.StringVal)
		case IntType:
			zapFields[i] = zap.Int(f.Key, f.IntVal)
		case BoolType:
			zapFields[i] = zap.Bool(f.Key, f.BoolVal)
		case ErrorType:
			zapFields[i] = zap.Error(f.ErrorVal)
		}
	}
	return zapFields
}

// Info logs an info message
// Bilgi mesajı loglar
func (l *zapLogger) Info(msg string, fields ...Field) {
	l.logger.Info(msg, l.toZapFields(fields)...)
}

// Error logs an error message
// Hata mesajı loglar
func (l *zapLogger) Error(msg string, fields ...Field) {
	l.logger.Error(msg, l.toZapFields(fields)...)
}

// Warn logs a warning message
// Uyarı mesajı loglar
func (l *zapLogger) Warn(msg string, fields ...Field) {
	l.logger.Warn(msg, l.toZapFields(fields)...)
}

// Debug logs a debug message
// Hata ayıklama mesajı loglar
func (l *zapLogger) Debug(msg string, fields ...Field) {
	l.logger.Debug(msg, l.toZapFields(fields)...)
}

// Fatal logs a fatal message and exits
// Ölümcül hata mesajı loglar ve çıkar
func (l *zapLogger) Fatal(msg string, fields ...Field) {
	l.logger.Fatal(msg, l.toZapFields(fields)...)
}

package logger

import (
	"os"
	"path/filepath"
	"simple-pos/pkg/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

// zapLogger implements Logger interface using Zap
// Zap kullanarak Logger arayüzünü uygulayan zapLogger
type zapLogger struct {
	logger *zap.Logger
}

// newZapLogger creates a new Zap logger instance
// Yeni bir Zap logger örneği oluşturur
func newZapLogger(cfg *config.Config) Logger {
	// 1. Ensure log directory exists
	// Log dizini varlığını kontrol et
	if err := os.MkdirAll(filepath.Dir(cfg.LogFilePath), 0755); err != nil {
		panic("failed to create log directory: " + err.Error())
	}

	// 2. Configure Encoder (Console - Human Readable)
	// Console için encoder ayarları
	consoleEncoderConfig := zap.NewProductionEncoderConfig()
	consoleEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEncoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)

	// 3. Configure Encoder (File - JSON Structured)
	// Dosya için encoder ayarları
	fileEncoderConfig := zap.NewProductionEncoderConfig()
	fileEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	fileEncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	fileEncoder := zapcore.NewJSONEncoder(fileEncoderConfig)

	// 4. Configure File Write Syncer (Lumberjack Rotation)
	// Dosya yazma senkronizasyonu (Lumberjack rotation)
	fileWriter := zapcore.AddSync(&lumberjack.Logger{
		Filename:   cfg.LogFilePath,
		MaxSize:    10, // megabytes
		MaxBackups: 5,
		MaxAge:     30,   // days
		Compress:   true, // disabled by default
	})

	// 5. Create Cores
	// Core'ları oluştur
	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), zapcore.InfoLevel),
		zapcore.NewCore(fileEncoder, fileWriter, zapcore.InfoLevel),
	)

	// 6. Create Logger
	// Logger'ı oluştur
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

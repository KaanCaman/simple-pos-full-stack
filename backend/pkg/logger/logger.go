package logger

var globalLogger Logger

// InitLogger initializes the global logger with the default adapter (Zap)
// Loglayıcıyı başlatır
func InitLogger() {
	globalLogger = newZapLogger()
	globalLogger.Info("Logger initialized successfully")
}

// SetLogger allows injecting a custom logger implementation
func SetLogger(l Logger) {
	globalLogger = l
}

// Info logs an info message
// Bilgi mesajı loglar
func Info(message string, fields ...Field) {
	if globalLogger == nil {
		return
	}
	globalLogger.Info(message, fields...)
}

// Error logs an error message
// Hata mesajı loglar
func Error(message string, fields ...Field) {
	if globalLogger == nil {
		return
	}
	globalLogger.Error(message, fields...)
}

// Warn logs a warning message
// Uyarı mesajı loglar
func Warn(message string, fields ...Field) {
	if globalLogger == nil {
		return
	}
	globalLogger.Warn(message, fields...)
}

// Debug logs a debug message
// Hata ayıklama mesajı loglar
func Debug(message string, fields ...Field) {
	if globalLogger == nil {
		return
	}
	globalLogger.Debug(message, fields...)
}

// Fatal logs a fatal message and exits
// Ölümcül hata mesajı loglar ve çıkar
func Fatal(message string, fields ...Field) {
	if globalLogger == nil {
		return
	}
	globalLogger.Fatal(message, fields...)
}

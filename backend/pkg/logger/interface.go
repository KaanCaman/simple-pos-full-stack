package logger

// FieldType defines the type of a log field
// Log alanının türünü tanımlar
type FieldType int

const (
	StringType FieldType = iota
	IntType
	BoolType
	ErrorType
)

// Field represents a key-value pair for structured logging
// Yapılandırılmış günlük bir anahtar-değer çiftini temsil eder
type Field struct {
	Key       string
	Type      FieldType
	StringVal string
	IntVal    int
	BoolVal   bool
	ErrorVal  error
}

// Logger interface defines the contract for logging adapters
// Loglama adaptörlerinin sözleşmeünü tanımlar
type Logger interface {
	Info(msg string, fields ...Field)
	Error(msg string, fields ...Field)
	Warn(msg string, fields ...Field)
	Debug(msg string, fields ...Field)
	Fatal(msg string, fields ...Field)
}

// Field Constructors
// Log alanlarını oluşturur
func String(key, val string) Field {
	return Field{Key: key, Type: StringType, StringVal: val}
}

func Int(key string, val int) Field {
	return Field{Key: key, Type: IntType, IntVal: val}
}

func Bool(key string, val bool) Field {
	return Field{Key: key, Type: BoolType, BoolVal: val}
}

func Err(err error) Field {
	return Field{Key: "error", Type: ErrorType, ErrorVal: err}
}

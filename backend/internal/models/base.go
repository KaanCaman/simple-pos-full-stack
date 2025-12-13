package models

import (
	"time"

	"gorm.io/gorm"
)

// BaseModel defines common columns for all models
// Tüm modeller için ortak sütunları tanımlar
type BaseModel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

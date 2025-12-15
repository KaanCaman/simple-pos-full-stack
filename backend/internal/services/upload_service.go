package services

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// UploadService handles file upload logic
// Dosya yükleme mantığını yönetir
type UploadService interface {
	SaveProductImage(file *multipart.FileHeader) (string, error)
}

type uploadService struct {
	uploadDir string
}

// NewUploadService creates a new instance of UploadService
// Yeni bir UploadService örneği oluşturur
func NewUploadService() UploadService {
	// Ensure directory exists
	// Dizinlerin var olduğundan emin ol
	path := "uploads/products"
	if _, err := os.Stat(path); os.IsNotExist(err) {
		_ = os.MkdirAll(path, 0755)
	}

	return &uploadService{
		uploadDir: "uploads/products",
	}
}

// SaveProductImage validates and saves a product image
// Ürün resmini doğrular ve kaydeder
func (s *uploadService) SaveProductImage(file *multipart.FileHeader) (string, error) {
	// 1. Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return "", fmt.Errorf("file size exceeds 5MB limit")
	}

	// 2. Validate content type
	contentType := file.Header.Get("Content-Type")
	if !isValidImageType(contentType) {
		return "", fmt.Errorf("invalid file type: %s. Only jpeg, png, and webp are allowed", contentType)
	}

	// 3. Generate unique filename
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		// Fallback extension based on content type if missing
		// Eğer uzantı yoksa içerik tipine göre yedek uzantı
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/webp":
			ext = ".webp"
		}
	}

	newFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dstPath := filepath.Join(s.uploadDir, newFilename)

	// 4. Save file to disk
	// Since we are in the service layer and don't have *fiber.Ctx, we need to read/write manually or pass the logic up.
	// However, standard clean architecture usually keeps framework stuff out of services.
	// But Fiber's SaveFile is convenient.
	// To keep it pure, we might want the handler to handle the actual saving, but the service to determine the path.
	// OR we can just use standard 'io' copy here if we wanted to be pure.
	// For simplicity in this project context, I will accept *multipart.FileHeader working here,
	// but actually saving it requires opening it.

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err = dst.ReadFrom(src); err != nil {
		return "", err
	}

	// Return relative path for URL
	return fmt.Sprintf("/%s/%s", s.uploadDir, newFilename), nil
}

func isValidImageType(contentType string) bool {
	allowed := []string{"image/jpeg", "image/png", "image/webp", "image/jpg"}
	for _, t := range allowed {
		if strings.HasPrefix(contentType, t) {
			return true
		}
	}
	return false
}

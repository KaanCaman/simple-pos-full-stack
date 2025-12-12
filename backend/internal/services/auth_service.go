package services

import (
	"errors"
	"simple-pos/internal/repositories"
	"simple-pos/pkg/logger"
	"simple-pos/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo repositories.UserRepository
}

func NewAuthService(userRepo repositories.UserRepository) *AuthService {
	return &AuthService{
		userRepo: userRepo,
	}
}

// Login verifies PIN and returns JWT token
// PIN'i doğrular ve JWT token döner
func (s *AuthService) Login(userID uint, pin string) (string, error) {
	// 1. Find User
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		logger.Warn("Login failed: User not found", logger.Int("user_id", int(userID)))
		return "", errors.New("invalid credentials")
	}

	// 2. Verify PIN (Hash)
	if err := bcrypt.CompareHashAndPassword([]byte(user.PinCode), []byte(pin)); err != nil {
		logger.Warn("Login failed: Invalid PIN", logger.Int("user_id", int(userID)))
		return "", errors.New("invalid credentials")
	}

	// 3. Generate JWT
	return utils.GenerateToken(user.ID, user.Role)
}

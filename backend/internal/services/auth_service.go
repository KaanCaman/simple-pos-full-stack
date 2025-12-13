package services

import (
	"errors"
	"simple-pos/internal/models"
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

// Login verifies Password and returns JWT token
// Şifreyi doğrular ve JWT token döner
func (s *AuthService) Login(username string, password string) (user *models.User, token string, err error) {
	// 1. Find User by Username
	user, err = s.userRepo.FindByUsername(username)
	if err != nil {
		logger.Warn("Login failed: User not found", logger.String("username", username))
		return nil, "", errors.New("invalid credentials")
	}

	if !user.IsActive {
		logger.Warn("Login failed: User is inactive", logger.String("username", username))
		return nil, "", errors.New("account is disabled")
	}

	// 2. Verify Password (Hash) - originally PinCode
	if err := bcrypt.CompareHashAndPassword([]byte(user.PinCode), []byte(password)); err != nil {
		logger.Warn("Login failed: Invalid Password", logger.String("username", username))
		return nil, "", errors.New("invalid credentials")
	}

	// 3. Generate JWT
	token, err = utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		logger.Warn("Login failed: Token generation failed", logger.String("username", username))
		return nil, "", errors.New("token generation failed")
	}
	return user, token, nil
}

// GetUser returns user by ID
// ID ile kullanıcı döndürür
func (s *AuthService) GetUser(id uint) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

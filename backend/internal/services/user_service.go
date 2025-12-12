package services

import (
	"errors"
	"simple-pos/internal/models"
	"simple-pos/internal/repositories"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// CreateUser handles the creation of a new user with hashed PIN
// Yeni bir kullanıcı oluşturur (PIN hashlenir)
func (s *UserService) CreateUser(name, pin, role string) (*models.User, error) {
	// 1. Hash PIN
	hashedPin, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash pin")
	}

	// 2. Create User Model
	user := &models.User{
		Name:     name,
		PinCode:  string(hashedPin),
		Role:     role,
		IsActive: true,
	}

	// 3. Save to DB
	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

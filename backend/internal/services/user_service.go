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

// GetUsers returns all users
// Tüm kullanıcıları döndürür
func (s *UserService) GetUsers() ([]models.User, error) {
	return s.repo.FindAll()
}

// GetUserByID returns a user by ID
// ID ile kullanıcı döndürür
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	return s.repo.FindByID(id)
}

// UpdateUser updates user details (excluding PIN for now, kept separate)
// Kullanıcı detaylarını günceller (PIN hariç, ayrı tutulur)
func (s *UserService) UpdateUser(id uint, name, role string, isActive bool) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.Role = role
	user.IsActive = isActive

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

// DeleteUser performs a soft delete on a user
// Kullanıcıyı siler (soft delete)
func (s *UserService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}

// ChangePin updates the user's PIN
// Kullanıcı PIN'ini günceller
func (s *UserService) ChangePin(id uint, newPin string) error {
	// 1. Hash new PIN
	hashedPin, err := bcrypt.GenerateFromPassword([]byte(newPin), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash pin")
	}

	// 2. Get User
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	// 3. Update PIN
	user.PinCode = string(hashedPin)
	return s.repo.Update(user)
}

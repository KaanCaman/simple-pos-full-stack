package utils

import (
	"errors"
	"simple-pos/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Secret key used to sign the JWT tokens
// JWT tokenlarını imzalamak için kullanılan gizli anahtar
var JwtSecret []byte

// InitJWT initializes the secret key
// Gizli anahtarı başlatır
func InitJWT(secret string) {
	JwtSecret = []byte(secret)
}

// GenerateToken creates a signed JWT token containing the user ID and Role
// Kullanıcı ID'si ve Rolü içeren imzalı bir JWT token üretir
func GenerateToken(userID uint, role string) (string, error) {
	// Claims represent the data stored inside the token (payload)
	// Claims, token içinde saklanan verilerdir (payload)
	expirationTime := time.Now().Add(24 * time.Hour) // 1 Day expiration

	claims := &models.JWTClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "system-backend",
		},
	}

	// Create a new token with the given claims and signing method
	// Claims ve imzalama metodu ile yeni bir token oluştur
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token using the secret key and return as a string
	// Token’ı gizli anahtarla imzala ve string olarak geri döndür
	return token.SignedString(JwtSecret)
}

// ParseToken verifies the token and returns the claims
// Token'ı doğrular ve claimleri döner
func ParseToken(tokenString string) (*models.JWTClaims, error) {
	claims := &models.JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

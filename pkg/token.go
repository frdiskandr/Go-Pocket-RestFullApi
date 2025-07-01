package pkg

import (
	"fmt"
	"time"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key") // ganti dengan secret yang aman

type JwtClaims struct {
	Id   uint
	Name string
	Email string
	PhoneNumber string
	jwt.RegisteredClaims
}

// CreateToken membuat JWT dengan expiry 1 jam
func CreateToken(user *models.User) (string, error) {
	claims := JwtClaims{
		Id:   user.ID,
		Name: user.Name,
		Email: user.Email,
		PhoneNumber: user.PhoneNumber,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
			Issuer:    "go-pocket",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}

// VerifyToken memverifikasi dan mengembalikan claim jika token valid
func VerifyToken(tokenString string) (*JwtClaims, error) {
	claims := &JwtClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}



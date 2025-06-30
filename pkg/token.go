package pkg

import (
	"errors"
	"time"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key") // ganti dengan secret yang aman

// CreateToken membuat JWT dengan expiry 1 jam
func CreateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"id": user.ID,
		"name": user.Name,
		"phoneNumber": user.PhoneNumber,
		"exp":     time.Now().Add(time.Hour * 1).Unix(), // expired dalam 1 jam
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}

// VerifyToken memverifikasi dan mengembalikan claim jika token valid
func VerifyToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// pastikan metode signing cocok
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Ambil claims jika token valid
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, errors.New("invalid token")
	}
}
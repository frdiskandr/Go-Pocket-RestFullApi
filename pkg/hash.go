package pkg

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword mengenkripsi password user
func HashPassword(password string) (string) {
	bytes, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes)
}

// CheckPassword membandingkan password input dengan hash di database
func CheckPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}
package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name string	`json:"name"`
	Email string`json:"email"`
	PhoneNumber string	`json:"phoneNumber"`
	Password string	`json:"password"`
}

package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name        string `json:"name" validate:"required,max=100"`
	Email       string `json:"email" validate:"required"`
	PhoneNumber string `json:"phoneNumber" validate:"required,max=30"`
	Password    string `json:"password" validate:"required"`
	Wallet      *Wallet `gorm:"foreignKey:UserID; reference:ID"`
}

type UserLogin struct {
	Name     string `json:"name" validate:"required,max=100"`
	Password string `json:"password" validate:"required"`
}

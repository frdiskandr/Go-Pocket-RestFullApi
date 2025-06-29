package models

import "gorm.io/gorm"

type Wallet struct {
	gorm.Model
	UserID uint	`json:"userId"`
	Balance float64	`json:"balance"`
	Curency string	`json:"curency"`
}
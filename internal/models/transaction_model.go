package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	FromWalletID uint `json:"from"`
	ToWalletID   uint	`json:"to"`
	Amount       float64`json:"amount"`
	Type         uint8 `json:"type"`
	TimeStamp    time.Time 
}

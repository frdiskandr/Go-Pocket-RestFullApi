package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	FromWalletID uint `json:"from" gorm:"index"`
	ToWalletID   uint	`json:"to" gorm:"index"`	
	Amount       float64`json:"amount"`
	Type         uint8 `json:"type"`
	TimeStamp    time.Time 
}

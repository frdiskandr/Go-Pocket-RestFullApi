package models

import "gorm.io/gorm"

type Wallet struct {
	gorm.Model
	UserID uint	`json:"userId"` 
	Balance float64	`json:"balance"`
	Curency string	`json:"curency"`
}

type WalletTopup struct {
	Balance float64 `json:"balance" validate:"required"`
}

type WalletTransfer struct{
	ToPhoneNumber string `json:"tophonenumber" validate:"required"`
	Balance float64 `json:"balance" validate:"required"`

}
package controllers

import (
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/middleware"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models/validate"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/pkg"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type WalletControllers struct {
	db *gorm.DB
}

func NewWalletControllers(db *gorm.DB) *WalletControllers {
	return &WalletControllers{
		db: db,
	}
}

func (wc *WalletControllers) Index(c *fiber.Ctx) error {
	var wallet = &models.Wallet{}

	token := c.Locals(middleware.Token).(*pkg.JwtClaims)

	if err := wc.db.First(&wallet, "user_id = ?", token.Id).Error; err != nil {
		dataWallet := models.Wallet{
			UserID:  token.Id,
			Balance: 0,
			Curency: "IDR",
		}
		wc.db.Create(&dataWallet)
		wc.db.First(&wallet, "user_id = ?", token.Id)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "StatusOK!",
		"Data":    wallet,
	})
}

func (wc *WalletControllers) Topup(c *fiber.Ctx) error {
	var balance = models.WalletTopup{}
	var wallet = models.Wallet{}

	token := c.Locals(middleware.Token).(*pkg.JwtClaims)
	c.BodyParser(&balance)
	if err := validate.IsValid(balance); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Bad Request!",
			"Error":   err,
		})
	}
	if balance.Balance <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Transfer Fail!",
			"Error":   "Balance < 0",
		})
	}

	// start transaction
	tx := wc.db.Begin()
	tx.First(&wallet, "user_id = ?", token.Id)
	wallet.Balance += balance.Balance
	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"Message": "Fail!",
			"Error":   "Internal Server Error!",
		})
	}
	tx.Commit()
	var transaction = models.Transaction{
		FromWalletID: 0000,
		ToWalletID:   wallet.UserID,
		Amount:       balance.Balance,
		Type:         0, // type 0 for topup
	}

	go wc.db.Create(&transaction)

	wc.db.First(&wallet, "user_id = ?", token.Id)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "Success!",
		"Data": map[string]interface{}{
			"Username":   token.Name,
			"TopUp":      balance.Balance,
			"BalanceNow": wallet.Balance,
		},
	})
}

func (wc *WalletControllers) Transfer(c *fiber.Ctx) error {
	token := c.Locals(middleware.Token).(*pkg.JwtClaims)
	var request = models.WalletTransfer{}
	c.BodyParser(&request)
	if err := validate.IsValid(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Bad Request!",
			"Error":   err,
		})
	}

	var recipientUser = models.User{}
	var recipientWallet = models.Wallet{}
	if err := wc.db.First(&recipientUser, "phone_number = ?", request.ToPhoneNumber).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"Message": "Not Found!",
			"Error":   "PhoneNumber Not Found!",
		})
	}
	var sendingWallet = models.Wallet{}
	wc.db.First(&sendingWallet, "user_id = ?", token.Id)
	if request.Balance > sendingWallet.Balance {
		return c.Status(fiber.StatusExpectationFailed).JSON(fiber.Map{
			"Message": "Fail!",
			"Error":   "Balance Not Enough!",
		})
	}

	wc.db.First(&recipientWallet, "user_id = ?", recipientUser.ID)
	recipientWallet.Balance += request.Balance
	sendingWallet.Balance -= request.Balance

	tx := wc.db.Begin()
	err := tx.Save(&recipientWallet).Error
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusExpectationFailed).JSON(fiber.Map{
			"Message": "Fail!",
		})
	}
	err = tx.Save(&sendingWallet).Error
	if err != nil {
		return c.Status(fiber.StatusExpectationFailed).JSON(fiber.Map{
			"Message": "Fail!",
		})
	}

	var history = models.Transaction{
		FromWalletID: sendingWallet.UserID,
		ToWalletID:   recipientWallet.UserID,
		Amount:       request.Balance,
		Type:         1, // type 1 for transfer
	}
	tx.Create(&history)
	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "StatusOK!",
		"From":    token.Name,
		"TO":      recipientUser.Name,
	})
}

func (wc *WalletControllers) History(c *fiber.Ctx) error {
	token := c.Locals(middleware.Token).(*pkg.JwtClaims)

	var sendHistory = models.Transaction{}
	var recipientHistory = models.Transaction{}

	wc.db.Where("from_wallet_id = ?", &token.Id).Find(&sendHistory)
	wc.db.Where("to_wallet_id = ?", &token.Id).Find(&recipientHistory)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":        "StatusOK!",
		"Data Send":      sendHistory,
		"Data Recipient": recipientHistory,
	})
}

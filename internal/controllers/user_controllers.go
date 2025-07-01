package controllers

import (
	"log"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/middleware"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models/validate"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/pkg"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type UserControllers struct {
	db *gorm.DB
}

func NewUserControllers(db *gorm.DB) *UserControllers {
	return &UserControllers{
		db: db,
	}
}

func (uc *UserControllers) Register(c *fiber.Ctx) error {
	var user = models.User{}
	c.BodyParser(&user)

	if err := validate.IsValid(user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Bad Request!",
			"Error":   err,
		})
	} 
	err := uc.db.First(&user, "name = ? OR phone_number = ?", &user.Name, &user.PhoneNumber).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Username/phoneNumber Already Take!",
			"err":     err,
		})
	}

	password := &user.Password
	hashPassword := pkg.HashPassword(*password)
	user.Password = hashPassword
	// create user
	uc.db.Create(&user)
	// find user has created
	uc.db.First(&user, "name = ?", user.Name)
	// created wallet
	var wallet = models.Wallet{
		UserID: user.ID,
		Balance: 0,
		Curency: "IDR",
	}
	uc.db.Create(&wallet)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"Message":  "Created!",
		"UserName": user.Name,
		"walletID": user.ID, 
	})
}

func (uc *UserControllers) Login(c *fiber.Ctx) error {
	var user = models.UserLogin{}
	var userFromDb = models.User{}
	c.BodyParser(&user)

	if err := validate.IsValid(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Bad Request!",
			"Error":   err,
		})
	}

	if err := uc.db.First(&userFromDb, "name = ?", user.Name).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Username/Password Wrong!",
		})
	}

	if err := pkg.CheckPassword(userFromDb.Password, user.Password); !err {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"Message": "Username/Password Wrong!",
		})
	}

	token, _ := pkg.CreateToken(&userFromDb)
	log.Println(userFromDb)
	c.Set("token", token)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "Ok!",
		"token":   token,
	})
}

func (uc *UserControllers) Find(c *fiber.Ctx) error {
	var user = &models.User{}
	
	token := c.Locals(middleware.Token).(*pkg.JwtClaims)

	uc.db.First(&user, &token.Id)
	user.Password = ""

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "StatusOk!",
		"Data": user,
	})
}

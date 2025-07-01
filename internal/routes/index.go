package routes

import (
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/config"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/controllers"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func Index(route fiber.Router) {
	databases := &config.DB
	UserController := controllers.NewUserControllers(*databases)
	WalletController := controllers.NewWalletControllers(*databases)
	//index
	route.Post("/register", UserController.Register)
	route.Post("/login", UserController.Login)
	//user
	user := route.Group("/users")
	user.Use(middleware.AuthMiddleware)
	user.Get("/me", UserController.Find)
	//wallet
	wallet := route.Group("/wallet")
	wallet.Use(middleware.AuthMiddleware)
	wallet.Get("/", WalletController.Index)
	wallet.Post("/topup", WalletController.Topup)
	wallet.Post("/transfer", WalletController.Transfer)
	wallet.Get("/history", WalletController.History)
}

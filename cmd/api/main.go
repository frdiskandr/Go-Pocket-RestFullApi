package main

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

func main() {
	//init App
	app := fiber.New(fiber.Config{
		IdleTimeout: 1 * time.Minute,
	})

	//Middleware

	//Routes


	//Server Start
	PORT := os.Getenv("PORT"); if PORT == ""{
		PORT = "3000"
	}
	log.Println(app.Listen(":"+ PORT))
}
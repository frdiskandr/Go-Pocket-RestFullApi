package main

import (
	"log"
	"os"
	"time"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/config"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	//init App
	app := fiber.New(fiber.Config{
		IdleTimeout: 1 * time.Minute,
	})
	config.Load()

	//Middleware
	app.Use(cors.New(cors.Config{}))

	//Routes
	v1 := app.Group("/api/v1")
	routes.Index(v1)

	//Server Start
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "3000"
	}
	log.Println(app.Listen(":" + PORT))
}

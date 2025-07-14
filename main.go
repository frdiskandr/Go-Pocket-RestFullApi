package main

import (
	"log"
	"os"
	"time"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/config"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
)

func main() {
	//init App
	app := fiber.New(fiber.Config{
		IdleTimeout: 1 * time.Minute,
	})
	config.Load()

	//Middleware
	app.Use(cors.New())

	//Routes
	v1 := app.Group("/api/v1")
	routes.Index(v1)

	app.Static("/", "./public")

	app.Get("/documentation/*", swagger.New(swagger.Config{
		URL:          "/swagger.json", // The url to the API spec
		DeepLinking:  false,
		DocExpansion: "none",
	}))

	//Server Start
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "3000"
	}
	log.Println(app.Listen(":" + PORT))
}

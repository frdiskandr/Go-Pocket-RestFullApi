package middleware

import (
	"github.com/frdiskndr/Go-Pocket-RestFullApi/pkg"
	"github.com/gofiber/fiber/v2"
)

type keyLocals interface{}
var Token keyLocals

func AuthMiddleware(c *fiber.Ctx) error{
	token := c.Get("Authorization", "")
	if(token == ""){
		c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"Message": "Unauthorized",
		})
	}

	validate, err := pkg.VerifyToken(token)
	if err != nil {
		c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"Message": "Unauthorized",
			"Error": err,
		})
	}

	c.Locals(Token, validate)
	return c.Next()
}
package middleware

import "github.com/gofiber/fiber/v2"

type keyLocals interface{}
var Token keyLocals

func AuthMiddleware(c *fiber.Ctx) error{
	token := c.Get("Bearier", "")
	if(token == ""){
		c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}

	c.Locals(Token, token)
	return c.Next()
}
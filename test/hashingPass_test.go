package test

import (
	"testing"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/pkg"
	"github.com/stretchr/testify/assert"
)

func TestPassHash(t *testing.T) {
	reqPass := "password123"
	hashing := pkg.HashPassword(reqPass)

	compare := pkg.CheckPassword(hashing, reqPass)

	assert.Equal(t, true, compare, "not equal")
}

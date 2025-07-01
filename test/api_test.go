package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http/httptest"
	"testing"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/config"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestApp adalah fungsi pembantu untuk menginisialisasi aplikasi Fiber
// dan database SQLite in-memory untuk setiap pengujian.
// Ini memastikan setiap tes berjalan di lingkungan yang bersih.
func setupTestApp() *fiber.App {
	// Gunakan SQLite in-memory untuk database pengujian.
	// `cache=shared` penting untuk menjaga koneksi tetap hidup.
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal terhubung ke database pengujian: %v", err)
	}

	// Migrasi tabel
	db.AutoMigrate(&models.User{}, &models.Wallet{}, &models.Transaction{})

	// Ganti DB global di config dengan DB pengujian kita
	config.DB = db

	// Setup aplikasi Fiber
	app := fiber.New()
	v1 := app.Group("/api/v1")
	routes.Index(v1)

	return app
}

// TestUserRegistrationAndLogin menguji alur registrasi dan login.
func TestUserRegistrationAndLogin(t *testing.T) {
	app := setupTestApp()

	// --- Kasus 1: Registrasi Sukses ---
	t.Run("Registrasi Sukses", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":        "testuser",
			"email":       "test@example.com",
			"phoneNumber": "081234567890",
			"password":    "password123",
		})

		req := httptest.NewRequest("POST", "/api/v1/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, res.StatusCode, "Seharusnya mendapatkan status 201 Created")
	})

	// --- Kasus 2: Registrasi Gagal (Username sudah ada) ---
	t.Run("Registrasi Gagal - Username Duplikat", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":        "testuser",
			"email":       "test2@example.com",
			"phoneNumber": "081111111111",
			"password":    "password123",
		})

		req := httptest.NewRequest("POST", "/api/v1/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, res.StatusCode, "Seharusnya mendapatkan status 400 Bad Request")
	})

	// --- Kasus 3: Login Sukses ---
	t.Run("Login Sukses", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":     "testuser",
			"password": "password123",
		})

		req := httptest.NewRequest("POST", "/api/v1/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode, "Seharusnya mendapatkan status 200 OK")

		// Periksa apakah ada token di response body
		var responseBody map[string]interface{}
		json.NewDecoder(res.Body).Decode(&responseBody)
		assert.NotEmpty(t, responseBody["token"], "Respons login harus mengandung token")
	})

	// --- Kasus 4: Login Gagal (Password Salah) ---
	t.Run("Login Gagal - Password Salah", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":     "testuser",
			"password": "passwordsalah",
		})

		req := httptest.NewRequest("POST", "/api/v1/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, res.StatusCode, "Seharusnya mendapatkan status 400 Bad Request")
	})
}

// TestWalletFlow menguji seluruh alur transaksi dompet yang memerlukan otentikasi.
func TestWalletFlow(t *testing.T) {
	app := setupTestApp()

	// --- Helper Function: Buat User dan Login untuk mendapatkan token ---
	createAndLoginUser := func(name, email, phone, password string) string {
		// Register
		regBody, _ := json.Marshal(map[string]string{"name": name, "email": email, "phoneNumber": phone, "password": password})
		regReq := httptest.NewRequest("POST", "/api/v1/register", bytes.NewBuffer(regBody))
		regReq.Header.Set("Content-Type", "application/json")
		app.Test(regReq)

		// Login
		logBody, _ := json.Marshal(map[string]string{"name": name, "password": password})
		logReq := httptest.NewRequest("POST", "/api/v1/login", bytes.NewBuffer(logBody))
		logReq.Header.Set("Content-Type", "application/json")
		res, _ := app.Test(logReq)

		var responseBody map[string]interface{}
		json.NewDecoder(res.Body).Decode(&responseBody)
		return responseBody["token"].(string)
	}

	// --- Setup: Buat dua user dan dapatkan token mereka ---
	tokenUserA := createAndLoginUser("userA", "usera@example.com", "081000000001", "passwordA")
	tokenUserB := createAndLoginUser("userB", "userb@example.com", "081000000002", "passwordB")
	assert.NotEmpty(t, tokenUserA)
	assert.NotEmpty(t, tokenUserB)

	// --- Kasus 1: User A top-up saldo ---
	t.Run("Topup Sukses", func(t *testing.T) {
		topupBody, _ := json.Marshal(map[string]float64{"balance": 50000})
		req := httptest.NewRequest("POST", "/api/v1/wallet/topup", bytes.NewBuffer(topupBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("token", tokenUserA) // Gunakan token User A

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode)

		var responseBody map[string]interface{}
		json.NewDecoder(res.Body).Decode(&responseBody)
		data := responseBody["Data"].(map[string]interface{})
		assert.Equal(t, float64(50000), data["BalanceNow"])
	})

	// --- Kasus 2: User A transfer ke User B ---
	t.Run("Transfer Sukses", func(t *testing.T) {
		transferBody, _ := json.Marshal(map[string]interface{}{"tophonenumber": "081000000002", "balance": 15000})
		req := httptest.NewRequest("POST", "/api/v1/wallet/transfer", bytes.NewBuffer(transferBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("token", tokenUserA) // User A sebagai pengirim

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode, "Transfer seharusnya berhasil")
	})

	// --- Kasus 3: Cek saldo User A setelah transfer ---
	t.Run("Cek Saldo Pengirim Setelah Transfer", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/wallet/", nil)
		req.Header.Set("token", tokenUserA)

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode)

		var responseBody map[string]interface{}
		json.NewDecoder(res.Body).Decode(&responseBody)
		data := responseBody["Data"].(map[string]interface{})
		// Saldo awal 50000 - transfer 15000 = 35000
		assert.Equal(t, float64(35000), data["balance"])
	})

	// --- Kasus 4: Cek saldo User B setelah menerima transfer ---
	t.Run("Cek Saldo Penerima Setelah Transfer", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/wallet/", nil)
		req.Header.Set("token", tokenUserB)

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode)

		var responseBody map[string]interface{}
		json.NewDecoder(res.Body).Decode(&responseBody)
		data := responseBody["Data"].(map[string]interface{})
		// Saldo awal 0 + transfer 15000 = 15000
		assert.Equal(t, float64(15000), data["balance"])
	})

	// --- Kasus 5: Cek riwayat transaksi ---
	t.Run("Cek Riwayat Transaksi", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/wallet/history", nil)
		req.Header.Set("token", tokenUserA)

		res, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, res.StatusCode)

		bodyBytes, _ := io.ReadAll(res.Body)
		fmt.Println("History Response:", string(bodyBytes)) // Cetak untuk debug
		// Anda bisa menambahkan assertion yang lebih spesifik di sini
	})
}

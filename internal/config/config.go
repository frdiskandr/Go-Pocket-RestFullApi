package config

import (
	"log"
	"os"

	"github.com/frdiskndr/Go-Pocket-RestFullApi/internal/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Global Var DB
var DB *gorm.DB

func Load() {
	// load env file
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Println("Load_Env Status Err: ", err)
	}

	//databases con
	var dsn string
	status := os.Getenv("STATUS")
	if status == "Production" {
		dsn = os.Getenv("DsnProd")
	} else {
		dsn = os.Getenv("DsnLocal")
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
	}))

	if err != nil {
		log.Panicln("Databases Connection Err: ", err)
	}

	//migration
	err = db.AutoMigrate(&models.Transaction{}, &models.User{}, &models.Wallet{})
	if err != nil {
		log.Println("Databases Migrate Err: ", err)
	}

	//log
	if err == nil {
		log.Println("Databases Con && Migrate: StatusOK!")
	}
	// export db to global var DB
	DB = db
}

# Go Pocket - RESTful API E-Wallet

Proyek ini adalah aplikasi E-Wallet sederhana yang dibangun dengan Go (Fiber) untuk backend dan React untuk frontend. Aplikasi ini memungkinkan pengguna untuk mendaftar, masuk, melakukan top-up, mentransfer dana, dan melihat riwayat transaksi.

## Fitur

- **Backend (Go/Fiber)**
  - RESTful API
  - Otentikasi menggunakan JWT (JSON Web Tokens)
  - GORM dengan database SQLite
  - Dokumentasi API dengan Swagger
  - Konfigurasi environment dengan file `.env`

- **Frontend (React/Vite)**
  - Halaman Login & Register
  - Dashboard untuk melihat saldo dan profil
  - Fungsionalitas Top-up dan Transfer dana
  - Halaman untuk melihat riwayat transaksi
  - Styling dengan TailwindCSS

## Struktur Proyek

```
/
├─── frond-end/      # Direktori frontend (React)
├─── internal/       # Direktori utama kode Go (controllers, models, etc.)
├─── pkg/            # Paket pembantu (hashing, token)
├─── main.go         # File utama untuk menjalankan server Go
├─── go.mod          # Manajemen dependensi Go
├─── compose.yaml    # Konfigurasi Docker Compose
└─── Dockerfile      # Konfigurasi Docker
```

## Instalasi Lokal

Berikut adalah langkah-langkah untuk menjalankan proyek ini di lingkungan lokal Anda.

### Prasyarat

- [Go](https://go.dev/doc/install) (versi 1.24 atau lebih baru)
- [Node.js](https://nodejs.org/en/download) (versi 18 atau lebih baru)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/frdiskndr/Go-Pocket-RestFullApi.git
cd Go-Pocket-RestFullApi
```

### 2. Konfigurasi Backend

1.  **Buat File `.env`**
    Buat file bernama `.env` di direktori root proyek dan tambahkan variabel berikut. Anda bisa menyalin dari file `.env.example` jika ada.

    ```env
    PORT=3000
    SECRET_KEY=rahasiabanget
    ```

2.  **Install Dependensi Go**
    Buka terminal di direktori root dan jalankan perintah berikut untuk mengunduh semua dependensi yang diperlukan.

    ```bash
    go mod tidy
    ```

3.  **Jalankan Server Backend**
    Setelah dependensi terpasang, jalankan server Go.

    ```bash
    go run main.go
    ```

    Server backend akan berjalan di `http://localhost:3000`.

### 3. Konfigurasi Frontend

1.  **Pindah ke Direktori Frontend**
    Buka terminal baru dan masuk ke direktori `frond-end`.

    ```bash
    cd frond-end
    ```

2.  **Install Dependensi Node.js**
    Install semua dependensi yang dibutuhkan oleh aplikasi React.

    ```bash
    npm install
    ```

3.  **Jalankan Server Frontend**
    Jalankan server development Vite.

    ```bash
    npm run dev
    ```

    Aplikasi frontend akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

## Dokumentasi API

Setelah server backend berjalan, Anda dapat mengakses dokumentasi API yang dibuat secara otomatis oleh Swagger di URL berikut:

[http://localhost:3000/documentation/](http://localhost:3000/documentation/)

## Menjalankan dengan Docker

Anda juga dapat menjalankan aplikasi ini menggunakan Docker.

1.  Pastikan Docker sudah terinstall di sistem Anda.
2.  Jalankan perintah berikut dari direktori root proyek:

    ```bash
    docker compose up --build
    ```

Aplikasi akan dapat diakses di `http://localhost:3000`.

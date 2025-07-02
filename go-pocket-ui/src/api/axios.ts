import axios from 'axios';

// Buat instance Axios dengan URL dasar dari API Go Anda
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Ganti port jika berbeda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ini adalah 'interceptor'. Ia akan menambahkan token JWT ke setiap request
// secara otomatis jika token tersebut ada di local storage.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Di API Go Anda, Anda membaca header 'token', bukan 'Authorization'
    config.headers['token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
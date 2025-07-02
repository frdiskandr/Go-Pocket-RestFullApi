import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const token = localStorage.getItem('authToken');

  // Jika tidak ada token, alihkan ke halaman login.
  // 'replace' digunakan agar pengguna tidak bisa kembali ke halaman sebelumnya dengan tombol back.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, tampilkan halaman yang seharusnya (misal, Dashboard).
  // <Outlet /> adalah placeholder untuk komponen anak.
  return <Outlet />;
};

export default AuthGuard;
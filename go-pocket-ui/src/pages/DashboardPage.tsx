import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import BalanceCard from '../components/BalanceCard';
import ActionButtons from '../components/ActionButtons';
import TransactionList from '../components/TransactionList';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
}

interface Wallet {
  ID: number;
  balance: number;
  curency: string; // Ingat typo ini dari backend Anda
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data user dan wallet secara bersamaan
        const [userRes, walletRes] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/wallet/'),
        ]);
        setUser(userRes.data.Data);
        setWallet(walletRes.data.Data);
      } catch (error) {
        console.error("Gagal mengambil data", error);
        handleLogout(); // Jika gagal, logout saja
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleLogout = () => {
      localStorage.removeItem('authToken');
      navigate('/login');
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Memuat data...</p></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="p-4 flex justify-between items-center max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800">
          Halo, <span className="font-bold">{user?.name || 'Pengguna'}</span>!
        </h1>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
          <LogOut size={24}/>
        </button>
      </header>

      <main className="p-4">
        {wallet && <BalanceCard balance={wallet.balance} currency={wallet.curency} />}
        <ActionButtons />
        <TransactionList />
      </main>
    </div>
  );
}
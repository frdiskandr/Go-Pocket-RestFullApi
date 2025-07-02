import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// Definisikan tipe data untuk transaksi
interface Transaction {
  id: number;
  from_wallet_id: number;
  to_wallet_id: number;
  amount: number;
  type: number; // 0 for topup, 1 for transfer
  TimeStamp: string;
}

interface HistoryData {
  "Data Recipient": Transaction[];
  "Data Send": Transaction[];
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get<HistoryData>('/wallet/history');
        const sent = response.data["Data Send"] || [];
        const received = response.data["Data Recipient"] || [];
        const all = [...sent, ...received].sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime());
        setTransactions(all.slice(0, 5)); // Ambil 5 transaksi terakhir
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const transactionIcon = (type: number) => {
    if (type === 1) { // Transfer
      return <ArrowUpRight className="text-red-500" size={20} />;
    }
    return <ArrowDownLeft className="text-green-500" size={20} />; // Topup
  };

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded-full">
                {transactionIcon(tx.type)}
              </div>
              <div>
                <p className="font-semibold">
                  {tx.type === 1 ? `Transfer to ${tx.to_wallet_id}` : `Top Up`}
                </p>
                <p className="text-sm text-gray-500">{new Date(tx.TimeStamp).toLocaleString()}</p>
              </div>
            </div>
            <p className={`font-bold ${tx.type === 1 ? 'text-red-500' : 'text-green-500'}`}>
              {tx.type === 1 ? '-' : '+'}
              {tx.amount.toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

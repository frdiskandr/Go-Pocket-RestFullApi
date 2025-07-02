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

export default function TransactionHistory() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/wallet/history');
        setHistory(response.data);
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

  if (loading) return <p>Loading history...</p>;

  const allTransactions = [
    ...(history?.[('Data Send')] || []),
    ...(history?.[('Data Recipient')] || []),
  ].sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime());

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
      <div className="space-y-4">
        {allTransactions.map((tx) => (
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

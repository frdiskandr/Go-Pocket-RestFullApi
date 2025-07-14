
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, Paperclip, Send, LogOut, User } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/v1';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState({ sent: [], received: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('sent');
    const navigate = useNavigate();

    const [debug, setdebug]= useState([])

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const [userRes, walletRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/users/me`, { headers: { token } }),
                axios.get(`${API_URL}/wallet`, { headers: { token } }),
                axios.get(`${API_URL}/wallet/history`, { headers: { token } })
            ]);

            setUser(userRes.data.Data);
            setWallet(walletRes.data.Data);
            
            setHistory({
                sent: historyRes.data.DataSend || [],
                received: historyRes.data.DataRecipient || []
            });

            setdebug(historyRes.data)

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Failed to fetch dashboard data. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">{error}</div>;
    }

    console.log(wallet)
    console.log(user)
    console.log(history)
    console.log(debug)

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="container mx-auto p-4 max-w-md">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <p className="text-gray-400">Welcome back,</p>
                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-gray-800 hover:bg-blue-500 transition-colors">
                            <User size={20} />
                        </button>
                        <button onClick={handleLogout} className="p-2 rounded-full bg-gray-800 hover:bg-red-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </motion.header>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl mb-8 shadow-lg"
                >
                    <p className="text-lg text-blue-100">Your Balance</p>
                    <h2 className="text-4xl font-bold tracking-tight">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(wallet?.balance || 0)}
                    </h2>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    <ActionButton icon={<ArrowUpCircle />} label="Top Up" onClick={() => navigate('/topup')} />
                    <ActionButton icon={<Send />} label="Transfer" onClick={() => navigate('/transfer')} />
                    <ActionButton icon={<Paperclip />} label="Request" />
                </motion.div>

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                    <div className="flex bg-gray-800 rounded-full p-1 mb-4">
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`w-full py-2 rounded-full transition-colors ${activeTab === 'sent' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
                        >
                            Sent
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`w-full py-2 rounded-full transition-colors ${activeTab === 'received' ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
                        >
                            Received
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'sent' && <TransactionList transactions={history.sent} type="sent" />}
                            {activeTab === 'received' && <TransactionList transactions={history.received} type="received" />}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onClick}>
        <button className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full hover:bg-blue-500 transition-colors">
            {React.cloneElement(icon, { size: 28 })}
        </button>
        <span className="text-sm text-gray-300">{label}</span>
    </div>
);

const TransactionList = ({ transactions, type }) => {
    if (transactions.length === 0) {
        return <p className="text-center text-gray-500 mt-8">No {type} transactions yet.</p>;
    }

    return (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <motion.div
                    key={tx.ID}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${type === 'sent' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {type === 'sent' ? <ArrowUpCircle /> : <ArrowDownCircle />}
                        </div>
                        <div>
                            <p className="font-semibold">
                                {type === 'sent' ? `To: User ${tx.to}` : `From: User ${tx.from}`}
                            </p>
                            <p className="text-sm text-gray-400">{new Date(tx.CreatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <p className={`font-bold ${type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                        {type === 'sent' ? '-' : '+'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                    </p>
                </motion.div>
            ))}
        </div>
    );
};

export default Dashboard;

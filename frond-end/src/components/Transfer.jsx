
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/v1';

const Transfer = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!phoneNumber || !amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid phone number and amount.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/wallet/transfer`, 
                { 
                    tophonenumber: phoneNumber, 
                    balance: parseFloat(amount) 
                },
                { headers: { token } }
            );
            setSuccess(`Successfully sent ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)} to ${res.data.TO}!`);
            setAmount('');
            setPhoneNumber('');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error('Transfer error:', err);
            setError(err.response?.data?.Error || 'Transfer failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Send Money</h1>
                    <p className="text-gray-400 mb-8">Transfer funds to another Go-Pocket user.</p>
                </motion.div>

                <motion.form
                    onSubmit={handleTransfer}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-800 p-8 rounded-2xl shadow-lg"
                >
                    <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">Recipient's Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="e.g., 081234567890"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount to Send (IDR)</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 50000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        {loading ? 'Sending...' : 'Confirm & Send'}
                    </button>

                    {error && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-4 text-red-400 flex items-center gap-2">
                            <XCircle size={18} /> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-4 text-green-400 flex items-center gap-2">
                            <CheckCircle size={18} /> {success}
                        </motion.div>
                    )}
                </motion.form>
            </div>
        </div>
    );
};

export default Transfer;


import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/v1';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchUserData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/users/me`, { headers: { token } });
            setUser(res.data.Data);
        } catch (err) {
            console.error('Error fetching user data:', err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Failed to fetch user data.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">{error}</div>;
    }

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
                    <h1 className="text-3xl font-bold mb-8">My Profile</h1>
                </motion.div>

                {user && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6"
                    >
                        <ProfileInfoItem icon={<User />} label="Username" value={user.name} />
                        <ProfileInfoItem icon={<Mail />} label="Email" value={user.email} />
                        <ProfileInfoItem icon={<Phone />} label="Phone Number" value={user.phoneNumber} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ProfileInfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="bg-gray-700 p-3 rounded-full">
            {React.cloneElement(icon, { size: 22, className: 'text-blue-400' })}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    </div>
);

export default Profile;

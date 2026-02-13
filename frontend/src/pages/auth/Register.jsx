import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('/register', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6 md:p-10 font-sans selection:bg-orange-100">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="grid md:grid-cols-2">
                            {/* Form Section */}
                            <div className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex flex-col items-center gap-2 text-center mb-4">
                                        <img src="/logo.png" alt="Steamline Logo" className="w-12 h-12 object-contain mb-2" />
                                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                                        <p className="text-gray-600 text-sm">Join Steamline as a customer</p>
                                    </div>

                                    <div className="flex justify-center mb-4">
                                        <Link to="/" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-orange-100">
                                            <ArrowLeft size={14} /> Beranda
                                        </Link>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs font-bold">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm border border-emerald-100 font-bold">
                                            Registration successful! Redirecting...
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                                        <input type="text" name="full_name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="John Doe" onChange={handleChange} required />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                                        <input type="text" name="phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="0812..." onChange={handleChange} required />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</label>
                                        <input type="text" name="username" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="choose_username" onChange={handleChange} required />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                                        <input type="password" name="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="••••••••" onChange={handleChange} required />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || success}
                                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
                                    </button>

                                    <div className="text-center pt-2">
                                        <Link to="/login" className="text-sm text-slate-400 font-bold hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
                                            <ArrowLeft size={16} /> Back to Login
                                        </Link>
                                    </div>
                                </form>
                            </div>

                            {/* Video Section */}
                            <div className="relative hidden md:block bg-gray-900">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsinline
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                >
                                    <source src="/assets/videos/Coin-Falling3.webm" type="video/webm" />
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-white z-10 p-12 text-center">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter mb-4">Start Your Journey with Us</h3>
                                        <p className="text-orange-100/80 font-medium">Get the best laundry experience with real-time tracking and professional care.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

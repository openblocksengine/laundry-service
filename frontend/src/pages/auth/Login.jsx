import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/app/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6 md:p-10 font-sans">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="grid md:grid-cols-2">
                            {/* Form Section */}
                            <div className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <img src="/logo.png" alt="Steamline Logo" className="w-12 h-12 object-contain mb-2" />
                                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                                        <p className="text-gray-600 text-sm">Login to your Steamline account</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <Link to="/" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-orange-100">
                                            <ArrowLeft size={14} /> Beranda
                                        </Link>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            placeholder="Enter your username"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">Forgot password?</a>
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium py-2.5 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                                    </button>

                                    <p className="text-center text-sm text-gray-600">
                                        Don't have an account? <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">Sign up</Link>
                                    </p>
                                </form>
                            </div>

                            {/* Video Section */}
                            <div className="relative hidden md:block bg-gray-900">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                >
                                    <source src="/assets/videos/Coin-Falling3.webm" type="video/webm" />
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20"></div>
                                <div className="absolute bottom-8 left-8 text-white z-10">
                                    <h3 className="text-2xl font-black tracking-tight">Professional Laundry Management</h3>
                                    <p className="text-orange-100/80 text-sm font-medium">Efficient. Reliable. Modern.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-600">
                        By clicking continue, you agree to our <a href="#" className="underline hover:text-gray-900">Terms of Service</a> and <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

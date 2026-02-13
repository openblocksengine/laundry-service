import React, { useState } from 'react';
import axios from '../../api/axios';
import { Search, Package, Clock, CheckCircle2, MapPin, Loader2 } from 'lucide-react';

const Tracking = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        // Remove common prefixes like #, ORD-, etc.
        let cleanedId = orderId.trim().replace(/[^0-9]/g, '');
        
        if (!cleanedId) return;
        
        setLoading(true);
        setError('');
        setTrackingData(null);
        
        try {
            const response = await axios.get(`/tracking/${cleanedId}`);
            setTrackingData(response.data);
        } catch (error) {
            setError(error.response?.data?.msg || 'Order not found. Please check your Order ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Track Your Laundry</h1>
                    <p className="text-slate-500">Enter your order ID below to check real-time status</p>
                </div>

                <div className="card mb-8 overflow-hidden">
                    <form onSubmit={handleTrack} className="p-2 flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-orange-600 bg-slate-50 text-lg font-semibold" 
                                placeholder="Order ID (e.g. 1)" 
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Track Order'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center mb-8 font-medium">
                        {error}
                    </div>
                )}

                {trackingData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="card p-8 bg-orange-600 text-white">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <p className="text-orange-100 uppercase tracking-widest text-xs font-black mb-1">Current Status</p>
                                    <h2 className="text-3xl font-black capitalize">{trackingData.order.status.replace(/_/g, ' ')}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-orange-100 uppercase tracking-widest text-xs font-black mb-1">Customer Name</p>
                                    <h3 className="text-xl font-bold">{trackingData.order.customer_name}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="card p-8">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                <Clock className="text-orange-600" /> Tracking History
                            </h3>
                            <div className="relative">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                                <div className="space-y-8">
                                    {trackingData.logs.map((log, index) => (
                                        <div key={index} className="relative pl-10">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${index === 0 ? 'bg-orange-600' : 'bg-slate-300'}`}>
                                                {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold capitalize ${index === 0 ? 'text-orange-600' : 'text-slate-800'}`}>
                                                    {log.status.replace(/_/g, ' ')}
                                                </h4>
                                                <p className="text-sm text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm bg-slate-200 flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-400">Order Placed</h4>
                                            <p className="text-sm text-slate-400">{new Date(trackingData.order.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;

import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { ShoppingBag, Users, Clock, DollarSign, TrendingUp, Calendar, Star, Award, ChevronRight, Package, Plus, Truck, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('admin');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/dashboard/stats');
                setStats(response.data.stats || {});
                setChartData(response.data.chart_data || []);
                setRecentActivities(response.data.recent_activities || []);
                setRole(response.data.role || 'admin');
            } catch (error) {
                console.error('Error fetching stats:', error);
                setError('Failed to load dashboard data. Please try logging in again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Real-time polling: Refresh stats every 10 seconds
        const intervalId = setInterval(fetchStats, 10000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyiapkan Dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/20 text-center max-w-md">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2">Retry</button>
            </div>
        </div>
    );

    const cards = role === 'customer' ? [
        { label: 'Pesanan Aktif', value: stats?.pending_orders || 0, icon: <Clock size={20} />, color: 'primary' },
        { label: 'Total Pesanan', value: stats?.total_orders || 0, icon: <ShoppingBag size={20} />, color: 'warning' },
        { label: 'Total Pengeluaran', value: `Rp ${Number(stats?.total_spent || 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: 'success' },
        { label: 'Steam Points', value: stats?.points || 0, icon: <Award size={20} />, color: 'danger' },
    ] : role === 'driver' ? [
        { label: 'Tugas Tersedia', value: stats?.assigned_tasks || 0, icon: <Package size={20} />, color: 'primary' },
        { label: 'Sedang Diantar', value: stats?.active_deliveries || 0, icon: <Truck size={20} />, color: 'warning' },
        { label: 'Berhasil Diantar', value: stats?.completed_deliveries || 0, icon: <CheckCircle2 size={20} />, color: 'success' },
        { label: 'Poin Driver', value: stats?.total_points || 0, icon: <Award size={20} />, color: 'danger' },
    ] : [
        { label: 'Total Orders', value: stats?.total_orders || 0, icon: <ShoppingBag size={20} />, color: 'primary' },
        { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: <Clock size={20} />, color: 'warning' },
        { label: 'Total Revenue', value: `Rp ${Number(stats?.total_revenue || 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: 'success' },
        { label: 'Total Customers', value: stats?.total_customers || 0, icon: <Users size={20} />, color: 'danger' },
    ];

    try {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Halo, {user?.full_name?.split(' ')[0]}!
                        </h1>
                        <p className="text-slate-500 font-medium text-balance">
                            {role === 'customer' 
                                ? 'Lihat status cucian dan riwayat pesanan Anda di sini.'
                                : role === 'driver'
                                ? 'Pantau tugas pengiriman dan performa Anda hari ini.'
                                : 'Monitoring performa bisnis Steamline Anda hari ini.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {role === 'customer' && (
                            <Link to="/app/new-order" className="bg-orange-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2">
                                <Plus size={18} /> Pesan Laundry
                            </Link>
                        )}
                        {role === 'driver' && (
                            <Link to="/app/logistics" className="bg-orange-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2">
                                <Truck size={18} /> Lihat Tugas
                            </Link>
                        )}
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Calendar size={18} className="text-orange-600" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    card.color === 'primary' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600' :
                                    card.color === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' :
                                    card.color === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                                    'bg-red-50 dark:bg-red-950/20 text-red-600'
                                }`}>
                                    {card.icon}
                                </div>
                                <TrendingUp className="text-slate-300 group-hover:text-orange-400 transition-colors" size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {role === 'customer' ? 'Aktivitas Pesanan' : role === 'driver' ? 'Tugas Logistik' : 'Statistik Pesanan'}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {role === 'customer' ? 'Status terkini dari seluruh pesanan Anda.' : role === 'driver' ? 'Riwayat aktivitas pengiriman Anda.' : 'Tren pesanan dalam 7 hari terakhir'}
                                </p>
                            </div>
                        </div>
                        
                        {role === 'customer' || role === 'driver' ? (
                            <div className="space-y-4">
                                {!recentActivities || recentActivities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">Belum ada aktivitas.</p>
                                    </div>
                                ) : (
                                    recentActivities.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-orange-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                                    {role === 'driver' ? <Truck size={20} className="text-orange-600" /> : <Package size={20} className="text-orange-600" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">#ORD-{order.id}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                                <Link to={role === 'driver' ? `/app/logistics` : `/app/my-orders`} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                    <ChevronRight size={18} className="text-slate-400" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                {chartData && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} 
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '16px', 
                                                    border: 'none', 
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    padding: '12px'
                                                }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke="#EA580C" 
                                                strokeWidth={4} 
                                                fillOpacity={1} 
                                                fill="url(#colorCount)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        Data grafik belum tersedia
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                            {role === 'customer' ? 'Promo Menarik' : 'Aktivitas Terbaru'}
                        </h3>
                        <div className="space-y-6">
                            {role === 'customer' ? (
                                <div className="bg-orange-600 rounded-[2rem] p-6 text-white relative overflow-hidden">
                                    <Star className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Voucher Diskon</p>
                                    <h4 className="text-2xl font-black mb-4 leading-tight text-white">Diskon 20% Untuk Cuci Bedcover</h4>
                                    <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-orange-50 transition-colors">Gunakan Sekarang</button>
                                </div>
                            ) : (
                                !recentActivities || recentActivities.length === 0 ? (
                                    <p className="text-slate-400 text-center py-10 font-medium text-sm">Belum ada aktivitas.</p>
                                ) : (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Pesanan #ORD-{activity.id}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {activity.customer_name || 'Guest'} • {activity.created_at ? new Date(activity.created_at).toLocaleTimeString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                        {role === 'admin' && (
                            <Link to="/app/orders" className="w-full mt-8 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center block">
                                Lihat Semua Pesanan
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (e) {
        console.error("Dashboard render error:", e);
        return <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold">Terjadi kesalahan saat merender Dashboard.</div>;
    }
};

export default Dashboard;
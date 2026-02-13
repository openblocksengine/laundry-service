import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Package, Clock, CheckCircle2, DollarSign, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerPortal = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerOrders();
    }, []);

    const fetchCustomerOrders = async () => {
        try {
            const response = await axios.get('/customer/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching customer orders', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        const styles = {
            'pending': 'bg-amber-50 text-amber-700 border-amber-100',
            'washing': 'bg-orange-50 text-orange-700 border-orange-100',
            'drying': 'bg-orange-100 text-orange-800 border-orange-200',
            'ironing': 'bg-orange-200 text-orange-900 border-orange-300',
            'ready_for_delivery': 'bg-orange-50 text-orange-700 border-orange-100',
            'delivery': 'bg-orange-600 text-white border-orange-600',
            'completed': 'bg-emerald-50 text-emerald-700 border-emerald-100'
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-100';
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Riwayat Pesanan Saya</h2>
                    <p className="text-slate-500 font-medium">Pantau dan kelola seluruh riwayat laundry Anda.</p>
                </div>
                <Link 
                    to="/app/new-order" 
                    className="bg-orange-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
                >
                    <Plus size={20} /> Pesan Laundry Baru
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card">
                    <div className="stat-label uppercase tracking-widest font-bold text-[10px]">Active Orders</div>
                    <div className="stat-value text-orange-600">{orders.filter(o => o.status !== 'completed').length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label uppercase tracking-widest font-bold text-[10px]">Total Spent</div>
                    <div className="stat-value text-slate-900">
                        Rp {orders.reduce((acc, curr) => acc + parseFloat(curr.total_price), 0).toLocaleString()}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label uppercase tracking-widest font-bold text-[10px]">Completed</div>
                    <div className="stat-value text-emerald-600">{orders.filter(o => o.status === 'completed').length}</div>
                </div>
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="card p-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>You haven't placed any orders yet.</p>
                    </div>
                ) : orders.map((order) => (
                    <div key={order.id} className="card hover:shadow-md transition-all group">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <Package size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900">Order #ORD-{order.id}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter ${getStatusStyles(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end flex-1 gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                                    <p className="font-black text-slate-900">Rp {parseFloat(order.total_price).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</p>
                                    <p className={`font-bold ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {order.payment_status.toUpperCase()}
                                    </p>
                                </div>
                                <Link 
                                    to={`/app/my-orders/${order.id}`}
                                    className="p-2 bg-slate-50 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all"
                                >
                                    <ChevronRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerPortal;

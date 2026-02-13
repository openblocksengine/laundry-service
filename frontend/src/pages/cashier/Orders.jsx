import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { Plus, Search, Eye, X, Loader2, Printer, CreditCard, ShoppingCart, Trash2, UserPlus, Package, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const Orders = () => {
    const { addNotification } = useNotificationStore();
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPOSOpen, setIsPOSOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // POS / Order Intake State
    const [cart, setCart] = useState([]);
    const [customerId, setCustomerId] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Payment State
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);

    const { user } = useAuth(); // Get current user for role check

    useEffect(() => {
        fetchOrders();
        fetchServices();
        fetchCustomers();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/orders');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders', err);
            addNotification({
                title: 'Gagal Memuat Pesanan',
                description: err.response?.data?.msg || 'Tidak dapat mengambil daftar pesanan.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers', error);
        }
    };

    const addToCart = (service) => {
        const exists = cart.find(item => item.id === service.id);
        if (exists) {
            setCart(cart.map(item => item.id === service.id ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCart([...cart, {...service, quantity: 1}]);
        }
    };

    const updateCartQty = (id, qty) => {
        if (qty <= 0) return removeFromCart(id);
        setCart(cart.map(item => item.id === id ? {...item, quantity: parseFloat(qty)} : item));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            addNotification({ title: 'Keranjang Kosong', description: 'Silakan pilih layanan terlebih dahulu.', type: 'info' });
            return;
        }
        
        setSubmitting(true);
        try {
            await axios.post('/orders', {
                customer_id: customerId,
                items: cart.map(item => ({ service_id: item.id, quantity: item.quantity })),
                payment_method: 'unpaid' // Default for cashier's manual input
            });
            addNotification({
                title: 'Pesanan Berhasil',
                description: 'Pesanan baru telah berhasil dibuat.',
                type: 'success'
            });
            setIsPOSOpen(false);
            setCart([]);
            fetchOrders();
        } catch (error) {
            addNotification({
                title: 'Gagal Membuat Pesanan',
                description: error.response?.data?.msg || 'Terjadi kesalahan saat memproses pesanan.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const viewOrderDetail = async (orderId) => {
        try {
            const response = await axios.get(`/orders/${orderId}`);
            if (response.data && response.data.order) {
                setSelectedOrder(response.data);
                setIsDetailOpen(true);
                setPaymentResult(null);
                setAmountPaid('');
            } else {
                addNotification({ title: 'Error', description: 'Data pesanan tidak ditemukan.', type: 'error' });
            }
        } catch (err) {
            addNotification({ title: 'Error', description: err.response?.data?.msg || 'Gagal mengambil detail pesanan.', type: 'error' });
        }
    };

    const handlePayment = async () => {
        if (!selectedOrder || !selectedOrder.order) {
            addNotification({ title: 'Error', description: 'Data pesanan tidak lengkap untuk pembayaran.', type: 'error' });
            return;
        }
        if (!amountPaid || parseFloat(amountPaid) < selectedOrder.order.total_price) {
            addNotification({ title: 'Gagal', description: 'Jumlah bayar kurang', type: 'error' });
            return;
        }
        try {
            const response = await axios.post(`/orders/${selectedOrder.order.id}/pay`, {
                amount_paid: parseFloat(amountPaid)
            });
            addNotification({
                title: 'Pembayaran Berhasil',
                description: `Lunas untuk #ORD-${selectedOrder.order.id}`,
                type: 'success'
            });
            setPaymentResult(response.data);
            fetchOrders();
            viewOrderDetail(selectedOrder.order.id); // Refresh current order detail
        } catch (err) {
            addNotification({ title: 'Error', description: err.response?.data?.msg || 'Gagal memproses pembayaran', type: 'error' });
        }
    };

    const handlePrint = () => window.print();

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': 'bg-amber-100 text-amber-700',
            'washing': 'bg-blue-100 text-blue-700',
            'drying': 'bg-cyan-100 text-cyan-700',
            'ironing': 'bg-indigo-100 text-indigo-700',
            'ready_for_delivery': 'bg-orange-100 text-orange-700',
            'delivery': 'bg-orange-600 text-white',
            'completed': 'bg-emerald-100 text-emerald-700'
        };
        return cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", statusMap[status] || 'bg-slate-100 text-slate-600');
    };

    const filteredOrders = orders.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    );

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 no-print gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Orders & Point of Sale</h2>
                    <p className="text-slate-500 font-medium">Kelola pesanan dan proses pembayaran dengan cepat.</p>
                </div>
                <button 
                    onClick={() => setIsPOSOpen(true)} 
                    className="bg-orange-600 text-white py-4 px-8 rounded-[1.5rem] font-black shadow-xl shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-3 w-full lg:w-auto justify-center"
                >
                    <Plus size={20} strokeWidth={3} /> New Order Intake
                </button>
            </div>

            {/* Orders Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden no-print">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="input-field pl-12 py-3 bg-slate-50 border-transparent focus:bg-white" 
                            placeholder="Cari pesanan atau nama pelanggan..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-orange-600" /></td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">Tidak ada pesanan ditemukan</td></tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-black text-orange-600">#ORD-{order.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{order.customer_name || 'Guest'}</td>
                                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">Rp {parseFloat(order.total_price).toLocaleString()}</td>
                                    <td className="px-6 py-4"><span className={getStatusBadge(order.status)}>{order.status.replace(/_/g, ' ')}</span></td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                                            order.payment_status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                        )}>{order.payment_status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link 
                                            to={`/app/orders/${order.id}`}
                                            className="p-2 inline-block bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POS FULLSCREEN MODAL */}
            {isPOSOpen && (
                <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col no-print animate-in slide-in-from-bottom-4 duration-300">
                    <div className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white"><ShoppingCart size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Point of Sale</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Penerimaan Pesanan</p>
                            </div>
                        </div>
                        <button onClick={() => setIsPOSOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                            <X size={28} className="text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                        {/* Services Grid */}
                        <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {services.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => addToCart(s)}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-orange-500 hover:shadow-xl transition-all text-left group flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{s.name}</p>
                                            <p className="text-xs font-bold text-slate-400">Rp {parseFloat(s.price).toLocaleString()} / {s.unit}</p>
                                        </div>
                                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950/20 rounded-lg flex items-center justify-center text-orange-600"><Plus size={18} /></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart Sidebar */}
                        <div className="w-full lg:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col shadow-2xl">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                                <label className="form-label text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pilih Pelanggan</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select 
                                            className="input-field appearance-none pr-10" 
                                            value={customerId} 
                                            onChange={(e) => setCustomerId(e.target.value)}
                                        >
                                            <option value="">-- Pilih Customer --</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.full_name} ({c.username})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    <button className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-xl text-orange-600 hover:bg-orange-600 hover:text-white transition-all"><UserPlus size={20}/></button>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-8 overflow-y-auto">
                                <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Detail Keranjang</h4>
                                <div className="space-y-4">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-20 text-slate-300 uppercase font-black text-xs">Belum ada item</div>
                                    ) : cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl animate-in slide-in-from-right-2">
                                            <div className="flex-1">
                                                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{item.name}</p>
                                                <p className="text-xs font-black text-orange-600">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                                <input 
                                                    type="number" 
                                                    className="w-12 text-center bg-transparent border-none outline-none font-black text-sm"
                                                    value={item.quantity}
                                                    onChange={(e) => updateCartQty(item.id, e.target.value)}
                                                />
                                                <span className="text-[10px] font-black text-slate-400 uppercase pr-1">{item.unit}</span>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-slate-950 text-white rounded-t-[3rem]">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-slate-500 uppercase font-black text-xs tracking-widest">Grand Total</span>
                                    <span className="text-4xl font-black text-orange-500">Rp {cartTotal.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handleCreateOrder}
                                    disabled={submitting || cart.length === 0}
                                    className="w-full bg-orange-600 hover:bg-orange-700 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <>Konfirmasi Pesanan <ArrowRight size={24} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL & PAYMENT MODAL */}
            {isDetailOpen && selectedOrder && selectedOrder.order && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md no-print animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Order #ORD-{selectedOrder.order.id}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                        selectedOrder.order.payment_status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                    )}>{selectedOrder.order.payment_status}</span>
                                    <span className="text-[10px] font-bold text-slate-400">• {selectedOrder.order.created_at ? new Date(selectedOrder.order.created_at).toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Pelanggan</p>
                                    <p className="font-black text-slate-900 dark:text-white text-lg">{selectedOrder.order.customer_name || 'Guest'}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{selectedOrder.order.customer_phone || 'No phone'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status Saat Ini</p>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className={getStatusBadge(selectedOrder.order.status)}>{selectedOrder.order.status}</span>
                                        
                                        {/* Status Update Dropdown for Admin/Cashier */}
                                        {user?.role && ['admin', 'cashier'].includes(user.role) && (
                                            <div className="relative inline-block w-full max-w-[200px]">
                                                <select 
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                                                    value={selectedOrder.order.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            await axios.put(`/orders/${selectedOrder.order.id}/status`, { status: newStatus });
                                                            addNotification({
                                                                title: 'Status Diperbarui',
                                                                description: `Pesanan #ORD-${selectedOrder.order.id} kini ${newStatus.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}.`,
                                                                type: 'success'
                                                            });
                                                            viewOrderDetail(selectedOrder.order.id); 
                                                            fetchOrders(); 
                                                        } catch (err) {
                                                            addNotification({ 
                                                                title: 'Gagal Update Status', 
                                                                description: err.response?.data?.msg || 'Terjadi kesalahan saat memperbarui status.', 
                                                                type: 'error' 
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="washing">Washing</option>
                                                    <option value="drying">Drying</option>
                                                    <option value="ironing">Ironing</option>
                                                    <option value="ready_for_delivery">Ready for Delivery</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-black text-slate-400 text-xs uppercase tracking-widest">Item Layanan</th>
                                            <th className="px-6 py-4 text-center font-black text-slate-400 text-xs uppercase tracking-widest">Qty</th>
                                            <th className="px-6 py-4 text-right font-black text-slate-400 text-xs uppercase tracking-widest">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {selectedOrder.items && selectedOrder.items.length > 0 && selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.service_name}</td>
                                                <td className="px-6 py-4 text-center font-black text-slate-50">{item.quantity} {item.unit}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">Rp {parseFloat(item.subtotal).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-orange-600 text-white">
                                        <tr>
                                            <td colSpan="2" className="px-6 py-5 font-black text-right uppercase tracking-widest text-xs">Total Pembayaran</td>
                                            <td className="px-6 py-5 text-right font-black text-2xl">Rp {parseFloat(selectedOrder.order.total_price).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {selectedOrder.order.payment_status === 'unpaid' ? (
                                <div className="bg-orange-50 dark:bg-orange-950/10 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/30 animate-in slide-in-from-bottom-2">
                                    <h4 className="font-black text-orange-800 dark:text-orange-500 mb-6 flex items-center gap-3 uppercase text-xs tracking-widest"><CreditCard size={20} /> Pembayaran Kasir</h4>
                                    <div className="flex gap-4 flex-col sm:flex-row">
                                        <div className="flex-1">
                                            <input 
                                                type="number" 
                                                className="input-field border-orange-200 focus:border-orange-600 focus:ring-orange-100" 
                                                placeholder="Jumlah Uang Tunai..."
                                                value={amountPaid}
                                                onChange={(e) => setAmountPaid(e.target.value)}
                                            />
                                        </div>
                                        <button onClick={handlePayment} className="bg-orange-600 text-white px-10 py-4 rounded-xl font-black shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all active:scale-95">Bayar Lunas</button>
                                    </div>
                                    {paymentResult && (
                                        <div className="mt-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm animate-in zoom-in-95">
                                            <div className="flex justify-between items-center">
                                                <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">Uang Kembali</span>
                                                <span className="text-3xl font-black text-emerald-600">Rp {paymentResult.change.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-emerald-50 dark:bg-emerald-950/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between border border-emerald-100 dark:border-emerald-900/30 gap-6">
                                    <div className="flex items-center gap-4 text-emerald-700 dark:text-emerald-500">
                                        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 size={32} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Payment Success</p>
                                            <p className="text-xl font-black">LUNAS</p>
                                        </div>
                                    </div>
                                    <button onClick={handlePrint} className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 py-4 px-8 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-emerald-50 transition-all shadow-sm">
                                        <Printer size={20} /> CETAK STRUK
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PRINT TEMPLATE (HIDDEN) */}
            {selectedOrder && (
                <div className="print-only p-8 max-w-[400px] mx-auto text-center font-mono">
                    <h2 className="text-2xl font-black mb-1 tracking-tighter">STEAMLINE</h2>
                    <p className="text-[10px] mb-4">Layanan Laundry Profesional<br/>Jakarta - Indonesia</p>
                    <div className="border-t border-b border-black border-dashed py-3 my-4 text-left text-[10px] space-y-1">
                        <div className="flex justify-between"><span>ORDER ID</span> <span className="font-bold">#ORD-{selectedOrder.order.id}</span></div>
                        <div className="flex justify-between"><span>TANGGAL</span> <span>{selectedOrder.order.created_at ? new Date(selectedOrder.order.created_at).toLocaleString() : 'N/A'}</span></div>
                        <div className="flex justify-between"><span>KASIR</span> <span>{user?.full_name || 'N/A'}</span></div>
                        <div className="flex justify-between"><span>PELANGGAN</span> <span>{selectedOrder.order.customer_name || 'N/A'}</span></div>
                    </div>
                    <table className="w-full text-[10px] text-left mb-4">
                        <thead>
                            <tr className="border-b border-black border-dashed font-bold">
                                <th className="py-1">LAYANAN</th>
                                <th className="py-1 text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.items && selectedOrder.items.length > 0 && selectedOrder.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-1 uppercase">{item.service_name} ({item.quantity} {item.unit})</td>
                                    <td className="py-1 text-right">Rp {parseFloat(item.subtotal).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t border-black border-dashed pt-3 font-bold flex justify-between text-base">
                        <span>GRAND TOTAL</span>
                        <span>Rp {parseFloat(selectedOrder.order.total_price).toLocaleString()}</span>
                    </div>
                    {paymentResult && (
                        <div className="mt-2 space-y-1 text-[10px] opacity-80">
                            <div className="flex justify-between"><span>BAYAR TUNAI</span> <span>Rp {paymentResult.paid.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>KEMBALI</span> <span>Rp {paymentResult.change.toLocaleString()}</span></div>
                        </div>
                    )}
                    <div className="mt-10 text-[10px] italic border-t border-black border-dashed pt-4">
                        <p>Terima kasih telah mencuci di Steamline!</p>
                        <p>Lacak status: localhost:5173/track</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
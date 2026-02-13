import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { 
    Package, 
    ChevronLeft, 
    Clock, 
    User, 
    CreditCard, 
    CheckCircle2, 
    Printer,
    Receipt,
    Loader2,
    Calendar,
    Truck,
    ChevronDown,
    Save,
    Banknote,
    Phone,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotificationStore } from '../../components/ui/Notification';
import { useAuth } from '../../context/AuthContext';

const POSDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useNotificationStore();
    const { user } = useAuth();
    
    const [orderData, setOrderData] = useState(null);
    const [trackingLogs, setTrackingLogs] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [assigningDriver, setAssigningDriver] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        fetchData();
        fetchDrivers();

        // Real-time polling: Refresh every 10 seconds
        const intervalId = setInterval(fetchData, 10000);
        return () => clearInterval(intervalId);
    }, [orderId]);

    const fetchData = async () => {
        try {
            const [detailRes, trackRes] = await Promise.all([
                axios.get(`/orders/${orderId}`),
                axios.get(`/tracking/${orderId}`)
            ]);
            setOrderData(detailRes.data);
            setTrackingLogs(trackRes.data.logs);
        } catch (error) {
            console.error("Error fetching order details", error);
            addNotification({
                title: 'Error',
                description: 'Gagal memuat detail pesanan.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await axios.get('/drivers');
            setDrivers(response.data);
        } catch (error) {
            console.error("Error fetching drivers", error);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            addNotification({
                title: 'Status Diperbarui',
                description: `Pesanan #ORD-${orderId} kini berstatus ${newStatus.replace(/_/g, ' ')}.`,
                type: 'success'
            });
            fetchData();
        } catch (err) {
            addNotification({ 
                title: 'Gagal Update Status', 
                description: err.response?.data?.msg || 'Terjadi kesalahan.', 
                type: 'error' 
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAssignDriver = async (driverId) => {
        if (!driverId) return;
        setAssigningDriver(true);
        try {
            await axios.put(`/orders/${orderId}/assign-driver`, { driver_id: driverId });
            addNotification({
                title: 'Driver Ditugaskan',
                description: 'Driver telah berhasil ditugaskan untuk pesanan ini.',
                type: 'success'
            });
            fetchData();
        } catch (error) {
            addNotification({
                title: 'Gagal Menugaskan Driver',
                description: error.response?.data?.msg || 'Terjadi kesalahan.',
                type: 'error'
            });
        } finally {
            setAssigningDriver(false);
        }
    };

    const handlePayment = async () => {
        const total = orderData.order.total_price;
        if (!amountPaid || parseFloat(amountPaid) < total) {
            addNotification({ 
                title: 'Pembayaran Gagal', 
                description: 'Jumlah bayar tidak mencukupi.', 
                type: 'error' 
            });
            return;
        }

        try {
            const response = await axios.post(`/orders/${orderId}/pay`, {
                amount_paid: parseFloat(amountPaid)
            });
            addNotification({
                title: 'Pembayaran Berhasil',
                description: 'Transaksi telah diproses dan status telah diperbarui menjadi LUNAS.',
                type: 'success'
            });
            setPaymentResult(response.data);
            fetchData();
        } catch (err) {
            addNotification({ 
                title: 'Error', 
                description: err.response?.data?.msg || 'Gagal memproses pembayaran.', 
                type: 'error' 
            });
        }
    };

    const handlePrint = () => window.print();

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Mempersiapkan Terminal Kasir...</p>
        </div>
    );

    if (!orderData) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Pesanan Tidak Ditemukan</h2>
            <button onClick={() => navigate('/app/orders')} className="text-orange-600 font-bold">Kembali ke Daftar Pesanan</button>
        </div>
    );

    const { order, items } = orderData;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 no-print">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/app/orders')}
                        className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm group"
                    >
                        <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">POS Terminal</h2>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-orange-600 font-black text-xl tracking-tight">#ORD-{order.id}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                order.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                            )}>
                                {order.payment_status}
                            </span>
                            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                                <Calendar size={14} /> {new Date(order.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 lg:flex-none px-8 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Printer size={20} /> Cetak Struk
                    </button>
                    <button 
                        className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                    >
                        <Receipt size={20} /> Kirim Invoice WA
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Middle: Order Items and Tracking */}
                <div className="xl:col-span-2 space-y-10">
                    {/* Management Actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Update Status Progres</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-transparent px-6 py-4 rounded-2xl font-bold text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-orange-500 transition-all"
                                    value={order.status}
                                    disabled={updatingStatus}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                >
                                    <option value="pending">Pending (Menunggu)</option>
                                    <option value="washing">Washing (Sedang Dicuci)</option>
                                    <option value="drying">Drying (Proses Pengeringan)</option>
                                    <option value="ironing">Ironing (Sedang Disetrika)</option>
                                    <option value="ready_for_delivery">Ready for Delivery (Siap Kirim)</option>
                                    <option value="delivery">Delivery (Dalam Perjalanan)</option>
                                    <option value="completed">Completed (Selesai)</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="h-full w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Update Driver (Logistik)</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-transparent px-6 py-4 rounded-2xl font-bold text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        onChange={(e) => handleAssignDriver(e.target.value)}
                                        value={order.driver_id || ""}
                                        disabled={assigningDriver}
                                    >
                                        <option value="">-- Pilih Driver --</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.full_name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 flex items-center justify-center">
                                    {assigningDriver ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Package className="text-orange-600" /> Detail Layanan
                            </h3>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{items.length} Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan Laundry</th>
                                        <th className="px-10 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                        <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-10 py-7">
                                                <p className="font-black text-slate-900 dark:text-white mb-1 text-lg">{item.service_name}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rp {parseFloat(item.unit_price).toLocaleString()} / {item.unit}</p>
                                            </td>
                                            <td className="px-10 py-7 text-center">
                                                <span className="px-4 py-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-xl text-sm font-black">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-right font-black text-slate-900 dark:text-white text-xl">
                                                Rp {parseFloat(item.subtotal).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-900 text-white">
                                    <tr>
                                        <td colSpan="2" className="px-10 py-8 font-black uppercase tracking-[0.3em] text-xs opacity-50">Total Akhir Pesanan</td>
                                        <td className="px-10 py-8 text-right text-4xl font-black text-orange-500">
                                            Rp {parseFloat(order.total_price).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Timeline Activity */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                            <Clock className="text-orange-600" /> Log Aktivitas & Pelacakan
                        </h3>
                        <div className="relative pl-10 space-y-10 before:absolute before:top-2 before:left-[15px] before:w-1 before:h-[calc(100%-20px)] before:bg-slate-100 dark:before:bg-slate-800 before:rounded-full">
                            {trackingLogs.map((log, idx) => (
                                <div key={idx} className="relative group">
                                    <div className={cn(
                                        "absolute -left-[45px] top-1.5 w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center z-10 transition-all duration-300 shadow-sm",
                                        idx === 0 ? "bg-orange-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <p className={cn(
                                                "font-black text-lg tracking-tight uppercase",
                                                idx === 0 ? "text-slate-900 dark:text-white" : "text-slate-400"
                                            )}>
                                                {log.status.replace(/_/g, ' ')}
                                            </p>
                                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-medium leading-relaxed">{log.description || `Sistem memperbarui status pesanan menjadi ${log.status.toUpperCase()}.`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Payment and Customer */}
                <div className="space-y-10">
                    {/* Payment Terminal Card */}
                    <div className={cn(
                        "rounded-[3rem] p-10 shadow-2xl overflow-hidden relative border",
                        order.payment_status === 'paid' 
                        ? "bg-emerald-600 text-white border-emerald-500" 
                        : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800"
                    )}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className={cn(
                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                                order.payment_status === 'paid' ? "bg-white/20 text-white" : "bg-orange-600 text-white"
                            )}>
                                {order.payment_status === 'paid' ? <CheckCircle2 size={32} /> : <Banknote size={32} />}
                            </div>
                            <div>
                                <h4 className={cn("text-xs font-black uppercase tracking-[0.2em]", order.payment_status === 'paid' ? "text-emerald-100" : "text-slate-400")}>Status Pembayaran</h4>
                                <p className="text-3xl font-black">{order.payment_status.toUpperCase()}</p>
                            </div>
                        </div>

                        {order.payment_status === 'unpaid' ? (
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Input Nominal Pembayaran</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 pl-14 pr-6 py-5 rounded-2xl font-black text-2xl border-2 border-transparent focus:border-orange-600 focus:bg-white transition-all outline-none"
                                            placeholder="0"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Tagihan</span>
                                        <span className="font-black text-xl">Rp {parseFloat(order.total_price).toLocaleString()}</span>
                                    </div>
                                    <button 
                                        onClick={handlePayment}
                                        className="w-full bg-orange-600 hover:bg-orange-700 py-6 rounded-[2rem] font-black text-xl text-white shadow-xl shadow-orange-200 dark:shadow-none transition-all active:scale-[0.98]"
                                    >
                                        Proses Pembayaran
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="p-6 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest">Metode Bayar</span>
                                        <span className="font-black">{order.payment_method || 'CASH'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest">Status Transaksi</span>
                                        <span className="font-black">LUNAS</span>
                                    </div>
                                </div>
                                {paymentResult && (
                                    <div className="p-6 bg-white rounded-3xl text-slate-900 shadow-xl animate-in zoom-in-95">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uang Kembali (Change)</p>
                                        <p className="text-4xl font-black text-emerald-600">Rp {paymentResult.change.toLocaleString()}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <AlertCircle size={20} className="shrink-0 text-emerald-100" />
                                    <p className="text-[11px] font-medium leading-relaxed text-emerald-50">Pesanan telah lunas. Anda sekarang dapat mencetak struk atau menyelesaikan pengiriman.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer CRM Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full blur-3xl -mb-16 -mr-16"></div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Informasi Profil Pelanggan</h4>
                        
                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-[2rem] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xl">
                                    <User size={36} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{order.customer_name || 'Guest Customer'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Regular Member
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <p className="font-bold text-slate-900 dark:text-white">{order.customer_phone || '+62 -'}</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <MapPin size={18} />
                                    </div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Jakarta, Indonesia</p>
                                </div>
                            </div>

                            <button className="w-full py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:border-orange-600 hover:text-orange-600 transition-all">Lihat Riwayat Pelanggan</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINT TEMPLATE (HIDDEN UNTIL PRINT) */}
            <div className="print-only p-10 max-w-[400px] mx-auto text-center font-mono">
                <h2 className="text-3xl font-black mb-1 tracking-tighter">STEAMLINE</h2>
                <p className="text-[10px] mb-6 uppercase tracking-widest opacity-70">Laundry Management Professional</p>
                
                <div className="border-t border-b border-black border-dashed py-4 my-6 text-left text-[11px] space-y-2">
                    <div className="flex justify-between"><span>ORDER ID</span> <span className="font-bold">#ORD-{order.id}</span></div>
                    <div className="flex justify-between"><span>DATE</span> <span>{new Date(order.created_at).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>STAFF</span> <span>{user?.full_name || 'CASHIER'}</span></div>
                    <div className="flex justify-between"><span>CUSTOMER</span> <span>{order.customer_name || 'GUEST'}</span></div>
                </div>

                <table className="w-full text-[11px] text-left mb-6">
                    <thead>
                        <tr className="border-b border-black border-dashed font-bold">
                            <th className="py-2">SERVICE</th>
                            <th className="py-2 text-right">PRICE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black divide-dashed">
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-2 uppercase">{item.service_name}<br/><span className="opacity-70">{item.quantity} {item.unit}</span></td>
                                <td className="py-2 text-right">Rp {parseFloat(item.subtotal).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t border-black border-dashed pt-4 font-black flex justify-between text-xl">
                    <span>TOTAL</span>
                    <span>Rp {parseFloat(order.total_price).toLocaleString()}</span>
                </div>

                <div className="mt-4 space-y-1 text-[11px] opacity-80 text-left">
                    <div className="flex justify-between uppercase"><span>Method</span> <span>{order.payment_method || 'CASH'}</span></div>
                    {paymentResult && (
                        <>
                            <div className="flex justify-between uppercase"><span>Cash Received</span> <span>Rp {paymentResult.paid.toLocaleString()}</span></div>
                            <div className="flex justify-between uppercase font-black"><span>Change</span> <span>Rp {paymentResult.change.toLocaleString()}</span></div>
                        </>
                    )}
                </div>

                <div className="mt-12 text-[10px] italic border-t border-black border-dashed pt-6 space-y-2">
                    <p>Terima kasih telah mempercayakan pakaian Anda kepada kami!</p>
                    <p>Track status: steamline.id/track?id={order.id}</p>
                </div>
            </div>
        </div>
    );
};

export default POSDetail;

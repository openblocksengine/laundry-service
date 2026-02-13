import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { 
    Package, 
    ChevronLeft, 
    Clock, 
    MapPin, 
    CreditCard, 
    CheckCircle2, 
    Circle, 
    ArrowRight,
    Printer,
    Download,
    Receipt,
    Loader2,
    Calendar,
    Truck,
    Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [trackingLogs, setTrackingLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time polling: Refresh every 10 seconds
        const intervalId = setInterval(fetchData, 10000);
        return () => clearInterval(intervalId);
    }, [orderId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Menyiapkan Detail Pesanan...</p>
        </div>
    );

    if (!orderData) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Pesanan Tidak Ditemukan</h2>
            <button onClick={() => navigate('/app/my-orders')} className="text-orange-600 font-bold">Kembali ke Riwayat Pesanan</button>
        </div>
    );

    const { order, items } = orderData;

    const handlePrint = () => {
        window.print();
    };

    const statusSteps = [
        { key: 'pending', label: 'Diterima', icon: <Clock size={20} /> },
        { key: 'washing', label: 'Dicuci', icon: <Package size={20} /> },
        { key: 'drying', label: 'Dikeringkan', icon: <Package size={20} /> },
        { key: 'ironing', label: 'Disetrika', icon: <Package size={20} /> },
        { key: 'ready_for_delivery', label: 'Siap Kirim', icon: <CheckCircle2 size={20} /> },
        { key: 'delivery', label: 'Pengiriman', icon: <Truck size={20} /> },
        { key: 'completed', label: 'Selesai', icon: <CheckCircle2 size={20} /> }
    ];

    const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/app/my-orders')}
                        className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Order #ORD-{order.id}</h2>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                order.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                                {order.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Printer size={18} /> Cetak Nota
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                        <Download size={18} /> Unduh PDF
                    </button>
                </div>
            </div>

            {/* Progress Tracker - Premium Style */}
            <div className="no-print bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl mb-12 overflow-x-auto">
                <div className="min-w-[800px] relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                        style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    ></div>

                    <div className="relative z-10 flex justify-between">
                        {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStatusIndex;
                            const isCurrent = idx === currentStatusIndex;

                            return (
                                <div key={step.key} className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4",
                                        isCompleted ? "bg-orange-600 text-white border-orange-100 dark:border-orange-950/50 shadow-lg shadow-orange-200" : "bg-white dark:bg-slate-900 text-slate-300 border-slate-100 dark:border-slate-800",
                                        isCurrent && "scale-125 ring-8 ring-orange-50 dark:ring-orange-950/20"
                                    )}>
                                        {step.icon}
                                    </div>
                                    <div className="mt-6 text-center">
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isCompleted ? "text-orange-600" : "text-slate-400"
                                        )}>
                                            {step.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Items List */}
                    <section>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Receipt className="text-orange-600" /> Detail Layanan
                        </h3>
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 dark:text-white">{item.service_name}</p>
                                                <p className="text-xs text-slate-500 font-medium">Rp {parseFloat(item.unit_price).toLocaleString()} / {item.unit}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black">{item.quantity} {item.unit}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white">
                                                Rp {parseFloat(item.subtotal).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-900 text-white">
                                    <tr>
                                        <td colSpan="2" className="px-8 py-6 font-bold uppercase tracking-widest text-xs">Total Pembayaran</td>
                                        <td className="px-8 py-6 text-right text-2xl font-black text-orange-500">
                                            Rp {parseFloat(order.total_price).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>

                    {/* Tracking Timeline */}
                    <section>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Truck className="text-orange-600" /> Riwayat Pelacakan
                        </h3>
                        <div className="relative pl-8 space-y-8 before:absolute before:top-2 before:left-[11px] before:w-0.5 before:h-[calc(100%-16px)] before:bg-slate-100 dark:before:bg-slate-800">
                            {trackingLogs.map((log, idx) => (
                                <div key={idx} className="relative">
                                    <div className={cn(
                                        "absolute -left-[30px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center z-10",
                                        idx === 0 ? "bg-orange-600" : "bg-slate-200 dark:bg-slate-700"
                                    )}>
                                        {idx === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className={cn(
                                                "font-black text-sm uppercase tracking-tight",
                                                idx === 0 ? "text-slate-900 dark:text-white" : "text-slate-400"
                                            )}>
                                                {log.status.replace(/_/g, ' ')}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                {new Date(log.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">{log.description || `Pesanan beralih ke status ${log.status.replace(/_/g, ' ')}`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Information Cards */}
                <div className="space-y-8">
                    {/* Payment Status Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                            <CreditCard size={24} />
                        </div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informasi Pembayaran</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">Metode</span>
                                <span className="font-bold text-slate-900 dark:text-white uppercase">{order.payment_method || 'BANK'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">Status</span>
                                <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                    order.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                        
                        {order.payment_status === 'unpaid' && (
                            <button 
                                onClick={() => window.open(`https://wa.me/6285316065960?text=Konfirmasi Pembayaran #ORD-${order.id}`, '_blank')}
                                className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                            >
                                Konfirmasi Pembayaran
                            </button>
                        )}
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                            <MapPin size={24} />
                        </div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Alamat Penjemputan</h4>
                        <div className="space-y-2">
                            <p className="font-bold text-slate-900 dark:text-white">{order.customer_name}</p>
                            <p className="text-sm text-slate-500 font-medium">{order.customer_phone}</p>
                            <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800 flex items-start gap-3">
                                <Info size={16} className="text-orange-600 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-slate-400 leading-relaxed">Pastikan kurir kami dapat menghubungi nomor telepon Anda saat penjemputan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINT TEMPLATE (HIDDEN UNTIL PRINT) */}
            <div className="print-only p-10 max-w-2xl mx-auto text-slate-900 bg-white">
                <div className="flex justify-between items-start mb-10 pb-10 border-b-2 border-slate-100">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-1">STEAMLINE</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Layanan Laundry Profesional<br/>
                            Jakarta - Indonesia
                        </p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-black mb-1 uppercase tracking-widest text-orange-600">Invoice</h3>
                        <p className="font-bold text-slate-900">#ORD-{order.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Informasi Pelanggan</h4>
                        <p className="font-bold text-lg">{order.customer_name}</p>
                        <p className="text-sm text-slate-500 font-medium">{order.customer_phone}</p>
                    </div>
                    <div className="text-right">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Rincian Transaksi</h4>
                        <p className="text-sm font-bold">Tanggal: <span className="text-slate-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</span></p>
                        <p className="text-sm font-bold">Metode: <span className="text-slate-500 uppercase">{order.payment_method || 'BANK'}</span></p>
                        <p className="text-sm font-bold">Status: <span className="text-slate-500 uppercase">{order.payment_status}</span></p>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead className="border-b-2 border-slate-100">
                        <tr>
                            <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan</th>
                            <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                            <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-6">
                                    <p className="font-bold text-slate-900">{item.service_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Rp {parseFloat(item.unit_price).toLocaleString()} / {item.unit}</p>
                                </td>
                                <td className="py-6 text-center font-bold text-slate-600">{item.quantity} {item.unit}</td>
                                <td className="py-6 text-right font-black text-slate-900">Rp {parseFloat(item.subtotal).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-900">
                        <tr>
                            <td colSpan="2" className="py-6 font-black uppercase tracking-[0.2em] text-[10px]">Total Pembayaran</td>
                            <td className="py-6 text-right text-3xl font-black text-orange-600">Rp {parseFloat(order.total_price).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="p-8 bg-slate-50 rounded-3xl text-center border-2 border-slate-100 border-dashed">
                    <p className="text-sm font-bold text-slate-600 mb-1 italic">"Terima kasih telah mempercayakan pakaian Anda kepada kami!"</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Syarat & Ketentuan Berlaku • Steamline Laundry</p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;

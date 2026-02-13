import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { CreditCard, Banknote, CheckCircle2, Loader2, ArrowLeft, Send } from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';
import { cn } from '../../lib/utils';

const Checkout = () => {
    const [cartData, setCartData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [submitting, setSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const navigate = useNavigate();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        const saved = localStorage.getItem('pending_cart');
        if (!saved) {
            navigate('/app/dashboard');
            return;
        }
        setCartData(JSON.parse(saved));
    }, [navigate]);

    const handleConfirmOrder = async () => {
        setSubmitting(true);
        try {
            const response = await axios.post('/orders', {
                items: cartData.items.map(i => ({ service_id: i.id, quantity: i.quantity })),
                payment_method: paymentMethod
            });
            
            setOrderId(response.data.order_id);
            setIsCompleted(true);
            localStorage.removeItem('pending_cart');
            
            addNotification({
                title: 'Pesanan Berhasil',
                description: 'Pesanan Anda telah diterima dan sedang diproses.',
                type: 'success'
            });
        } catch (error) {
            console.error("Order error:", error);
            addNotification({
                title: 'Gagal Membuat Pesanan',
                description: 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!cartData && !isCompleted) return null;

    if (isCompleted) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Pesanan Diterima!</h2>
                    <p className="text-slate-500 mb-8 font-medium">Nomor Pesanan Anda: <span className="text-orange-600 font-black">#ORD-{orderId}</span></p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl mb-8 text-left border border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-widest">Instruksi Pembayaran</h4>
                        {paymentMethod === 'bank' ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">Silakan transfer ke nomor rekening berikut:</p>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-orange-100 dark:border-orange-900/30">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">BCA / MANDIRI / GOPAY</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-widest">00000000000</p>
                                    <p className="text-sm font-bold text-slate-500 mt-1">A/N STEAMLINE LAUNDRY</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">Siapkan uang pas sebesar <span className="font-bold text-slate-900">Rp {cartData.total.toLocaleString()}</span> saat kurir menjemput cucian Anda.</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <a 
                            href={`https://wa.me/6285316065960?text=Halo Steamline, saya ingin konfirmasi pembayaran untuk Pesanan #ORD-${orderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Send size={24} /> Konfirmasi via WhatsApp
                        </a>
                        <button 
                            onClick={() => navigate('/app/dashboard')}
                            className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-orange-600 font-bold mb-8 transition-colors">
                <ArrowLeft size={20} /> Kembali
            </button>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-12">Pilih Metode Pembayaran</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <button 
                        onClick={() => setPaymentMethod('bank')}
                        className={cn(
                            "w-full p-8 rounded-[2.5rem] border-2 transition-all text-left group",
                            paymentMethod === 'bank' ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/10" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200"
                        )}
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                            paymentMethod === 'bank' ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600"
                        )}>
                            <CreditCard size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Transfer Bank / E-Wallet</h3>
                        <p className="text-sm text-slate-500 font-medium">BCA, Mandiri, ShopeePay, GoPay, OVO.</p>
                    </button>

                    <button 
                        onClick={() => setPaymentMethod('cod')}
                        className={cn(
                            "w-full p-8 rounded-[2.5rem] border-2 transition-all text-left group",
                            paymentMethod === 'cod' ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/10" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200"
                        )}
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                            paymentMethod === 'cod' ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600"
                        )}>
                            <Banknote size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Bayar di Tempat (COD)</h3>
                        <p className="text-sm text-slate-500 font-medium">Bayar tunai saat kurir mengambil pakaian Anda.</p>
                    </button>
                </div>

                <div>
                    <div className="bg-slate-900 text-white rounded-[3rem] p-10 sticky top-24 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-6 uppercase tracking-widest text-xs text-slate-400">Ringkasan Pesanan</h3>
                        <div className="space-y-4 mb-10">
                            {cartData.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">{item.name} x{item.quantity}</span>
                                    <span className="font-black">Rp {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Pembayaran</span>
                            <span className="text-4xl font-black text-orange-500">Rp {cartData.total.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={handleConfirmOrder}
                            disabled={submitting}
                            className="w-full bg-orange-600 hover:bg-orange-700 py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'Selesaikan Pesanan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

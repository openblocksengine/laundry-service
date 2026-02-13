import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { ShoppingBag, Package, Trash2, ChevronRight, Loader2, Plus, Minus } from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';

const NewOrder = () => {
    const [services, setServices] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('/services');
                setServices(response.data);
            } catch (error) {
                console.error("Error fetching services", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const addToCart = (service) => {
        const exists = cart.find(item => item.id === service.id);
        if (exists) {
            setCart(cart.map(item => item.id === service.id ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCart([...cart, {...service, quantity: 1}]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0.1, item.quantity + delta);
                return { ...item, quantity: parseFloat(newQty.toFixed(1)) };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        // Save cart to state/localstorage and proceed to payment
        localStorage.setItem('pending_cart', JSON.stringify({ items: cart, total }));
        navigate('/app/checkout');
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center md:text-left">Pesan Laundry Baru</h2>
                <p className="text-slate-500 font-medium text-center md:text-left">Pilih layanan laundry yang Anda butuhkan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Package size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{s.name}</h3>
                            <p className="text-2xl font-black text-orange-600 mb-6">
                                Rp {parseFloat(s.price).toLocaleString()}
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">/ {s.unit}</span>
                            </p>
                            <button 
                                onClick={() => addToCart(s)}
                                className="w-full py-3.5 rounded-2xl bg-orange-600 text-white font-black text-sm hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 group-hover:shadow-orange-300"
                            >
                                <Plus size={18} /> Tambah ke Keranjang
                            </button>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden sticky top-24">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <ShoppingBag className="text-orange-600" /> Keranjang
                            </h3>
                        </div>
                        
                        <div className="p-8 max-h-[400px] overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="font-bold uppercase tracking-widest text-xs">Belum ada layanan terpilih</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between group">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                                                <p className="text-xs font-black text-orange-600">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-orange-600"><Minus size={14}/></button>
                                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-orange-600"><Plus size={14}/></button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-900 text-white rounded-t-[2.5rem]">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Estimasi</span>
                                <span className="text-3xl font-black">Rp {total.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full bg-orange-600 hover:bg-orange-700 py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrder;

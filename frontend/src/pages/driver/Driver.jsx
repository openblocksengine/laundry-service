import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Package, Truck, CheckCircle, MapPin, Phone, Loader2, Navigation, Search } from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';

const Driver = () => {
    const { addNotification } = useNotificationStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTasks();
        
        // Real-time polling: Refresh tasks every 10 seconds
        const intervalId = setInterval(fetchTasks, 10000);
        
        return () => clearInterval(intervalId);
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/driver/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        setUpdating(orderId);
        try {
            const endpoint = currentStatus === 'ready_for_delivery' ? 'pickup' : 'deliver';
            await axios.put(`/orders/${orderId}/${endpoint}`);
            addNotification({
                title: 'Status Diperbarui',
                description: `Pesanan #ORD-${orderId} telah berhasil diperbarui.`,
                type: 'success'
            });
            fetchTasks();
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredTasks = tasks.filter(task => 
        task.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toString().includes(searchTerm)
    );

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Logistics & Delivery</h2>
                    <p className="text-slate-500 text-sm">Manage your daily pickup and delivery tasks</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        className="input-field pl-10 py-2 text-sm" 
                        placeholder="Cari pesanan/nama..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                    <div className="card-glass p-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{searchTerm ? 'Tidak ada tugas yang cocok dengan pencarian Anda.' : 'No delivery tasks available at the moment.'}</p>
                    </div>
                ) : filteredTasks.map((task) => (
                    <div key={task.id} className="card overflow-hidden border-l-4 border-orange-500">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</span>
                                    <h3 className="text-lg font-bold text-orange-600">#ORD-{task.id}</h3>
                                </div>
                                <span className={`badge ${task.status === 'delivery' ? 'badge-primary' : 'badge-warning'}`}>
                                    {task.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
                                        <p className="font-bold text-slate-800">{task.customer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Contact</p>
                                        <p className="font-bold text-slate-800">{task.customer_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {task.status === 'ready_for_delivery' ? (
                                    <button 
                                        onClick={() => handleUpdateStatus(task.id, task.status)}
                                        disabled={updating === task.id}
                                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {updating === task.id ? <Loader2 className="animate-spin" size={18} /> : <Truck size={18} />}
                                        Mark as Picked Up
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpdateStatus(task.id, task.status)}
                                        disabled={updating === task.id}
                                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex-1 flex items-center justify-center gap-2"
                                    >
                                        {updating === task.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Confirm Delivery
                                    </button>
                                )}
                                <a 
                                    href={`https://wa.me/${task.customer_phone}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn bg-white border-2 border-slate-100 text-slate-600 p-2.5"
                                >
                                    <Navigation size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Driver;

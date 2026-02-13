import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Plus, Edit2, Trash2, X, Loader2, Search, Tag, Scale, Info, ChevronDown, ArrowRight } from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';
import { cn } from '../../lib/utils';

const Services = () => {
    const { addNotification } = useNotificationStore();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    
    // Form state
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('kg');
    const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setName(service.name);
            setUnit(service.unit);
            setPrice(service.price);
        } else {
            setEditingService(null);
            setName('');
            setUnit('kg');
            setPrice('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { name, unit, price: parseFloat(price) };
            if (editingService) {
                await axios.put(`/services/${editingService.id}`, payload);
                addNotification({
                    title: 'Layanan Diperbarui',
                    description: 'Data layanan telah berhasil disimpan.',
                    type: 'success'
                });
            } else {
                await axios.post('/services', payload);
                addNotification({
                    title: 'Layanan Ditambahkan',
                    description: 'Layanan baru telah tersedia di daftar.',
                    type: 'success'
                });
            }
            setIsModalOpen(false);
            fetchServices();
        } catch (error) {
            addNotification({
                title: 'Gagal',
                description: 'Terjadi kesalahan saat menyimpan data.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await axios.delete(`/services/${id}`);
            addNotification({
                title: 'Layanan Dihapus',
                description: 'Layanan telah berhasil dihapus dari sistem.',
                type: 'info'
            });
            fetchServices();
        } catch (error) {
            addNotification({
                title: 'Gagal Hapus',
                description: 'Layanan mungkin masih digunakan dalam pesanan aktif.',
                type: 'error'
            });
        }
    };

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Services & Pricing</h2>
                    <p className="text-slate-500 font-medium">Kelola daftar layanan dan harga laundry Anda.</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="input-field pl-10 py-2.5 text-sm bg-white dark:bg-slate-900 shadow-sm" 
                            placeholder="Cari layanan..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-orange-700 text-white py-3.5 px-8 rounded-2xl font-black text-sm shadow-xl shadow-orange-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                        <Plus size={20} strokeWidth={3} /> Add New Service
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Services...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center">
                        <p className="text-slate-400 font-bold">Tidak ada layanan yang ditemukan.</p>
                    </div>
                ) : filteredServices.map((service) => (
                    <div key={service.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-28 group-hover:h-28"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="px-3 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                    Per {service.unit}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(service)}
                                        className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-600 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{service.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-orange-600">Rp {parseFloat(service.price).toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">/ {service.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {editingService ? 'Update Service' : 'Add New Service'}
                                </h3>
                                <p className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                    <Info size={12} strokeWidth={3} /> Konfigurasi Layanan Laundry
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="relative z-10 p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:rotate-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                {/* Service Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Nama Layanan</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">
                                            <Tag size={20} />
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-orange-600 dark:focus:border-orange-600 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400" 
                                            placeholder="cth: Cuci Kering Setrika Premium" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Unit Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Satuan</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">
                                                <Scale size={20} />
                                            </div>
                                            <select 
                                                className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-orange-600 dark:focus:border-orange-600 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer" 
                                                value={unit} 
                                                onChange={(e) => setUnit(e.target.value)}
                                            >
                                                <option value="kg">Per Kilogram (kg)</option>
                                                <option value="pcs">Per Lembar (pcs)</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Input */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Harga (Rp)</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors font-bold">
                                                Rp
                                            </div>
                                            <input 
                                                type="number" 
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-orange-600 dark:focus:border-orange-600 rounded-2xl outline-none transition-all font-black text-slate-900 dark:text-white" 
                                                placeholder="0" 
                                                value={price} 
                                                onChange={(e) => setPrice(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-orange-600/20 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            {editingService ? 'SIMPAN PERUBAHAN' : 'TAMBAH LAYANAN'}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
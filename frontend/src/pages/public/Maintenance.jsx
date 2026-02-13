import React from 'react';
import { Construction, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-full flex items-center justify-center">
                        <Settings size={48} className="animate-spin-slow" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
                        <Construction size={20} className="text-orange-600" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Dalam Perbaikan</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 text-balance">
                    Mohon maaf, halaman <span className="text-orange-600 font-bold">Profile Settings</span> saat ini masih dalam tahap pengembangan untuk memberikan pengalaman terbaik bagi Anda.
                </p>

                <button 
                    onClick={() => navigate(-1)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <ArrowLeft size={22} /> Kembali ke Sebelumnya
                </button>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Maintenance;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../../api/axios';
import Lenis from 'lenis';
import { 
    Search, 
    Truck, 
    ShieldCheck, 
    Clock, 
    Loader2, 
    Package, 
    CheckCircle2, 
    ArrowRight,
    MapPin,
    ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

// UI Components
import { Header } from '../../components/ui/Header';
import { MinimalFooter } from '../../components/ui/MinimalFooter';
import TextReveal from '../../components/ui/TextReveal';
import AvatarGroup from '../../components/ui/AvatarGroup';

const LandingPage = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);
    const [services, setServices] = useState([]);

    // Initialize Smooth Scroll
    useEffect(() => {
        let lenis;
        try {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
        } catch (e) {
            console.error("Lenis initialization error:", e);
        }
        
        return () => {
            if (lenis) lenis.destroy();
        };
    }, []);

    // Fetch Services
    useEffect(() => {
        let isMounted = true;
        const fetchServices = async () => {
            try {
                const response = await axios.get('/services');
                if (isMounted) setServices(response.data || []);
            } catch (err) {
                console.error("Failed to fetch services:", err);
            }
        };
        fetchServices();
        return () => { isMounted = false; };
    }, []);

    const handleTrack = useCallback(async (e) => {
        e.preventDefault();
        // Remove common prefixes like #, ORD-, etc.
        let cleanedId = orderId.trim().replace(/[^0-9]/g, '');
        
        if (!cleanedId) return;
        
        setLoading(true);
        setError('');
        setTrackingData(null);
        
        try {
            const response = await axios.get(`/tracking/${cleanedId}`);
            setTrackingData(response.data);
            setTimeout(() => {
                const element = document.getElementById('tracking-result');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 150);
        } catch (err) {
            setError('ID Pesanan tidak ditemukan. Mohon periksa kembali nomor pada struk Anda.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const faqData = useMemo(() => [
        {
            q: "Berapa lama estimasi pengerjaan laundry?",
            a: "Kami menawarkan tiga kategori waktu: Reguler (2-3 hari), Express (24 jam), dan Flash (6-12 jam) untuk penanganan super cepat."
        },
        {
            q: "Apakah ada fasilitas jemput antar pakaian?",
            a: "Ya, kami menyediakan kurir khusus untuk menjemput dan mengantar pakaian Anda. Gratis ongkir untuk radius 5km dengan minimal cuci Rp 50.000."
        },
        {
            q: "Bagaimana jika pakaian saya tertukar atau rusak?",
            a: "Setiap pakaian diberikan label unik berbasis sistem kami. Jika terjadi kerusakan akibat kelalaian kami, tersedia kompensasi sesuai standar garansi Steamline."
        },
        {
            q: "Cara termudah untuk memantau status cucian?",
            a: "Gunakan fitur Lacak Pesanan di halaman ini. Masukkan ID Pesanan Anda untuk melihat posisi cucian secara real-time."
        }
    ], []);

    return (
        <main className="relative min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-600 overflow-x-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 md:pt-36 pb-20 px-6" aria-labelledby="hero-title">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col items-start">
                        <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl mb-10 shadow-sm animate-in fade-in duration-700">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600">Teknologi Laundry Modern</span>
                        </div>
                        
                        <h1 id="hero-title" className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-10 animate-in slide-in-from-bottom-4 duration-700">
                            Cucian <span className="text-orange-600 text-glow">Bersih</span><br/>
                            Hasil Juara.
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            Nikmati kenyamanan perawatan pakaian kelas dunia dengan transparansi penuh. Kami mencuci dengan hati, mengantar dengan cepat.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <a href="#tracking" className="w-full sm:w-auto bg-orange-600 text-white py-5 px-12 rounded-[2.5rem] text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-orange-200 hover:bg-orange-700 transition-all hover:-translate-y-1 active:scale-95 focus:ring-4 focus:ring-orange-100 outline-none">
                                Mulai Lacak <ArrowRight size={24} />
                            </a>
                            <div className="flex flex-col items-center sm:items-start gap-2">
                                <AvatarGroup />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-slate-900 font-black">10,000+</span> Pelanggan Puas
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in zoom-in-95 duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent blur-[120px] -z-10 rounded-full" aria-hidden="true"></div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-orange-600/10 rounded-[4rem] blur-2xl group-hover:bg-orange-600/20 transition-all" aria-hidden="true"></div>
                            <img 
                                src="/wanita-laundry.webp" 
                                alt="Staf Steamline Profesional" 
                                className="relative rounded-[3.5rem] shadow-2xl border border-white/20 aspect-[4/5] object-cover w-full"
                                loading="eager"
                            />
                            <div className="absolute -bottom-10 -left-4 md:-left-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-100 animate-bounce-slow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Estimasi Jemput</p>
                                        <p className="font-black text-slate-900">Driver Tersedia</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Section */}
            <section id="features" className="py-20 bg-white">
                <TextReveal word="Standar Kualitas Tertinggi" className="py-20" />
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Higienitas Total', desc: 'Metode sterilisasi pakaian untuk memastikan kuman dan bakteri hilang sempurna.', icon: <CheckCircle2 size={32} /> },
                        { title: 'Antar Jemput AI', desc: 'Sistem logistik cerdas yang memastikan kurir sampai tepat waktu di lokasi Anda.', icon: <MapPin size={32} /> },
                        { title: 'Proteksi Serat', desc: 'Penanganan khusus untuk kain sensitif agar tetap awet dan warna tidak pudar.', icon: <ShieldCheck size={32} /> },
                    ].map((feat, idx) => (
                        <article key={idx} className="p-12 rounded-[3.5rem] bg-white border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100 transition-all group">
                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                {feat.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{feat.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="services" className="py-32 px-6 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <TextReveal word="Layanan Laundry Pilihan" className="py-0 mb-20" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.length > 0 ? services.map((service) => (
                            <article key={service.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-orange-500 transition-all hover:shadow-2xl hover:shadow-orange-100 group flex flex-col">
                                <div className="mb-8 flex justify-between items-start">
                                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <Package size={28} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Laundry</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{service.name}</h3>
                                <p className="text-sm text-slate-400 font-medium mb-6 flex-1">Layanan cuci bersih standar profesional Steamline.</p>
                                <div className="flex items-baseline gap-1 mt-auto">
                                    <span className="text-3xl font-black text-orange-600">Rp {parseFloat(service.price).toLocaleString()}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">/ {service.unit}</span>
                                </div>
                                <a href="/register" className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg active:scale-[0.98] outline-none">
                                    Pesan Sekarang
                                </a>
                            </article>
                        )) : (
                            [1,2,3,4].map(i => <div key={i} className="bg-white/50 h-80 rounded-[3rem] animate-pulse border border-slate-100" />)
                        )}
                    </div>
                </div>
            </section>

            {/* Tracking Section (Black) */}
            <section id="tracking" className="py-32 px-6 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 blur-[180px] -z-0 rounded-full translate-x-1/2 -translate-y-1/2" aria-hidden="true"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-5 py-1.5 bg-orange-600/20 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8">Pelacakan Aktif</div>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Di mana cucian Anda?</h2>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Pantau kemajuan proses laundry Anda mulai dari jemput, cuci, hingga tiba kembali.</p>
                    </div>

                    <form onSubmit={handleTrack} className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 flex flex-col md:flex-row gap-4 shadow-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-orange-500" size={28} />
                            <input 
                                type="text" 
                                className="w-full pl-18 pr-8 py-7 rounded-[2rem] bg-transparent border-none focus:ring-2 focus:ring-orange-600 text-2xl font-bold text-white placeholder:text-slate-700 outline-none" 
                                placeholder="ID Pesanan (cth: 123)" 
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                aria-label="Order ID"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-14 py-7 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'LACAK'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-8 p-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-center font-bold animate-in shake-1">
                            {error}
                        </div>
                    )}

                    {trackingData && (
                        <div id="tracking-result" className="mt-20 space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                                    <div className="text-center md:text-left">
                                        <p className="text-orange-100 uppercase tracking-widest text-[10px] font-black mb-3 opacity-80">Tahapan Saat Ini</p>
                                        <h2 className="text-5xl md:text-6xl font-black capitalize tracking-tighter leading-none">{trackingData.order.status.replace(/_/g, ' ')}</h2>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-orange-100 uppercase tracking-widest text-[10px] font-black mb-3 opacity-80">Pelanggan</p>
                                        <h3 className="text-3xl font-black">{trackingData.order.customer_name}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[4rem] p-10 md:p-16 text-slate-900 shadow-2xl border border-slate-100">
                                <div className="space-y-12 relative">
                                    <div className="absolute left-[15px] top-3 bottom-3 w-1.5 bg-slate-50 rounded-full"></div>
                                    {trackingData.logs.map((log, index) => (
                                        <div key={index} className="relative pl-16">
                                            <div className={cn(
                                                "absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-700",
                                                index === 0 ? "bg-orange-600 scale-125" : "bg-slate-200"
                                            )}>
                                                {index === 0 && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>}
                                            </div>
                                            <div>
                                                <h4 className={cn(
                                                    "text-2xl font-black capitalize mb-1.5",
                                                    index === 0 ? "text-orange-600" : "text-slate-400"
                                                )}>
                                                    {log.status.replace(/_/g, ' ')}
                                                </h4>
                                                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.15em]">
                                                    {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <TextReveal word="Pertanyaan Umum" className="py-0 mb-20" />
                    <div className="space-y-5">
                        {faqData.map((faq, i) => (
                            <article key={i} className="group">
                                <button 
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-10 rounded-[2.5rem] border transition-all text-left outline-none focus:ring-4 focus:ring-orange-50",
                                        activeFaq === i ? "bg-orange-50 border-orange-200 shadow-2xl shadow-orange-100" : "bg-white border-slate-100 hover:border-orange-100"
                                    )}
                                    aria-expanded={activeFaq === i}
                                >
                                    <span className={cn(
                                        "text-xl font-bold transition-colors",
                                        activeFaq === i ? "text-orange-600" : "text-slate-900"
                                    )}>{faq.q}</span>
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                                        activeFaq === i ? "bg-orange-600 text-white rotate-180" : "bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600"
                                    )}>
                                        <ChevronDown size={24} />
                                    </div>
                                </button>
                                <div className={cn(
                                    "overflow-hidden transition-all duration-500 ease-in-out",
                                    activeFaq === i ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                )}>
                                    <div className="p-10 text-slate-500 font-medium text-lg leading-relaxed text-balance">
                                        {faq.a}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <MinimalFooter />

            <style>{`
                .text-glow { text-shadow: 0 0 30px rgba(234, 88, 12, 0.3); }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-8%); }
                    50% { transform: translateY(0); }
                }
                .shake-1 { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .pl-18 { padding-left: 4.5rem; }
            `}</style>
        </main>
    );
};

export default LandingPage;

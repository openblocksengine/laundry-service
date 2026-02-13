import React from 'react';
import { 
    Facebook, 
    Instagram, 
    Twitter, 
    Youtube, 
    MapPin,
    Phone,
    Mail,
    Clock
} from 'lucide-react';

export function MinimalFooter() {
	const year = new Date().getFullYear();

	const services = [
		{ title: 'Cuci Kiloan', href: '#services' },
		{ title: 'Cuci Satuan', href: '#services' },
		{ title: 'Bedcover & Selimut', href: '#services' },
		{ title: 'Setrika Express', href: '#services' },
		{ title: 'Antar Jemput', href: '#features' },
	];

	const company = [
		{ title: 'Tentang Kami', href: '#' },
		{ title: 'Lokasi Outlet', href: '#' },
		{ title: 'Syarat & Ketentuan', href: '#' },
		{ title: 'Kebijakan Privasi', href: '#' },
	];

	const socialLinks = [
		{ icon: <Facebook className="size-4" />, link: '#', label: 'Facebook' },
		{ icon: <Instagram className="size-4" />, link: '#', label: 'Instagram' },
		{ icon: <Twitter className="size-4" />, link: '#', label: 'Twitter' },
		{ icon: <Youtube className="size-4" />, link: '#', label: 'Youtube' },
	];

	return (
		<footer className="relative bg-white border-t border-slate-100" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
			<div className="mx-auto max-w-7xl px-6 py-16">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-12">
					<div className="col-span-1 md:col-span-4 flex flex-col gap-6">
						<a href="/" className="flex items-center gap-3">
							<img src="/logo.png" alt="Steamline Logo" className="w-8 h-8 object-contain" />
                            <span className="font-black text-2xl tracking-tight text-slate-900">Steamline</span>
						</a>
						<p className="text-slate-500 max-w-sm font-medium text-sm leading-relaxed text-balance">
							Steamline adalah solusi laundry modern masa kini. Kami menggabungkan teknologi real-time tracking dengan keahlian perawatan pakaian terbaik untuk memberikan hasil cucian yang higienis, rapi, dan cepat.
						</p>
                        <address className="not-italic space-y-3">
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <MapPin size={16} className="text-orange-600 flex-shrink-0" />
                                <span>Jl. Kebersihan Raya No. 123, Jakarta Selatan</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <Phone size={16} className="text-orange-600 flex-shrink-0" />
                                <span>+62 812 3456 7890</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <Mail size={16} className="text-orange-600 flex-shrink-0" />
                                <span>halo@steamline.id</span>
                            </div>
                        </address>
						<div className="flex gap-3 mt-2">
							{socialLinks.map((item, i) => (
								<a
									key={i}
									className="hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all text-slate-400 rounded-xl border border-slate-200 p-2.5"
									target="_blank"
									rel="noopener noreferrer"
									href={item.link}
                                    aria-label={item.label}
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>

					<div className="col-span-1 md:col-span-2 md:ml-auto">
						<h3 className="text-slate-900 font-bold mb-6 text-xs uppercase tracking-widest">
							Layanan Kami
						</h3>
						<ul className="flex flex-col gap-3">
							{services.map(({ href, title }, i) => (
								<li key={i}>
                                    <a
                                        className="w-max text-sm font-medium text-slate-500 duration-200 hover:text-orange-600 transition-colors"
                                        href={href}
                                    >
                                        {title}
                                    </a>
                                </li>
							))}
						</ul>
					</div>

					<div className="col-span-1 md:col-span-2">
						<h3 className="text-slate-900 font-bold mb-6 text-xs uppercase tracking-widest">
							Perusahaan
						</h3>
						<ul className="flex flex-col gap-3">
							{company.map(({ href, title }, i) => (
								<li key={i}>
                                    <a
                                        className="w-max text-sm font-medium text-slate-500 duration-200 hover:text-orange-600 transition-colors"
                                        href={href}
                                    >
                                        {title}
                                    </a>
                                </li>
							))}
						</ul>
					</div>

                    <section className="col-span-1 md:col-span-4 bg-orange-50 rounded-[2rem] p-8 border border-orange-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-orange-600" />
                            <h3 className="font-bold text-slate-900">Jam Operasional</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Senin - Jumat</span>
                                <span className="font-bold text-slate-900">07:00 - 21:00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Sabtu - Minggu</span>
                                <span className="font-bold text-slate-900">08:00 - 18:00</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-orange-200/50">
                            <p className="text-[10px] text-orange-700 font-black uppercase tracking-widest mb-3 italic">Butuh Penjemputan?</p>
                            <button className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98]">
                                Chat Via WhatsApp
                            </button>
                        </div>
                    </section>
				</div>

				<div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center md:text-left">
						© {year} Steamline Laundry Management System.
					</p>
                    <nav className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-orange-600 transition-colors">Terms of Use</a>
                    </nav>
				</div>
			</div>
		</footer>
	);
}

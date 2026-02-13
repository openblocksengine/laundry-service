import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Menu, X } from 'lucide-react';
import { useScroll } from '../../hooks/use-scroll';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(20);

    const links = [
        { label: 'Fitur', href: '#features' },
        { label: 'Lacak Pesanan', href: '#tracking' },
        { label: 'Layanan', href: '#services' },
        { label: 'FAQ', href: '#faq' },
    ];

    const toggleMenu = () => setOpen(!open);

    return (
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500 ease-in-out",
                scrolled 
                    ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-3 shadow-sm" 
                    : "bg-transparent border-b border-transparent py-4"
            )}
            role="banner"
        >
            <nav className="max-w-7xl mx-auto flex h-16 w-full items-center justify-between px-6 transition-all duration-300" aria-label="Global Navigation">
                <Link to="/" className="flex items-center gap-3 group" aria-label="Steamline Home">
                    <img src="/logo.png" alt="" className="w-10 h-10 object-contain transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Steamline</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    <ul className="flex items-center gap-8">
                        {links.map((link, i) => (
                            <li key={i}>
                                <a 
                                    className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors" 
                                    href={link.href}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" aria-hidden="true" />
                    <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
                    <Link 
                        to="/register" 
                        className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all active:scale-95 focus:ring-4 focus:ring-orange-100 outline-none"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={toggleMenu} 
                    className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    aria-expanded={open}
                    aria-label="Toggle Menu"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={cn(
                    'fixed inset-0 top-0 bg-white dark:bg-slate-950 z-[101] md:hidden transition-all duration-500 ease-in-out px-6 pt-24 pb-8',
                    open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                )}
                aria-hidden={!open}
            >
                <button 
                    onClick={() => setOpen(false)}
                    className="absolute top-6 right-6 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <X size={32} />
                </button>
                <ul className="flex flex-col gap-8">
                    {links.map((link) => (
                        <li key={link.label}>
                            <a 
                                onClick={() => setOpen(false)} 
                                className="text-3xl font-black text-slate-900 dark:text-white block" 
                                href={link.href}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                    <li className="pt-8">
                        <div className="flex flex-col gap-4">
                            <Link onClick={() => setOpen(false)} to="/login" className="text-center py-5 rounded-2xl font-black text-xl text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">Sign In</Link>
                            <Link onClick={() => setOpen(false)} to="/register" className="bg-orange-600 text-white py-5 rounded-2xl text-center font-black text-xl shadow-lg shadow-orange-200">Get Started</Link>
                        </div>
                    </li>
                </ul>
            </div>
        </header>
    );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, Sun, Moon, Trash2, CheckCircle, Package } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { useNotificationStore } from './ui/Notification';

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { notifications, removeNotification } = useNotificationStore();

    useEffect(() => setMounted(true), []);

    return (
        <header className="topbar-container no-print sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800 h-16 px-4 md:px-8 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="p-2 md:hidden hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
                    aria-label="Toggle Theme"
                >
                    {mounted && (theme === 'dark' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} />)}
                </button>

                {/* Notification Bell with Popover */}
                <Popover.Root>
                    <Popover.Trigger asChild>
                        <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors outline-none">
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-orange-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 animate-in zoom-in">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content 
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl w-80 max-w-[calc(100vw-2rem)] p-0 z-[250] animate-in fade-in slide-in-from-top-2 duration-300"
                            align="end"
                            sideOffset={8}
                        >
                            <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">Notifikasi</h4>
                                <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-[10px] font-black rounded-full">Baru</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-12 px-6 text-center">
                                        <Bell size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-800" />
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tidak ada notifikasi baru</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 transition-colors group flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 flex-shrink-0">
                                                    {n.type === 'success' ? <CheckCircle size={16} /> : <Package size={16} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight mb-1">{n.title}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-normal">{n.description}</p>
                                                </div>
                                                <button 
                                                    onClick={() => removeNotification(n.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center rounded-b-2xl">
                                    <button 
                                        onClick={() => notifications.forEach(n => removeNotification(n.id))}
                                        className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
                                    >
                                        Hapus Semua
                                    </button>
                                </div>
                            )}
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors outline-none group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight group-hover:text-orange-600 transition-colors">{user?.full_name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black shadow-lg shadow-orange-100 dark:shadow-none border-2 border-white dark:border-slate-800 transform transition-transform group-hover:scale-105">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content 
                            className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-56 animate-in slide-in-from-top-2 duration-200 z-[200] mt-2"
                            align="end"
                        >
                            <div className="px-3 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.username}</p>
                            </div>
                            <Link to="/app/settings">
                                <DropdownMenu.Item className="px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-orange-600 rounded-xl outline-none cursor-pointer transition-colors">
                                    Profile Settings
                                </DropdownMenu.Item>
                            </Link>
                            <DropdownMenu.Separator className="h-px bg-slate-50 dark:bg-slate-800 my-1" />
                            <DropdownMenu.Item 
                                onClick={logout}
                                className="px-3 py-2.5 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl outline-none cursor-pointer transition-colors"
                            >
                                Sign Out
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    );
};

export default Topbar;

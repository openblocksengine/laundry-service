import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Settings, 
    Users,
    Truck, 
    PackageSearch,
    PlusCircle
} from 'lucide-react';

const Layout = () => {
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard', roles: ['admin', 'cashier', 'customer', 'driver'] },
        { label: 'Orders & POS', icon: <ShoppingCart size={20} />, href: '/orders', roles: ['admin', 'cashier'] },
        { label: 'Services', icon: <Settings size={20} />, href: '/services', roles: ['admin'] },
        { label: 'Users', icon: <Users size={20} />, href: '/users', roles: ['admin'] },
        { label: 'Logistics', icon: <Truck size={20} />, href: '/logistics', roles: ['admin', 'driver'] },
        { label: 'Pesan Laundry', icon: <PlusCircle size={20} />, href: '/new-order', roles: ['customer'] },
        { label: 'My Orders', icon: <PackageSearch size={20} />, href: '/my-orders', roles: ['customer'] },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <div className="app-container">
            <Sidebar 
                menuItems={filteredMenu} 
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
            />
            <main className="main-wrapper">
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <section className="content-container">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default Layout;
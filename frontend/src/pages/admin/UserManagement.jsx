import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { 
    Users, 
    ShieldCheck, 
    User as UserIcon, 
    Loader2, 
    Search, 
    Save, 
    ArrowRight,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { useNotificationStore } from '../../components/ui/Notification';
import { cn } from '../../lib/utils';

const UserManagement = () => {
    const { addNotification } = useNotificationStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
            addNotification({
                title: 'Gagal',
                description: 'Terjadi kesalahan saat mengambil data pengguna.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(user => 
            user.id === userId ? { ...user, role: newRole, isDirty: true } : user
        ));
    };

    const handleSaveRole = async (user) => {
        setSavingId(user.id);
        try {
            await axios.put(`/users/${user.id}`, { role: user.role });
            addNotification({
                title: 'Role Diperbarui',
                description: `Role untuk ${user.full_name} telah berhasil diubah menjadi ${user.role}.`,
                type: 'success'
            });
            // Mark as not dirty
            setUsers(users.map(u => 
                u.id === user.id ? { ...u, isDirty: false } : u
            ));
        } catch (error) {
            addNotification({
                title: 'Gagal',
                description: 'Terjadi kesalahan saat memperbarui role pengguna.',
                type: 'error'
            });
        } finally {
            setSavingId(null);
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-500';
            case 'cashier': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-500';
            case 'driver': return 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-500';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400';
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h2>
                    <p className="text-slate-500 font-medium">Kelola hak akses dan peran pengguna dalam sistem.</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="input-field pl-10 py-2.5 text-sm bg-white dark:bg-slate-900 shadow-sm" 
                            placeholder="Cari user..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengguna</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Username</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role Saat Ini</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Update Role</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-orange-600" size={40} />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-bold">
                                        Tidak ada pengguna ditemukan.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <UserIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                                                <p className="text-xs text-slate-500">{user.phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">@{user.username}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            getRoleBadgeColor(user.role)
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <select 
                                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-600 outline-none cursor-pointer"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="driver">Driver</option>
                                            <option value="customer">Customer</option>
                                        </select>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button 
                                            onClick={() => handleSaveRole(user)}
                                            disabled={!user.isDirty || savingId === user.id}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all",
                                                user.isDirty 
                                                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 active:scale-95" 
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                            )}
                                        >
                                            {savingId === user.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Save size={14} />
                                            )}
                                            {user.isDirty ? 'SIMPAN' : 'TERSIMPAN'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 bg-orange-50 dark:bg-orange-950/20 rounded-[2rem] p-8 border border-orange-100 dark:border-orange-900/30 flex items-start gap-5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-orange-600">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Peringatan Keamanan</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Mengubah role pengguna akan langsung mempengaruhi hak akses mereka ke fitur-fitur sistem. 
                        Pastikan Anda memberikan akses yang sesuai dengan tanggung jawab masing-masing personil.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, User, LogOut } from 'lucide-react';

export const ProtectedLayout = () => {
    const { user, loading, signOut } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen pb-24">
            <header className="glass-header px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl m-0">FinFlow</h1>
                <button onClick={() => signOut()} className="p-2 opacity-70 hover:opacity-100">
                    <LogOut size={20} />
                </button>
            </header>

            <main className="app-container">
                <Outlet />
            </main>

            <nav className="glass-panel bottom-nav">
                <NavLink to="/" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-primary bg-white/10' : 'text-muted'}`}>
                    <LayoutDashboard size={24} />
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-primary bg-white/10' : 'text-muted'}`}>
                    <Wallet size={24} />
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'text-primary bg-white/10' : 'text-muted'}`}>
                    <User size={24} />
                </NavLink>
            </nav>
        </div>
    );
};

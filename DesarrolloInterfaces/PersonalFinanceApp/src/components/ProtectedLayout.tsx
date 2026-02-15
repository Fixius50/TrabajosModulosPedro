import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, User } from 'lucide-react';

export const ProtectedLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen pb-24">


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

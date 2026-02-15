import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuickAddMenu from '../features/fantasy/QuickAddMenu';

export const ProtectedLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen pb-24">


            <main className="app-container">
                <Outlet />
            </main>



            <QuickAddMenu />
        </div>
    );
};

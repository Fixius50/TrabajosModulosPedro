import { Outlet } from 'react-router-dom';
import RadialMenu from './RadialMenu';

export default function AppLayout() {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Page Content */}
            <Outlet />

            {/* Global Navigation */}
            <RadialMenu />
        </div>
    );
}

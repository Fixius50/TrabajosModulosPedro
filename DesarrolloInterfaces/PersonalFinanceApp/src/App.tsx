import { useEffect, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './lib/queryClient';
import { StealthProvider } from './context/StealthContext';
import { dataSyncService } from './services/dataSyncService';
import { SessionTimeoutProvider } from './context/SessionTimeoutContext';
import AnimatedRoutes from './components/AnimatedRoutes';
import './lib/i18n';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Lazy load components for code splitting
// Components are now loaded in AnimatedRoutes.tsx


function App() {
  useEffect(() => {
    // Start background sync on mount
    dataSyncService.startSync();

    // Cleanup on unmount
    return () => {
      dataSyncService.stopSync();
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <StealthProvider>
            <BrowserRouter>
              <Suspense fallback={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  background: '#0f172a',
                  color: '#8b5cf6',
                  fontSize: '1.25rem'
                }}>
                  Cargando...
                </div>
              }>
                <SessionTimeoutProvider>
                  <AnimatedRoutes />
                </SessionTimeoutProvider>
              </Suspense>
            </BrowserRouter>
          </StealthProvider>
        </AuthProvider>
      </QueryProvider>
    </GlobalErrorBoundary>
  );
}

export default App;

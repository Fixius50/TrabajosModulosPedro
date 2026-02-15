import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './lib/queryClient';
import { ProtectedLayout } from './components/ProtectedLayout';
import { StealthProvider } from './context/StealthContext';
import './lib/i18n';
import './index.css';

// Lazy load components for code splitting
const GrimoireDashboard = lazy(() => import('./features/fantasy/GrimoireDashboard'));
const LoginScreen = lazy(() => import('./features/auth/LoginScreen'));
const HeroHall = lazy(() => import('./features/auth/HeroHall'));
const AddTransaction = lazy(() => import('./features/dashboard/AddTransaction'));
const DebtTracker = lazy(() => import('./features/fantasy/DebtTracker'));
const FinancialScore = lazy(() => import('./features/fantasy/FinancialScore'));
const SharedAccounts = lazy(() => import('./features/fantasy/SharedAccounts'));
const MercenaryContracts = lazy(() => import('./features/fantasy/MercenaryContracts'));
const TreasureChests = lazy(() => import('./features/fantasy/TreasureChests'));
const AdventurerLicense = lazy(() => import('./features/fantasy/AdventurerLicense'));

import { dataSyncService } from './services/dataSyncService';

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
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/hero-hall" element={<HeroHall />} />

                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<GrimoireDashboard />} />
                  <Route path="/app" element={<GrimoireDashboard />} />
                  <Route path="/add-transaction" element={<AddTransaction />} />
                  <Route path="/debt-tracker" element={<DebtTracker />} />
                  <Route path="/financial-score" element={<FinancialScore />} />
                  <Route path="/shared-accounts" element={<SharedAccounts />} />
                  <Route path="/mercenary-contracts" element={<MercenaryContracts />} />
                  <Route path="/treasure-chests" element={<TreasureChests />} />
                  <Route path="/adventurer-license" element={<AdventurerLicense />} />
                  <Route path="/profile" element={<h2>Profile</h2>} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </StealthProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

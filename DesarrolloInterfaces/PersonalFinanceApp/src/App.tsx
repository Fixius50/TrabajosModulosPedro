import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './lib/queryClient';
import { ProtectedLayout } from './components/ProtectedLayout';
import './lib/i18n';
import './index.css';

// Components
import GrimoireDashboard from './features/fantasy/GrimoireDashboard';
import LoginScreen from './features/auth/LoginScreen';
import HeroHall from './features/auth/HeroHall';
import AddTransaction from './features/dashboard/AddTransaction';
import DebtTracker from './features/fantasy/DebtTracker';
import FinancialScore from './features/fantasy/FinancialScore';
import SharedAccounts from './features/fantasy/SharedAccounts';
// // import MercenaryContracts from './features/fantasy/ContractsFeature';
import TreasureChests from './features/fantasy/TreasureChests';
import AdventurerLicense from './features/fantasy/AdventurerLicense';
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
        <BrowserRouter>
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
              {/* <Route path="/mercenary-contracts" element={<MercenaryContracts />} /> */}
              <Route path="/treasure-chests" element={<TreasureChests />} />
              <Route path="/adventurer-license" element={<AdventurerLicense />} />
              <Route path="/profile" element={<h2>Profile</h2>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

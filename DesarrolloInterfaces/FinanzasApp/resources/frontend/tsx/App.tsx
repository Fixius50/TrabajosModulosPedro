import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import MainTabs from './MainTabs';
import Layout from './Layout';
import AuthPage from './AuthPage';
import { RoyalVaults } from './features/accounts/RoyalVaults';
import { DungeonLoading } from './components/common/DungeonLoading';
import { ErrorProvider } from './context/ErrorContext';
import { GlobalErrorModal } from './components/common/GlobalErrorModal';

/* Core Ionic & Theme */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '../css/variables.css';
import '../css/index.css';

import { supabase } from '../ts/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import i18n from '../ts/config';

setupIonicReact({ mode: 'md', animated: true });

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [i18nReady, setI18nReady] = useState(i18n.isInitialized);

  // Controla si la animación de login ha terminado.
  // Evita que la app cambie de página inmediatamente al recibir la sesión de Supabase,
  // permitiendo que la animación 3D "Reveal" termine su curso.
  const [authAnimationDone, setAuthAnimationDone] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);

      // Si ya hay sesión al iniciar (recarga de página), no esperamos animación.
      if (s) {
        setAuthAnimationDone(true);
      }

      setLoading(false);
    };

    if (!i18nReady) {
      i18n.on('initialized', () => setI18nReady(true));
      // Fallback check
      if (i18n.isInitialized) setI18nReady(true);
    }

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      // Si el usuario cierra sesión, reseteamos el estado de animación.
      // NOTA: Al iniciar sesión (newSession existe), NO ponemos authAnimationDone a true aquí.
      // Esperamos a que AuthPage llame a onLoginSuccess.
      if (!newSession) {
        setAuthAnimationDone(false);
        setIsAppUnlocked(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [selectedVault, setSelectedVault] = useState<any>(null);
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      const fetchVaults = async () => {
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          console.error("Error fetching vaults:", error);
          return;
        }

        if (data && data.length > 0) {
          setVaults(data.map(v => ({
            ...v,
            appearance: v.type === 'savings' ? 'gold' : 'iron'
          })));
        } else {
          // Si no hay bóvedas, re-intentamos en 2 segundos por si el registro aún está insertando
          setTimeout(fetchVaults, 2000);
        }
      };
      fetchVaults();
    }
  }, [session]);

  if (loading || !i18nReady) return (
    <DungeonLoading />
  );

  const showVaultSelector = session && authAnimationDone && !selectedVault;
  const showProtectedApp = session && authAnimationDone && selectedVault;

  return (
    <ErrorProvider>
      <IonApp>
        <GlobalErrorModal />
        <BrowserRouter>
          {showProtectedApp ? (
            <Layout>
              <Routes>
                <Route path="/app/*" element={<MainTabs isAppUnlocked={isAppUnlocked} onUnlock={() => setIsAppUnlocked(true)} />} />
                <Route path="/" element={<Navigate to="/app/dashboard" />} />
                <Route path="*" element={<Navigate to="/app/dashboard" />} />
              </Routes>
            </Layout>
          ) : showVaultSelector ? (
            <Routes>
              <Route path="/" element={<RoyalVaults vaults={vaults} onSelect={(v) => setSelectedVault(v)} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<AuthPage onLoginSuccess={() => setAuthAnimationDone(true)} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </BrowserRouter>
      </IonApp>
    </ErrorProvider>
  );
};

export default App;

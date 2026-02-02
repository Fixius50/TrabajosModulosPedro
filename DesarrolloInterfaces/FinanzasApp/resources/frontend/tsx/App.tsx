import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import MainTabs from './MainTabs';
import Layout from './Layout';
import AuthPage from './AuthPage';

/* Core Ionic & Theme */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '../css/variables.css';
import '../css/index.css';

import { supabase } from '../ts/supabaseClient';
import type { Session } from '@supabase/supabase-js';

setupIonicReact({ mode: 'md', animated: false });

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setLoading(false);
    };
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ background: '#000', color: '#d4af37', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>CARGANDO...</h1>
    </div>
  );

  return (
    <IonApp>
      <BrowserRouter>
        {session ? (
          <Layout>
            <Routes>
              <Route path="/app/*" element={<MainTabs isAppUnlocked={true} onUnlock={() => { }} />} />
              <Route path="/" element={<Navigate to="/app/dashboard" />} />
              <Route path="*" element={<Navigate to="/app/dashboard" />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<AuthPage onLoginSuccess={() => { }} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </IonApp>
  );
};

export default App;

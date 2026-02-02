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
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);

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

  if (loading) return (
    <div style={{ background: '#000', color: '#d4af37', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>CARGANDO...</h1>
    </div>
  );

  // Lógica crítica: Solo mostramos la app principal si hay sesión Y la animación terminó.
  const showProtectedApp = session && authAnimationDone;

  return (
    <IonApp>
      <BrowserRouter>
        {showProtectedApp ? (
          <Layout>
            <Routes>
              <Route path="/app/*" element={<MainTabs isAppUnlocked={isAppUnlocked} onUnlock={() => setIsAppUnlocked(true)} />} />
              <Route path="/" element={<Navigate to="/app/dashboard" />} />
              <Route path="*" element={<Navigate to="/app/dashboard" />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/" element={<AuthPage onLoginSuccess={() => setAuthAnimationDone(true)} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </BrowserRouter>
    </IonApp>
  );
};

export default App;

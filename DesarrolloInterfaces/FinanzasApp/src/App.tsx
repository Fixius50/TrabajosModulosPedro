import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { IonApp, setupIonicReact, IonLoading } from '@ionic/react';
import Login from './pages/Login';
import Register from './pages/Register';
import MainTabs from './components/MainTabs';
import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { recurringService } from './services/recurring.service';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

setupIonicReact();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // GUARANTEED 3-SECOND MAXIMUM - App WILL load no matter what
    const forceLoadTimeout = setTimeout(() => {
      console.warn("[EMERGENCY TIMEOUT] Forcing app load after 3 seconds");
      if (mounted) setLoading(false);
    }, 3000);

    const initApp = async () => {
      try {
        // 1. Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (mounted) {
          if (error) console.error("Session check error:", error);
          setSession(initialSession);
        }

        // 2. Process recurring transactions (Non-blocking)
        recurringService.processDueRecurrences().catch(e => console.warn("Recurring task error:", e));

      } catch (err) {
        console.error("Critical App Init Error:", err);
      } finally {
        if (mounted) {
          clearTimeout(forceLoadTimeout);
          setLoading(false);
        }
      }
    };

    initApp();

    // 3. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false); // Ensure loading is off on auth change
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceLoadTimeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <IonApp>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', flexDirection: 'column' }}>
          <IonLoading isOpen={true} message="Cargando..." spinner="crescent" />
          <p style={{ marginTop: '20px', color: '#666' }}>Iniciando aplicación...</p>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <BrowserRouter>
        {session ? (
          <>
            <Menu />
            <div id="main" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
              <Routes>
                <Route path="/app/*" element={<MainTabs />} />
                <Route path="/" element={<Navigate to="/app/dashboard" />} />
                <Route path="/login" element={<Navigate to="/app/dashboard" />} />
                <Route path="/register" element={<Navigate to="/app/dashboard" />} />
                <Route path="*" element={<Navigate to="/app/dashboard" />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app/*" element={<Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </IonApp>
  );
};

export default App;
